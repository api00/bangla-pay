"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { getCreatorBalance } from "@/db/queries/payouts";
import {
  payoutMethod as payoutMethodEnum,
  payoutMethods,
  payouts,
} from "@/db/schema";
import { getCreatorForAction } from "@/lib/auth";
import { parseTakaInput } from "@/lib/money";
import { encodePayoutDetails, type PayoutDetails } from "@/lib/payout-crypto";
import { maskBdPhone, normalizeBdPhone } from "@/lib/phone";

const VALID_METHODS = new Set(payoutMethodEnum.enumValues);
const MIN_PAYOUT_PAISA = 100_00; // ৳100 minimum
const ROUTING_REGEX = /^\d{9}$/;

async function requireCreator() {
  const session = await getCreatorForAction();
  return session?.creator ?? null;
}

// ---------------- Add payout method ---------------- //

export interface AddPayoutMethodState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  savedAt?: number;
}

export async function addPayoutMethod(
  _prev: AddPayoutMethodState,
  formData: FormData,
): Promise<AddPayoutMethodState> {
  const creator = await requireCreator();
  if (!creator) return { ok: false, error: "Please sign in again." };

  const methodRaw = formData.get("method");
  if (
    typeof methodRaw !== "string" ||
    !VALID_METHODS.has(methodRaw as (typeof payoutMethodEnum.enumValues)[number])
  ) {
    return { ok: false, error: "Pick a payout method." };
  }
  const method = methodRaw as (typeof payoutMethodEnum.enumValues)[number];

  const fieldErrors: Record<string, string> = {};
  let details: PayoutDetails;
  let label: string;

  if (method === "bkash" || method === "nagad" || method === "rocket") {
    const phoneRaw = formData.get("msisdn");
    if (typeof phoneRaw !== "string" || !phoneRaw.trim()) {
      fieldErrors.msisdn = "Phone number is required.";
    }
    const e164 = typeof phoneRaw === "string" ? normalizeBdPhone(phoneRaw) : null;
    if (!e164) {
      fieldErrors.msisdn =
        fieldErrors.msisdn ?? "Enter a valid Bangladeshi number (01XXXXXXXXX).";
      return { ok: false, fieldErrors };
    }
    details = { type: method, msisdn: e164 };
    label = `${methodLabel(method)} · ${maskBdPhone(e164)}`;
  } else {
    // beftn / rtgs — bank
    const accountName =
      typeof formData.get("account_name") === "string"
        ? (formData.get("account_name") as string).trim()
        : "";
    const accountNumber =
      typeof formData.get("account_number") === "string"
        ? (formData.get("account_number") as string).trim()
        : "";
    const bankName =
      typeof formData.get("bank_name") === "string"
        ? (formData.get("bank_name") as string).trim()
        : "";
    const branchName =
      typeof formData.get("branch_name") === "string"
        ? (formData.get("branch_name") as string).trim()
        : "";
    const routingNumber =
      typeof formData.get("routing_number") === "string"
        ? (formData.get("routing_number") as string).trim()
        : "";

    if (!accountName) fieldErrors.account_name = "Account name is required.";
    if (!accountNumber || !/^[0-9]{6,20}$/.test(accountNumber))
      fieldErrors.account_number =
        "Account number must be 6–20 digits.";
    if (!bankName) fieldErrors.bank_name = "Bank name is required.";
    if (!branchName) fieldErrors.branch_name = "Branch name is required.";
    if (!ROUTING_REGEX.test(routingNumber))
      fieldErrors.routing_number = "Routing number must be 9 digits.";

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, fieldErrors };
    }

    details = {
      type: method,
      accountName,
      accountNumber,
      bankName,
      branchName,
      routingNumber,
    };
    label = `${bankName} · ····${accountNumber.slice(-4)}`;
  }

  const setDefault = formData.get("set_default") === "on";

  try {
    await db.transaction(async (tx) => {
      if (setDefault) {
        await tx
          .update(payoutMethods)
          .set({ isDefault: false })
          .where(eq(payoutMethods.creatorId, creator.id));
      }

      // If no default exists yet, the new one becomes default automatically.
      const existing = await tx
        .select({ id: payoutMethods.id })
        .from(payoutMethods)
        .where(eq(payoutMethods.creatorId, creator.id))
        .limit(1);
      const becomeDefault = setDefault || existing.length === 0;

      await tx.insert(payoutMethods).values({
        creatorId: creator.id,
        method,
        accountLabel: label,
        encryptedDetails: encodePayoutDetails(details),
        isDefault: becomeDefault,
      });
    });
  } catch {
    return { ok: false, error: "Could not save payout method. Please try again." };
  }

  revalidatePath("/dashboard/settings/payouts");
  revalidatePath("/dashboard");
  return { ok: true, savedAt: Date.now() };
}

