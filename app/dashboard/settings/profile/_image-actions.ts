"use server";

import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { creatorPages } from "@/db/schema";
import { getCreatorForAction } from "@/lib/auth";
import { creatorImagePath } from "@/lib/storage/buckets";
import {
  publicAssetUrl,
  removePublicAsset,
  signedPublicAssetUpload,
} from "@/lib/storage/signed-urls";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_FILENAME = 200;

export type CreatorImageKind = "avatar" | "cover";

export interface SignCreatorImageInput {
  kind: CreatorImageKind;
  filename: string;
  mimeType: string;
}

export interface SignCreatorImageResult {
  ok: boolean;
  url?: string;
  storagePath?: string;
  error?: string;
}

export async function signCreatorImageUpload(
  input: SignCreatorImageInput,
): Promise<SignCreatorImageResult> {
  const session = await getCreatorForAction();
  if (!session) return { ok: false, error: "Please sign in again." };

  if (typeof input.filename !== "string" || !input.filename.trim()) {
    return { ok: false, error: "Filename is required." };
  }
  if (!ALLOWED_MIME.has(input.mimeType)) {
    return {
      ok: false,
      error: "Only JPEG, PNG, WebP, GIF, or AVIF images are allowed.",
    };
  }
  if (input.kind !== "avatar" && input.kind !== "cover") {
    return { ok: false, error: "Bad image kind." };
  }

  const filename = input.filename.trim().slice(0, MAX_FILENAME);
  const imageId = randomUUID();
  const storagePath = creatorImagePath(
    session.creator.id,
    input.kind,
    imageId,
    filename,
  );

  try {
    const signed = await signedPublicAssetUpload(storagePath);
    return { ok: true, url: signed.url, storagePath: signed.path };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }
}

export interface CommitCreatorImageInput {
  kind: CreatorImageKind;
  storagePath: string;
}

export interface CommitCreatorImageResult {
  ok: boolean;
  publicUrl?: string;
  error?: string;
}

export async function commitCreatorImage(
  input: CommitCreatorImageInput,
): Promise<CommitCreatorImageResult> {
  const session = await getCreatorForAction();
  if (!session) return { ok: false, error: "Please sign in again." };

  if (
    typeof input.storagePath !== "string" ||
    !input.storagePath.startsWith(`creators/${session.creator.id}/profile/`)
  ) {
    return { ok: false, error: "Storage path mismatch." };
  }

  // Look up the previous URL so we can clean up the old object after swap.
  const [page] = await db
    .select({
      avatarUrl: creatorPages.avatarUrl,
      coverUrl: creatorPages.coverUrl,
    })
    .from(creatorPages)
    .where(eq(creatorPages.creatorId, session.creator.id))
    .limit(1);

  const newUrl = publicAssetUrl(input.storagePath);
  const previousUrl =
    input.kind === "avatar" ? page?.avatarUrl : page?.coverUrl;

  try {
    await db
      .update(creatorPages)
      .set({
        ...(input.kind === "avatar"
          ? { avatarUrl: newUrl }
          : { coverUrl: newUrl }),
        updatedAt: new Date(),
      })
      .where(eq(creatorPages.creatorId, session.creator.id));
  } catch {
    return { ok: false, error: "Couldn't save the image." };
  }

  if (previousUrl && previousUrl !== newUrl) {
    const prevPath = pathFromPublicUrl(previousUrl);
    if (prevPath) removePublicAsset(prevPath).catch(() => undefined);
  }

  revalidatePath(`/${session.creator.handle}`);
  revalidatePath("/dashboard/settings/profile");
  revalidatePath("/dashboard");
  return { ok: true, publicUrl: newUrl };
}

export async function clearCreatorImage(
  kind: CreatorImageKind,
): Promise<CommitCreatorImageResult> {
  const session = await getCreatorForAction();
  if (!session) return { ok: false, error: "Please sign in again." };

  const [page] = await db
    .select({
      avatarUrl: creatorPages.avatarUrl,
      coverUrl: creatorPages.coverUrl,
    })
    .from(creatorPages)
    .where(eq(creatorPages.creatorId, session.creator.id))
    .limit(1);

  const previous = kind === "avatar" ? page?.avatarUrl : page?.coverUrl;

  try {
    await db
      .update(creatorPages)
      .set({
        ...(kind === "avatar" ? { avatarUrl: null } : { coverUrl: null }),
        updatedAt: new Date(),
      })
      .where(eq(creatorPages.creatorId, session.creator.id));
  } catch {
    return { ok: false, error: "Couldn't remove the image." };
  }

  if (previous) {
    const path = pathFromPublicUrl(previous);
    if (path) removePublicAsset(path).catch(() => undefined);
  }

  revalidatePath(`/${session.creator.handle}`);
  revalidatePath("/dashboard/settings/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

function pathFromPublicUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/public-assets/";
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  return url.slice(idx + marker.length);
}
