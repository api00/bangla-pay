"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  creatorPages,
  creators,
  creatorCategory,
  tipPresets,
} from "@/db/schema";
import { getCreatorForAction } from "@/lib/auth";
import { parseTakaInput } from "@/lib/money";

const DISPLAY_NAME_MAX = 60;
const BIO_MAX = 280;
const URL_MAX = 200;
const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;
const VALID_CATEGORIES = new Set(creatorCategory.enumValues);

export interface UpdateProfileState {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  savedAt?: number;
}

const EMPTY: UpdateProfileState = { ok: false };

function maybeUrl(value: FormDataEntryValue | null, max = URL_MAX): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > max) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const session = await getCreatorForAction();
  if (!session) return { ...EMPTY, error: "Please sign in again." };
  const { creator } = session;

  const fieldErrors: Record<string, string> = {};

  const displayName =
    typeof formData.get("display_name") === "string"
      ? (formData.get("display_name") as string).trim()
      : "";
  if (!displayName) fieldErrors.display_name = "Display name is required.";
  if (displayName.length > DISPLAY_NAME_MAX)
    fieldErrors.display_name = `Maximum ${DISPLAY_NAME_MAX} characters.`;

  const categoryRaw = formData.get("category");
  if (
    typeof categoryRaw !== "string" ||
    !VALID_CATEGORIES.has(
      categoryRaw as (typeof creatorCategory.enumValues)[number],
    )
  ) {
    fieldErrors.category = "Pick a category.";
  }
  const category = categoryRaw as (typeof creatorCategory.enumValues)[number];

  const bioRaw = formData.get("bio");
  let bio: string | null = null;
  if (typeof bioRaw === "string" && bioRaw.trim().length > 0) {
    bio = bioRaw.trim();
    if (bio.length > BIO_MAX) {
      fieldErrors.bio = `Maximum ${BIO_MAX} characters.`;
    }
  }

  const themeColorRaw = formData.get("theme_color");
  let themeColor = "#9fe870";
  if (typeof themeColorRaw === "string" && themeColorRaw.trim()) {
    const candidate = themeColorRaw.trim();
    if (!HEX_REGEX.test(candidate)) {
      fieldErrors.theme_color = "Use a 6-digit hex color (e.g. #9fe870).";
    } else {
      themeColor = candidate.toLowerCase();
    }
  }

  const chaLabelRaw = formData.get("cha_label");
  const chaLabel =
    typeof chaLabelRaw === "string" && chaLabelRaw.trim()
      ? chaLabelRaw.trim().slice(0, 20)
      : "cha";

  const chaEmojiRaw = formData.get("cha_emoji");
  const chaEmoji =
    typeof chaEmojiRaw === "string" && chaEmojiRaw.trim()
      ? chaEmojiRaw.trim().slice(0, 4)
      : "☕";

  const chaUnitRaw = formData.get("cha_unit_taka");
  let chaUnitPaisa = 5000;
  if (typeof chaUnitRaw === "string" && chaUnitRaw.trim()) {
    const parsed = parseTakaInput(chaUnitRaw);
    if (parsed === null || parsed < 100) {
      fieldErrors.cha_unit_taka = "Must be at least ৳1.";
    } else {
      chaUnitPaisa = parsed;
    }
  }

  const showSupporters = formData.get("show_supporters") === "on";
  const showTotalRaised = formData.get("show_total_raised") === "on";
  const bnNumerals = formData.get("bn_numerals") === "on";

  // avatar/cover are owned by the dedicated upload flow in _image-actions.ts
  // and are NOT touched by this form submission.

  const socialLinks = {
    twitter: maybeUrl(formData.get("social_twitter")) ?? undefined,
    instagram: maybeUrl(formData.get("social_instagram")) ?? undefined,
    youtube: maybeUrl(formData.get("social_youtube")) ?? undefined,
    facebook: maybeUrl(formData.get("social_facebook")) ?? undefined,
    website: maybeUrl(formData.get("social_website")) ?? undefined,
  };

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(creators)
        .set({
          displayName,
          category,
          updatedAt: new Date(),
        })
        .where(eq(creators.id, creator.id));

      await tx
        .update(creatorPages)
        .set({
          bio,
          themeColor,
          chaLabel,
          chaEmoji,
          chaUnitPaisa,
          showSupporters,
          showTotalRaised,
          bnNumerals,
          socialLinks,
          updatedAt: new Date(),
        })
        .where(eq(creatorPages.creatorId, creator.id));
    });
  } catch {
    return { ok: false, error: "Could not save your profile. Please try again." };
  }

  revalidatePath(`/${creator.handle}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings/profile");

  return { ok: true, savedAt: Date.now() };
}

const PRESET_MIN_PAISA = 100; // ৳1
const PRESET_MAX_PAISA = 1_000_000_00; // ৳1,000,000
const MAX_PRESETS = 6;

export interface UpdatePresetsState {
  ok: boolean;
  error?: string;
  savedAt?: number;
}

export async function updateTipPresets(
  _prev: UpdatePresetsState,
  formData: FormData,
): Promise<UpdatePresetsState> {
  const session = await getCreatorForAction();
  if (!session) return { ok: false, error: "Please sign in again." };
  const { creator } = session;

  const inputs: number[] = [];
  for (let i = 0; i < MAX_PRESETS; i += 1) {
    const raw = formData.get(`preset_${i}`);
    if (typeof raw !== "string" || !raw.trim()) continue;
    const paisa = parseTakaInput(raw);
    if (paisa === null) {
      return { ok: false, error: `Preset #${i + 1} is not a valid amount.` };
    }
    if (paisa < PRESET_MIN_PAISA || paisa > PRESET_MAX_PAISA) {
      return {
        ok: false,
        error: `Preset #${i + 1} must be between ৳1 and ৳1,000,000.`,
      };
    }
    inputs.push(paisa);
  }

  if (inputs.length < 1) {
    return { ok: false, error: "Add at least one preset amount." };
  }

  // Replace all presets atomically.
  try {
    await db.transaction(async (tx) => {
      await tx.delete(tipPresets).where(eq(tipPresets.creatorId, creator.id));
      await tx.insert(tipPresets).values(
        inputs.map((amountPaisa, position) => ({
          creatorId: creator.id,
          amountPaisa,
          position,
        })),
      );
    });
  } catch {
    return { ok: false, error: "Could not save presets. Please try again." };
  }

  revalidatePath(`/${creator.handle}`);
  revalidatePath("/dashboard/settings/profile");
  return { ok: true, savedAt: Date.now() };
}