function methodLabel(
  method: (typeof payoutMethodEnum.enumValues)[number],
): string {
  switch (method) {
    case "bkash":
      return "bKash";
    case "nagad":
      return "Nagad";
    case "rocket":
      return "Rocket";
    case "beftn":
      return "Bank (BEFTN)";
    case "rtgs":
      return "Bank (RTGS)";
  }
}

// ---------------- Set default / remove method ---------------- //

export async function setDefaultPayoutMethod(
  payoutMethodId: string,
): Promise<void> {
  const creator = await requireCreator();
  if (!creator) return;

  await db.transaction(async (tx) => {
    await tx
      .update(payoutMethods)
      .set({ isDefault: false })
      .where(eq(payoutMethods.creatorId, creator.id));

    await tx
      .update(payoutMethods)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(
        and(
          eq(payoutMethods.id, payoutMethodId),
          eq(payoutMethods.creatorId, creator.id),
        ),
      );
  });

  revalidatePath("/dashboard/settings/payouts");
  revalidatePath("/dashboard");
}

export async function removePayoutMethod(
  payoutMethodId: string,
): Promise<{ ok: boolean; error?: string }> {
  const creator = await requireCreator();
  if (!creator) return { ok: false, error: "Please sign in again." };

  // Block removal if any pending/processing payouts reference it.
  const inUse = await db
    .select({ id: payouts.id })
    .from(payouts)
    .where(
      and(
        eq(payouts.payoutMethodId, payoutMethodId),
        ne(payouts.status, "settled"),
        ne(payouts.status, "failed"),
      ),
    )
    .limit(1);

  if (inUse.length > 0) {
    return {
      ok: false,
      error:
        "There's a pending payout on this method. Wait for it to settle before removing.",
    };
  }

  await db
    .delete(payoutMethods)
    .where(
      and(
        eq(payoutMethods.id, payoutMethodId),
        eq(payoutMethods.creatorId, creator.id),
      ),
    );

  revalidatePath("/dashboard/settings/payouts");
  return { ok: true };
}

// ---------------- Request payout ---------------- //

export interface RequestPayoutState {
  ok: boolean;
  error?: string;
  savedAt?: number;
}

export async function requestPayout(
  _prev: RequestPayoutState,
  formData: FormData,
): Promise<RequestPayoutState> {
  const creator = await requireCreator();
  if (!creator) return { ok: false, error: "Please sign in again." };

  const amountRaw = formData.get("amount_taka");
  const methodIdRaw = formData.get("payout_method_id");

  if (typeof methodIdRaw !== "string" || !methodIdRaw) {
    return { ok: false, error: "Pick a payout method." };
  }

  if (typeof amountRaw !== "string" || !amountRaw.trim()) {
    return { ok: false, error: "Enter an amount." };
  }
  const amountPaisa = parseTakaInput(amountRaw);
  if (amountPaisa === null) {
    return { ok: false, error: "That amount isn't valid." };
  }
  if (amountPaisa < MIN_PAYOUT_PAISA) {
    return {
      ok: false,
      error: `Minimum payout is ৳${MIN_PAYOUT_PAISA / 100}.`,
    };
  }

  const balance = await getCreatorBalance(creator.id);
  if (amountPaisa > balance.availablePaisa) {
    return {
      ok: false,
      error: `You only have ৳${(balance.availablePaisa / 100).toLocaleString("en-BD")} available right now.`,
    };
  }

  const [method] = await db
    .select()
    .from(payoutMethods)
    .where(
      and(
        eq(payoutMethods.id, methodIdRaw),
        eq(payoutMethods.creatorId, creator.id),
      ),
    )
    .limit(1);
  if (!method) {
    return { ok: false, error: "Payout method not found." };
  }

  // No fee in v1 (mock). Phase 5 will introduce provider fees.
  const feePaisa = 0;
  const netPaisa = amountPaisa - feePaisa;

  try {
    await db.insert(payouts).values({
      creatorId: creator.id,
      payoutMethodId: method.id,
      method: method.method,
      amountPaisa,
      feePaisa,
      netPaisa,
      status: "requested",
    });
  } catch {
    return { ok: false, error: "Could not submit your payout request." };
  }

  revalidatePath("/dashboard/settings/payouts");
  revalidatePath("/dashboard");
  return { ok: true, savedAt: Date.now() };
}

export async function cancelPayout(payoutId: string): Promise<void> {
  const creator = await requireCreator();
  if (!creator) return;

  // Only `requested` payouts can be cancelled by the creator.
  await db
    .update(payouts)
    .set({ status: "failed", failureReason: "Cancelled by creator" })
    .where(
      and(
        eq(payouts.id, payoutId),
        eq(payouts.creatorId, creator.id),
        eq(payouts.status, "requested"),
      ),
    );

  revalidatePath("/dashboard/settings/payouts");
  revalidatePath("/dashboard");
}
