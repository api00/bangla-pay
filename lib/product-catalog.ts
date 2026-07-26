export const PRODUCT_CATEGORIES = [
  {
    value: "ebook",
    label: "E-books & guides",
    shortLabel: "E-book",
    description: "Books, guides, worksheets, and written resources.",
    formats: "PDF, EPUB, or ZIP",
    accept: ".pdf,.epub,.zip",
  },
  {
    value: "audio",
    label: "Audio products",
    shortLabel: "Audio",
    description: "Songs, sound packs, lessons, and spoken recordings.",
    formats: "MP3, WAV, M4A, or ZIP",
    accept: ".mp3,.wav,.m4a,.zip",
  },
  {
    value: "design_asset",
    label: "Design & image packs",
    shortLabel: "Design pack",
    description: "Original photos, illustrations, templates, and assets.",
    formats: "PNG, JPG, WebP, SVG, or ZIP",
    accept: ".png,.jpg,.jpeg,.webp,.svg,.zip",
  },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"];

export const MAX_PRODUCT_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_PRODUCT_FILENAME_LENGTH = 200;

const CATEGORY_VALUES = new Set<string>(
  PRODUCT_CATEGORIES.map((category) => category.value),
);

const ALLOWED_EXTENSIONS: Record<ProductCategory, ReadonlySet<string>> = {
  ebook: new Set(["pdf", "epub", "zip"]),
  audio: new Set(["mp3", "wav", "m4a", "zip"]),
  design_asset: new Set(["png", "jpg", "jpeg", "webp", "svg", "zip"]),
};

const ALLOWED_MIME_TYPES: Record<string, ReadonlySet<string>> = {
  pdf: new Set(["application/pdf"]),
  epub: new Set(["application/epub+zip", "application/octet-stream"]),
  zip: new Set([
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream",
  ]),
  mp3: new Set(["audio/mpeg", "audio/mp3", "application/octet-stream"]),
  wav: new Set([
    "audio/wav",
    "audio/x-wav",
    "audio/vnd.wave",
    "application/octet-stream",
  ]),
  m4a: new Set(["audio/mp4", "audio/x-m4a", "application/octet-stream"]),
  png: new Set(["image/png"]),
  jpg: new Set(["image/jpeg"]),
  jpeg: new Set(["image/jpeg"]),
  webp: new Set(["image/webp"]),
  svg: new Set(["image/svg+xml"]),
};

export function isProductCategory(value: unknown): value is ProductCategory {
  return typeof value === "string" && CATEGORY_VALUES.has(value);
}

export function getProductCategory(
  value: ProductCategory | null | undefined,
) {
  return PRODUCT_CATEGORIES.find((category) => category.value === value) ?? null;
}

export function getProductCategoryLabel(
  value: ProductCategory | null | undefined,
): string {
  return getProductCategory(value)?.shortLabel ?? "Digital product";
}

export function validateProductFile(input: {
  category: ProductCategory;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}): string | null {
  const { category, filename, mimeType, sizeBytes } = input;

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return "Choose a file that is not empty.";
  }
  if (sizeBytes > MAX_PRODUCT_FILE_BYTES) {
    return "Files must be 50 MB or smaller.";
  }

  const normalizedFilename = filename.trim().toLowerCase();
  const finalDot = normalizedFilename.lastIndexOf(".");
  const extension =
    finalDot > 0 && finalDot < normalizedFilename.length - 1
      ? normalizedFilename.slice(finalDot + 1)
      : null;
  const categoryConfig = getProductCategory(category);
  if (
    !extension ||
    !categoryConfig ||
    !ALLOWED_EXTENSIONS[category].has(extension)
  ) {
    return `Choose a ${categoryConfig?.formats ?? "supported"} file.`;
  }

  const normalizedMime = mimeType.trim().toLowerCase();
  const allowedMimeTypes = ALLOWED_MIME_TYPES[extension];
  if (!allowedMimeTypes?.has(normalizedMime)) {
    return `The file content type does not match .${extension}.`;
  }

  return null;
}
