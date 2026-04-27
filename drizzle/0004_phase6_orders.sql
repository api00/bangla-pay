-- =====================================================================
-- Phase 6 — relax orders.total_paisa to allow free orders.
-- Free products legitimately produce zero-amount orders that still need
-- to capture the supporter (email + delivery).
-- =====================================================================

ALTER TABLE "orders"
  DROP CONSTRAINT IF EXISTS "orders_total_positive";

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_total_nonneg" CHECK ("total_paisa" >= 0);
