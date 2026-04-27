"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { getCreatorByUserId } from "@/db/queries/creators";
import { creatorPages, creators } from "@/db/schema";
import { creatorCategory } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";

const DISPLAY_NAME_MAX = 60;
const BIO_MAX = 280;

const VALID_CATEGORIES = new Set(creatorCategory.enumValues);

export interface SaveProfileState {
  ok: boolean;
  error?: string;
}

/** Server Action: save display name, category, bio. Advances onboarding step. */
export async function saveProfile(
  _prevState: SaveProfileState,
  formData: FormData,
): Promise<SaveProfileState> {
  const displayNameRaw = formData.get("display_name");
  const categoryRaw = formData.get("category");
  const bioRaw = formData.get("bio");

  if (typeof displayNameRaw !== "string") {
    return { ok: false, error: "Display name is required." };
  }
  const displayName = displayNameRaw.trim();
  if (!displayName) {
    return { ok: false, error: "Display name is required." };
  }
  if (displayName.length > DISPLAY_NAME_MAX) {
    return {
      ok: false,
      error: `Display name must be ${DISPLAY_NAME_MAX} characters or fewer.`,
    };
  }

  if (typeof categoryRaw !== "string" || !VALID_CATEGORIES.has(categoryRaw as typeof creatorCategory.enumValues[number])) {
    return { ok: false, error: "Pick a category." };
  }
  const category = categoryRaw as typeof creatorCategory.enumValues[number];

  const bio =
    typeof bioRaw === "string" && bioRaw.trim().length > 0
      ? bioRaw.trim()
      : null;
  if (bio && bio.length > BIO_MAX) {
    return { ok: false, error: `Bio must be ${BIO_MAX} characters or fewer.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Please sign in again." };
  }

  const creator = await getCreatorByUserId(user.id);
  if (!creator) {
    redirect("/onboarding/handle");
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(creators)
        .set({
          displayName,
          category,
          onboardingStep: "payout",
          updatedAt: new Date(),
        })
        .where(eq(creators.id, creator.id));

      await tx
        .update(creatorPages)
        .set({ bio, updatedAt: new Date() })
        .where(eq(creatorPages.creatorId, creator.id));
    });
  } catch {
    return {
      ok: false,
      error: "Something went wrong saving your profile. Please try again.",
    };
  }

  redirect("/onboarding/payout");
}
