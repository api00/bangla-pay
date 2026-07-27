import type { ReactNode } from "react";

export type FileKind =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "doc"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "code"
  | "text"
  | "font"
  | "3d"
  | "design"
  | "ebook"
  | "executable"
  | "folder"
  | "generic";

export interface FileTypeStyle {
  kind: FileKind;
  label: string;
  /** Tailwind background class for the icon tile. */
  tileBg: string;
  /** Tailwind text color for the icon glyph. */
  iconColor: string;
}

const STYLE: Record<FileKind, FileTypeStyle> = {
  image: {
    kind: "image",
    label: "Image",
    tileBg: "bg-gradient-to-br from-pastel-green to-light-mint",
    iconColor: "text-dark-green",
  },
  video: {
    kind: "video",
    label: "Video",
    tileBg: "bg-gradient-to-br from-danger-surface to-warning-surface",
    iconColor: "text-heritage-red-ink",
  },
  audio: {
    kind: "audio",
    label: "Audio",
    tileBg: "bg-gradient-to-br from-[#e8e1ff] to-[#f7faf3]",
    iconColor: "text-[#3f2b8c]",
  },
  pdf: {
    kind: "pdf",
    label: "PDF",
    tileBg: "bg-gradient-to-br from-danger-surface to-warning-surface",
    iconColor: "text-heritage-red-ink",
  },
  doc: {
    kind: "doc",
    label: "Document",
    tileBg: "bg-gradient-to-br from-light-mint to-mint-surface",
    iconColor: "text-dark-green",
  },
  spreadsheet: {
    kind: "spreadsheet",
    label: "Spreadsheet",
    tileBg: "bg-gradient-to-br from-pastel-green to-light-mint",
    iconColor: "text-positive",
  },
  presentation: {
    kind: "presentation",
    label: "Slides",
    tileBg: "bg-gradient-to-br from-warning-surface to-danger-surface",
    iconColor: "text-warning-ink",
  },
  archive: {
    kind: "archive",
    label: "Archive",
    tileBg: "bg-gradient-to-br from-light-surface to-off-white",
    iconColor: "text-warm-dark",
  },
  code: {
    kind: "code",
    label: "Code",
    tileBg: "bg-gradient-to-br from-near-black to-dark-green",
    iconColor: "text-wise-green",
  },
  text: {
    kind: "text",
    label: "Text",
    tileBg: "bg-gradient-to-br from-off-white to-light-surface",
    iconColor: "text-warm-dark",
  },
  font: {
    kind: "font",
    label: "Font",
    tileBg: "bg-gradient-to-br from-near-black to-warm-dark",
    iconColor: "text-white",
  },
  "3d": {
    kind: "3d",
    label: "3D",
    tileBg: "bg-gradient-to-br from-[#e8e1ff] to-pastel-green",
    iconColor: "text-[#3f2b8c]",
  },
  design: {
    kind: "design",
    label: "Design",
    tileBg: "bg-gradient-to-br from-danger-surface to-[#e8e1ff]",
    iconColor: "text-heritage-red-ink",
  },
  ebook: {
    kind: "ebook",
    label: "eBook",
    tileBg: "bg-gradient-to-br from-warning-surface to-light-mint",
    iconColor: "text-warning-ink",
  },
  executable: {
    kind: "executable",
    label: "App",
    tileBg: "bg-gradient-to-br from-near-black to-warm-dark",
    iconColor: "text-wise-green",
  },
  folder: {
    kind: "folder",
    label: "Folder",
    tileBg: "bg-gradient-to-br from-warning-surface to-danger-surface",
    iconColor: "text-warning-ink",
  },
  generic: {
    kind: "generic",
    label: "File",
    tileBg: "bg-gradient-to-br from-light-surface to-off-white",
    iconColor: "text-warm-dark",
  },
};

const EXT_MAP: Record<string, FileKind> = {
  // images
  jpg: "image", jpeg: "image", png: "image", webp: "image", gif: "image",
  avif: "image", svg: "image", heic: "image", heif: "image", tiff: "image",
  bmp: "image", ico: "image",
  // raw / camera
  raw: "image", cr2: "image", nef: "image", arw: "image", dng: "image",
  // video
  mp4: "video", mov: "video", webm: "video", mkv: "video", avi: "video",
  m4v: "video", flv: "video", wmv: "video",
  // audio
  mp3: "audio", wav: "audio", flac: "audio", aac: "audio", ogg: "audio",
  m4a: "audio", aiff: "audio", opus: "audio", wma: "audio",
  // documents
  pdf: "pdf",
  doc: "doc", docx: "doc", odt: "doc", rtf: "doc", pages: "doc",
  xls: "spreadsheet", xlsx: "spreadsheet", csv: "spreadsheet",
  numbers: "spreadsheet", ods: "spreadsheet", tsv: "spreadsheet",
  ppt: "presentation", pptx: "presentation", odp: "presentation",
  key: "presentation",
  // ebook
  epub: "ebook", mobi: "ebook", azw: "ebook", azw3: "ebook",
  // archives
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive",
  gz: "archive", bz2: "archive", xz: "archive", iso: "archive",
  dmg: "archive",
  // code
  js: "code", jsx: "code", ts: "code", tsx: "code", py: "code",
  rb: "code", go: "code", rs: "code", java: "code", kt: "code",
  swift: "code", c: "code", cpp: "code", cc: "code", cs: "code",
  php: "code", html: "code", css: "code", json: "code", yaml: "code",
  yml: "code", sh: "code", lua: "code", sql: "code",
  // text
  txt: "text", md: "text", markdown: "text", log: "text", srt: "text",
  // fonts
  ttf: "font", otf: "font", woff: "font", woff2: "font", eot: "font",
  // design
  psd: "design", ai: "design", xd: "design", fig: "design",
  sketch: "design", indd: "design", afdesign: "design", afphoto: "design",
  // 3D / presets
  obj: "3d", fbx: "3d", glb: "3d", gltf: "3d", stl: "3d", blend: "3d",
  c4d: "3d", "3ds": "3d", lrtemplate: "design", xmp: "design",
  // executables
  exe: "executable", apk: "executable", app: "executable", deb: "executable",
  rpm: "executable", msi: "executable",
};

