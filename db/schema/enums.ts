import { pgEnum } from "drizzle-orm/pg-core";

// ---------- Money flow enums ----------

export const tipProvider = pgEnum("tip_provider", [
  "bkash",
  "nagad",
  "rocket",
  "sslcommerz",
  "card",
]);

export const tipStatus = pgEnum("tip_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const payoutMethod = pgEnum("payout_method", [
  "bkash",
  "nagad",
  "rocket",
  "beftn",
  "rtgs",
]);

export const payoutStatus = pgEnum("payout_status", [
  "requested",
  "processing",
  "settled",
  "failed",
]);

// ---------- Catalog enums ----------

export const productType = pgEnum("product_type", [
  "digital_download",
  "external_link",
]);

export const productCategory = pgEnum("product_category", [
  "ebook",
  "audio",
  "design_asset",
]);

export const deliveryMode = pgEnum("delivery_mode", [
  "view_only",
  "stream_only",
  "download",
]);

export const pricingModel = pgEnum("pricing_model", [
  "fixed",
  "pay_what_you_want",
  "free",
]);

export const accessEventKind = pgEnum("access_event_kind", [
  "view",
  "stream",
  "download",
]);

// Outcome of reading an uploaded file to pre-fill a product listing.
// `unreadable` is a real answer, not a failure: audio and archives carry no
// text or imagery a model can read, and a blank scan carries nothing either.
export const aiSuggestionStatus = pgEnum("ai_suggestion_status", [
  "ok",
  "unreadable",
  "failed",
]);

// ---------- Profile enums ----------

export const creatorCategory = pgEnum("creator_category", [
  "writer",
  "illustrator",
  "musician",
  "educator",
  "developer",
  "podcaster",
  "video_creator",
  "photographer",
  "other",
]);

export const onboardingStep = pgEnum("onboarding_step", [
  "handle",
  "profile",
  "payout",
  "done",
]);

// ---------- Engagement enums ----------

export const milestoneKind = pgEnum("milestone_kind", [
  "supporter_count",
  "total_raised",
  "product_sales",
]);

export const messageKind = pgEnum("message_kind", ["tip", "order", "direct"]);
