"use server";

import { redirect } from "next/navigation";

import { db } from "@/db";
import { getCreatorByHandle } from "@/db/queries/creators";
import { getPublicProduct } from "@/db/queries/products";
import { orderItems, orders } from "@/db/schema";
import { parseTakaInput } from "@/lib/money";

const NAME_MAX = 60;
const EMAIL_MAX = 200;

export interface StartPurchaseState {
  ok: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Insert a pending order + 1 item, redirect to mock checkout.
 * Re-validates price server-side so PWYW floors and free flows can't be
 * spoofed from the client.
 */
export async function startPurchase(
  _prevState: StartPurchaseState,
  formData: FormData,
): Promise<StartPurchaseState> {
  const handle = formData.get("handle");
  const slug = formData.get("slug");
  if (typeof handle !== "string" || typeof slug !== "string") {
    return { ok: false, error: "Missing product." };
  }

  const creator = await getCreatorByHandle(handle);
  if (!creator) return { ok: false, error: "Creator not found." };

  const bundle = await getPublicProduct(creator.id, slug);
  if (!bundle) return { ok: false, error: "Product not found." };
  const { product } = bundle;

  const emailRaw = formData.get("supporter_email");
  if (typeof emailRaw !== "string" || !emailRaw.trim()) {
    return { ok: false, error: "Email is required so we can send the file." };
  }
  const supporterEmail = emailRaw.trim().toLowerCase().slice(0, EMAIL_MAX);
  if (!EMAIL_REGEX.test(supporterEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const nameRaw = formData.get("supporter_name");
  const supporterName =
    typeof nameRaw === "string" && nameRaw.trim()
      ? nameRaw.trim().slice(0, NAME_MAX)
      : null;

  let unitPricePaisa = product.basePricePaisa;
  if (product.pricingModel === "pay_what_you_want") {
    const customRaw = formData.get("custom_amount");
    if (typeof customRaw === "string" && customRaw.trim()) {
      const parsed = parseTakaInput(customRaw);
      if (parsed === null || parsed < 0) {
        return { ok: false, error: "Enter a valid taka amount." };
      }
      unitPricePaisa = parsed;
    }
    const floor = product.minPricePaisa ?? 0;
    if (unitPricePaisa < floor) {
      return {
        ok: false,
        error: floor > 0
          ? `Minimum is ${floor / 100} taka.`
          : "Pay anything above zero.",
      };
    }
  } else if (product.pricingModel === "free") {
    // Free still creates an order to capture the supporter — pay 0.
    unitPricePaisa = 0;
  }

  if (product.pricingModel !== "free" && unitPricePaisa <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }

  let orderId: string | undefined;
  try {
    await db.transaction(async (tx) => {
      const [orderRow] = await tx
        .insert(orders)
        .values({
          creatorId: creator.id,
          supporterName,
          supporterEmail,
          totalPaisa: unitPricePaisa,
          status: "pending",
          provider: "card",
          providerRef: null,
        })
        .returning({ id: orders.id });
      if (!orderRow) throw new Error("order insert failed");
      orderId = orderRow.id;

      await tx.insert(orderItems).values({
        orderId: orderRow.id,
        productId: product.id,
        productTitleSnapshot: product.title,
        unitPricePaisa,
        quantity: 1,
      });
    });
  } catch {
    return { ok: false, error: "Couldn't start your order. Please try again." };
  }

  if (!orderId) {
    return { ok: false, error: "Couldn't start your order. Please try again." };
  }

  redirect(`/checkout/stub/order/${orderId}`);
}
