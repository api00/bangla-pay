import type { ProductFile } from "@/db/schema";

import FileTypeIcon, { detectFileKind } from "./FileTypeIcon";

interface ProductFilesPreviewProps {
  files: ProductFile[];
  /** When true, hide bytes per file (creator's own dashboard view). */
  hideSizes?: boolean;
}

const SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"];

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "—";
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value < 10 ? value.toFixed(1) : Math.round(value);
  return `${rounded} ${SIZE_UNITS[unit]}`;
}

/**
 * Drop a leading `<digits>-<digits>-` prefix that tools sometimes prepend
 * (e.g. "1775893589907-862-4.png" → "4.png"). Keep the original if it
 * doesn't match the pattern.
 */
function cleanFilename(filename: string): string {
  const trimmed = filename.replace(/^\d{6,}[-_]\d+[-_]/, "").trim();
  return trimmed || filename;
}

function summary(files: ProductFile[]): string {
  if (files.length === 0) return "Nothing yet.";
  const totalBytes = files.reduce((acc, f) => acc + (f.sizeBytes ?? 0), 0);
  const counts = new Map<string, number>();
  for (const f of files) {
    const k = detectFileKind(f.filename, f.mimeType).label;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const breakdown = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, n]) => `${n} ${label.toLowerCase()}${n > 1 ? "s" : ""}`)
    .join(" · ");
  return `${files.length} file${files.length > 1 ? "s" : ""} · ${formatBytes(totalBytes)} · ${breakdown}`;
}

export default function ProductFilesPreview({
  files,
  hideSizes = false,
}: ProductFilesPreviewProps) {
  if (files.length === 0) return null;
  return (
    <section
      aria-labelledby="what-you-get"
      className="mt-8 rounded-[20px] border border-[rgba(14,15,12,0.06)] bg-white overflow-hidden"
    >
      <header className="px-5 py-4 border-b border-[rgba(14,15,12,0.05)] bg-off-white">
        <p
          id="what-you-get"
          className="text-[12px] font-bold uppercase tracking-[0.2em] text-warm-dark"
        >
          Included content
        </p>
        <p className="text-[12px] text-gray mt-0.5 tabular-nums">
          {summary(files)}
        </p>
      </header>
      <ul className="divide-y divide-[rgba(14,15,12,0.05)]">
        {files.map((file) => {
          const style = detectFileKind(file.filename, file.mimeType);
          const niceName = cleanFilename(file.filename);
          return (
            <li
              key={file.id}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              <div
                className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${style.tileBg} ${style.iconColor}`}
                aria-hidden
              >
                <FileTypeIcon kind={style.kind} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-near-black truncate">
                  {niceName}
                </div>
                <div className="text-[12px] text-gray tabular-nums">
                  {style.label}
                  {!hideSizes && file.sizeBytes
                    ? ` · ${formatBytes(file.sizeBytes)}`
                    : ""}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
