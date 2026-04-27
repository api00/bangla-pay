"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { getCreatorByHandle } from "@/db/queries/creators";
import { creatorPages, tips } from "@/db/schema";
import { shortId } from "@/lib/ids";
import { parseTakaInput } from "@/lib/money";

const SUPPORTER_NAME_MAX = 60;
const MESSAGE_MAX = 500;
const MIN_TIP_PAISA = 2_000; // ৳20

export interface StartTipState {
  ok: boolean;
  error?: string;
}

/**
 * Start a tip:
 *   1. Validate input
 *   2. Look up creator
 *   3. Insert `tips` row in `pending` status with stub providerRef
 *   4. Redirect to `/checkout/stub/{tipId}`
 *
 * Phase 5 will replace steps (3) and (4) with a real provider call.
 */
export async function startTip(
  _prevState: StartTipState,
  formData: FormData,
): Promise<StartTipState> {
  const handleRaw = formData.get("handle");
  if (typeof handleRaw !== "string" || !handleRaw) {
    return { ok: false, error: "Missing handle." };
  }

  // Resolve effective amount: prefer hidden preset, fall back to custom.
  const amountRaw = formData.get("amount_paisa");
  let amountPaisa = 0;
  if (typeof amountRaw === "string") {
    const parsed = Number.parseInt(amountRaw, 10);
    if (Number.isFinite(parsed)) amountPaisa = parsed;
  }
  if (amountPaisa <= 0) {
    const customRaw = formData.get("custom_amount");
    if (typeof customRaw === "string") {
      const parsed = parseTakaInput(customRaw);
      if (parsed) amountPaisa = parsed;
    }
  }
  if (amountPaisa < MIN_TIP_PAISA) {
    return {
      ok: false,
      error: "Minimum tip is ৳20. Please pick or enter a larger amount.",
    };
  }

  const supporterNameRaw = formData.get("supporter_name");
  const supporterName =
    typeof supporterNameRaw === "string" && supporterNameRaw.trim()
      ? supporterNameRaw.trim().slice(0, SUPPORTER_NAME_MAX)
      : null;

  const messageRaw = formData.get("message");
  const message =
    typeof messageRaw === "string" && messageRaw.trim()
      ? messageRaw.trim().slice(0, MESSAGE_MAX)
      : null;

  const messageIsPublic = formData.get("message_is_public") === "on";

  const creator = await getCreatorByHandle(handleRaw);
  if (!creator) {
    return { ok: false, error: "That creator no longer exists." };
  }

  // Pull the cha unit so we can record a friendly cha_count for the wall.
  const pageRows = await db
    .select({ chaUnitPaisa: creatorPages.chaUnitPaisa })
    .from(creatorPages)
    .where(eq(creatorPages.creatorId, creator.id))
    .limit(1);
  const chaUnit = pageRows[0]?.chaUnitPaisa ?? 5_000;
  const chaCount =
    chaUnit > 0 && amountPaisa % chaUnit === 0 ? amountPaisa / chaUnit : null;

  const providerRef = `stub_${shortId(12)}`;

  let insertedId: string | undefined;
  try {
    const [row] = await db
      .insert(tips)
      .values({
        creatorId: creator.id,
        amountPaisa,
        chaCount,
        supporterName,
        message,
        messageIsPublic,
        provider: "card", // placeholder until Phase 5 wires real providers
        providerRef,
        status: "pending",
      })
      .returning({ id: tips.id });
    insertedId = row?.id;
  } catch {
    return {
      ok: false,
      error: "Couldn't start your tip — please try again in a moment.",
    };
  }

  if (!insertedId) {
    return {
      ok: false,
      error: "Couldn't start your tip — please try again in a moment.",
    };
  }

  redirect(`/checkout/stub/${insertedId}`);
}
