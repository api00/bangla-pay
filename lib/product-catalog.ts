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
export const PERSONAL_LICENSE_VERSION = "personal-v1";

export const DELIVERY_MODES = [
  {
    value: "view_only",
    label: "Read on BanglaPay",
    shortLabel: "Read online",
    description: "Buyers read the PDF in their private BanglaPay library.",
  },
  {
    value: "stream_only",
    label: "Listen on BanglaPay",
    shortLabel: "Stream online",
    description: "Buyers listen in their private BanglaPay library.",
  },
  {
    value: "download",
    label: "Download files",
    shortLabel: "Download",
    description: "Buyers receive the original files after purchase.",
  },
] as const;

export type DeliveryMode = (typeof DELIVERY_MODES)[number]["value"];

const DELIVERY_BY_CATEGORY: Record<
  ProductCategory,
  readonly DeliveryMode[]
> = {
  ebook: ["view_only", "download"],
  audio: ["stream_only", "download"],
  design_asset: ["download"],
};

const DEFAULT_DELIVERY: Record<ProductCategory, DeliveryMode> = {
  ebook: "view_only",
  audio: "stream_only",
  design_asset: "download",
};

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

export function isDeliveryMode(value: unknown): value is DeliveryMode {
  return DELIVERY_MODES.some((mode) => mode.value === value);
}

export function getDefaultDeliveryMode(
  category: ProductCategory,
): DeliveryMode {
  return DEFAULT_DELIVERY[category];
}

export function getAllowedDeliveryModes(
  category: ProductCategory,
): readonly DeliveryMode[] {
  return DELIVERY_BY_CATEGORY[category];
}

export function isDeliveryModeAllowed(
  category: ProductCategory,
  mode: DeliveryMode,
): boolean {
  return DELIVERY_BY_CATEGORY[category].includes(mode);
}

export function getDeliveryMode(mode: DeliveryMode) {
  return DELIVERY_MODES.find((item) => item.value === mode)!;
}

export function getDeliveryModeLabel(mode: DeliveryMode): string {
  return getDeliveryMode(mode).label;
}

export function getDeliveryFileGuidance(
  category: ProductCategory,
  mode: DeliveryMode,
): { accept: string; formats: string } {
  if (mode === "view_only") {
    return { accept: ".pdf", formats: "PDF" };
  }
  if (mode === "stream_only") {
    return { accept: ".mp3,.wav,.m4a", formats: "MP3, WAV, or M4A" };
  }
  const categoryConfig = getProductCategory(category)!;
  return {
    accept: categoryConfig.accept,
    formats: categoryConfig.formats,
  };
}

export function validateDeliveryFile(input: {
  category: ProductCategory;
  deliveryMode: DeliveryMode;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}): string | null {
  const baseError = validateProductFile(input);
  if (baseError) return baseError;

  const filename = input.filename.trim().toLowerCase();
  if (input.deliveryMode === "view_only" && !filename.endsWith(".pdf")) {
    return "Read on BanglaPay currently requires PDF files.";
  }
  if (
    input.deliveryMode === "stream_only" &&
    (!input.mimeType.toLowerCase().startsWith("audio/") ||
      filename.endsWith(".zip"))
  ) {
    return "Listen on BanglaPay requires MP3, WAV, or M4A audio files.";
  }
  return null;
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