const MIME_PREFIX_MAP: Array<[string, FileKind]> = [
  ["image/", "image"],
  ["video/", "video"],
  ["audio/", "audio"],
  ["text/", "text"],
  ["font/", "font"],
  ["application/pdf", "pdf"],
  ["application/zip", "archive"],
  ["application/x-7z", "archive"],
  ["application/x-rar", "archive"],
  ["application/x-tar", "archive"],
  ["application/gzip", "archive"],
  ["application/json", "code"],
  ["application/javascript", "code"],
  ["application/x-shockwave-flash", "video"],
  ["application/epub", "ebook"],
];

export function detectFileKind(filename: string, mimeType: string): FileTypeStyle {
  // Folders never have an extension and are tracked by mime.
  if (mimeType === "inode/directory") return STYLE.folder;

  for (const [prefix, kind] of MIME_PREFIX_MAP) {
    if (mimeType.startsWith(prefix)) return STYLE[kind];
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext && ext in EXT_MAP) return STYLE[EXT_MAP[ext]];

  return STYLE.generic;
}

interface FileTypeIconProps {
  kind: FileKind;
  className?: string;
}

const ICON_MAP: Record<FileKind, ReactNode> = {
  image: <ImageIcon />,
  video: <VideoIcon />,
  audio: <AudioIcon />,
  pdf: <PdfIcon />,
  doc: <DocIcon />,
  spreadsheet: <SpreadsheetIcon />,
  presentation: <PresentationIcon />,
  archive: <ArchiveIcon />,
  code: <CodeIcon />,
  text: <TextIcon />,
  font: <FontIcon />,
  "3d": <CubeIcon />,
  design: <DesignIcon />,
  ebook: <BookIcon />,
  executable: <ExecutableIcon />,
  folder: <FolderIcon />,
  generic: <FileIcon />,
};

export default function FileTypeIcon({ kind, className }: FileTypeIconProps) {
  return <span className={className}>{ICON_MAP[kind]}</span>;
}

// ---------- Hand-drawn icons (24×24, stroke 1.7) ----------

const baseSvg = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function ImageIcon() {
  return (
    <svg {...baseSvg}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <path d="M3 17l4.5-4.5 4 4 3-3L21 19" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg {...baseSvg}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 9.5 16 12l-6 2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M9 17V7l10-2v10" />
      <circle cx="6" cy="17" r="3" />
      <circle cx="16" cy="15" r="3" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <text x="8" y="17" fontSize="5.4" fontWeight="700" fill="currentColor" stroke="none">PDF</text>
    </svg>
  );
}

function DocIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M8 13h8M8 17h8M8 9h3" />
    </svg>
  );
}

function SpreadsheetIcon() {
  return (
    <svg {...baseSvg}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M3 16h18M9 4v16M15 4v16" />
    </svg>
  );
}

function PresentationIcon() {
  return (
    <svg {...baseSvg}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20l4-4 4 4" />
      <path d="M7 9l3 2 5-3" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg {...baseSvg}>
      <rect x="3" y="3" width="18" height="4" rx="1" />
      <rect x="4" y="7" width="16" height="14" rx="1.5" />
      <path d="M11 11h2v2h-2v2h2v2h-2" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M9 8l-4 4 4 4M15 8l4 4-4 4M14 5l-4 14" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M8 12h8M8 16h8M8 8h2" />
    </svg>
  );
}

function FontIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M5 19l3-12h2.5L13 19" />
      <path d="M6.5 14h5.5" />
      <path d="M14 19l3-8h.5l3 8" />
      <path d="M14.6 16.5h4.4" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M12 2 3 7v10l9 5 9-5V7z" />
      <path d="M3 7l9 5 9-5M12 12v10" />
    </svg>
  );
}

function DesignIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M14 3l7 7-11 11H3v-7L14 3z" />
      <path d="M13 4l7 7" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
      <path d="M5 4v13" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

function ExecutableIcon() {
  return (
    <svg {...baseSvg}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 9l4 3-4 3M14 15h2" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg {...baseSvg}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
