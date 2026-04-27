"use server";

import { redirect } from "next/navigation";

import { db } from "@/db";
import { handleIsTaken } from "@/db/queries/creators";
import { creatorPages, creators, tipPresets } from "@/db/schema";
import { normalizeHandle, validateHandle } from "@/lib/handle";
import { createClient } from "@/utils/supabase/server";

export interface ClaimHandleState {
  ok: boolean;
  error?: string;
}

const DEFAULT_TIP_PRESETS = [
  { amountPaisa: 5_000, label: "1 cha", position: 0 },
  { amountPaisa: 10_000, label: "5 cha", position: 1 },
  { amountPaisa: 50_000, label: "25 cha", position: 2 },
];

/**
 * Server Action invoked by the handle form's `useActionState` hook.
 * - Validates handle
 * - Inserts creators + creator_pages + default tip_presets in a transaction
 * - Redirects to next step
 */
export async function claimHandle(
  _prevState: ClaimHandleState,
  formData: FormData,
): Promise<ClaimHandleState> {
  const raw = formData.get("handle");
  if (typeof raw !== "string") {
    return { ok: false, error: "Handle is required." };
  }
  const handle = normalizeHandle(raw);
  const validation = validateHandle(handle);
  if (!validation.ok) {
    return { ok: false, error: validation.reason };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Please sign in again." };
  }

  // Best-effort uniqueness check up front for a clean error message.
  // The DB unique index is the source of truth.
  if (await handleIsTaken(handle)) {
    return { ok: false, error: "That handle is already taken." };
  }

  const email = user.email ?? "";
  if (!email) {
    return { ok: false, error: "Your account is missing an email." };
  }
  const defaultDisplayName = email.split("@")[0] ?? handle;

  try {
    await db.transaction(async (tx) => {
      const [creator] = await tx
        .insert(creators)
        .values({
          userId: user.id,
          handle,
          displayName: defaultDisplayName,
          email,
          onboardingStep: "profile",
        })
        .returning({ id: creators.id });

      if (!creator) throw new Error("Failed to create creator row.");

      await tx.insert(creatorPages).values({ creatorId: creator.id });
      await tx.insert(tipPresets).values(
        DEFAULT_TIP_PRESETS.map((preset) => ({
          creatorId: creator.id,
          ...preset,
        })),
      );
    });
  } catch (error) {
    // Unique violation on handle race — re-render with friendly error.
    const message =
      error instanceof Error && /unique|duplicate/i.test(error.message)
        ? "That handle was just taken. Try another."
        : "Something went wrong saving your handle. Please try again.";
    return { ok: false, error: message };
  }

  redirect("/onboarding/profile");
}
