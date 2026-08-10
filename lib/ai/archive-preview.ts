import "server-only";

import { inflateRawSync } from "node:zlib";

// MCPB files are ZIP archives. We read only small descriptive files for AI
// drafting; uploaded code is never executed and the full archive never leaves
// our server. These bounds also make decompression-bomb inputs harmless.
const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const MAX_ENTRY_BYTES = 256 * 1024;
const MAX_PREVIEW_BYTES = 512 * 1024;
const MAX_PREVIEW_FILES = 6;

interface ZipEntry {
  path: string;
  compression: number;
  compressedBytes: number;
  uncompressedBytes: number;
  localOffset: number;
  priority: number;
}

function previewPriority(path: string): number | null {
  const normalized = path.toLowerCase();
  const basename = normalized.split("/").at(-1);
  if (normalized === "manifest.json") return 0;
  if (basename === "manifest.json") return 1;
  if (basename === "readme.md" || basename === "readme.txt") return 2;
  if (basename === "package.json") return 3;
  if (basename === "server.json") return 4;
  if (basename === "pyproject.toml") return 5;
  return null;
}

function isSafeArchivePath(path: string): boolean {
  const normalized = path.replaceAll("\\", "/");
  return (
    normalized.length > 0 &&
    !normalized.startsWith("/") &&
    !normalized.split("/").includes("..")
  );
}

function findCentralDirectory(buffer: Buffer): {
  entries: number;
  offset: number;
  size: number;
} | null {
  const minimumEocdBytes = 22;
  if (buffer.length < minimumEocdBytes) return null;

  const earliest = Math.max(0, buffer.length - minimumEocdBytes - 0xffff);
  for (
    let cursor = buffer.length - minimumEocdBytes;
    cursor >= earliest;
    cursor -= 1
  ) {
    if (buffer.readUInt32LE(cursor) !== EOCD_SIGNATURE) continue;
    const entries = buffer.readUInt16LE(cursor + 10);
    const size = buffer.readUInt32LE(cursor + 12);
    const offset = buffer.readUInt32LE(cursor + 16);
    // ZIP64 uses sentinel values and needs a different directory structure.
    if (entries === 0xffff || size === 0xffffffff || offset === 0xffffffff) {
      return null;
    }
    if (offset + size > buffer.length) return null;
    return { entries, offset, size };
  }
  return null;
}

function listPreviewEntries(buffer: Buffer): ZipEntry[] {
  const directory = findCentralDirectory(buffer);
  if (!directory) return [];

  const candidates: ZipEntry[] = [];
  let cursor = directory.offset;
  const directoryEnd = directory.offset + directory.size;

  for (let index = 0; index < directory.entries; index += 1) {
    if (cursor + 46 > directoryEnd) break;
    if (buffer.readUInt32LE(cursor) !== CENTRAL_SIGNATURE) break;

    const flags = buffer.readUInt16LE(cursor + 8);
    const compression = buffer.readUInt16LE(cursor + 10);
    const compressedBytes = buffer.readUInt32LE(cursor + 20);
    const uncompressedBytes = buffer.readUInt32LE(cursor + 24);
    const filenameBytes = buffer.readUInt16LE(cursor + 28);
    const extraBytes = buffer.readUInt16LE(cursor + 30);
    const commentBytes = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const next = cursor + 46 + filenameBytes + extraBytes + commentBytes;
    if (next > directoryEnd || cursor + 46 + filenameBytes > buffer.length) break;

    const path = buffer
      .subarray(cursor + 46, cursor + 46 + filenameBytes)
      .toString("utf8")
      .replaceAll("\\", "/");
    const priority = previewPriority(path);
    if (
      priority !== null &&
      isSafeArchivePath(path) &&
      (flags & 1) === 0 &&
      (compression === 0 || compression === 8) &&
      uncompressedBytes > 0 &&
      uncompressedBytes <= MAX_ENTRY_BYTES
    ) {
      candidates.push({
        path,
        compression,
        compressedBytes,
        uncompressedBytes,
        localOffset,
        priority,
      });
    }
    cursor = next;
  }

  return candidates
    .sort((left, right) => left.priority - right.priority)
    .slice(0, MAX_PREVIEW_FILES);
}

function readEntry(buffer: Buffer, entry: ZipEntry): string | null {
  const offset = entry.localOffset;
  if (offset + 30 > buffer.length) return null;
  if (buffer.readUInt32LE(offset) !== LOCAL_SIGNATURE) return null;

  const filenameBytes = buffer.readUInt16LE(offset + 26);
  const extraBytes = buffer.readUInt16LE(offset + 28);
  const dataStart = offset + 30 + filenameBytes + extraBytes;
  const dataEnd = dataStart + entry.compressedBytes;
  if (dataEnd > buffer.length) return null;

  const compressed = buffer.subarray(dataStart, dataEnd);
  let output: Buffer;
  try {
    output =
      entry.compression === 0
        ? Buffer.from(compressed)
        : inflateRawSync(compressed, { maxOutputLength: MAX_ENTRY_BYTES });
  } catch {
    return null;
  }
  if (output.length !== entry.uncompressedBytes || output.includes(0)) {
    return null;
  }

  const text = output.toString("utf8").trim();
  return text || null;
}

/** Extract a bounded, human-readable description from a ZIP/MCPB bundle. */
export function extractArchivePreview(bytes: Uint8Array): string | null {
  const buffer = Buffer.from(bytes);
  const sections: string[] = [];
  let totalBytes = 0;

  for (const entry of listPreviewEntries(buffer)) {
    const text = readEntry(buffer, entry);
    if (!text) continue;
    const section = `--- ${entry.path} ---\n${text}`;
    const sectionBytes = Buffer.byteLength(section, "utf8");
    if (totalBytes + sectionBytes > MAX_PREVIEW_BYTES) break;
    sections.push(section);
    totalBytes += sectionBytes;
  }

  return sections.length > 0 ? sections.join("\n\n") : null;
}
