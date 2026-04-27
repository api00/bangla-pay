-- =====================================================================
-- Phase 1 — Row-Level Security
--
-- Strategy:
--   - PUBLIC READ on profile-shaped tables (creators, creator_pages,
--     tip_presets, products) so the public profile page renders without auth.
--   - OWNER-ONLY writes on those tables (creator's own user_id = auth.uid()).
--   - SERVER-ONLY (no anon/authenticated access) on money + private tables
--     (tips, orders, messages, milestones, payouts, payout_methods,
--     analytics_daily, webhooks_log, audit_log, supporters, product_files,
--     order_items, order_downloads, product_variants).
--     These are only ever accessed via the service role from server actions
--     or server routes.
--
-- Apply via:  psql "$DATABASE_URL" -f drizzle/0003_rls.sql
-- =====================================================================

-- Helper: check if the calling user owns a creator row.
CREATE OR REPLACE FUNCTION public.is_creator_owner(p_creator_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.creators
     WHERE id = p_creator_id
       AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_creator_owner(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_creator_owner(uuid) TO anon, authenticated;

-- ---------------------------------------------------------------------
-- creators — public read of profile fields, owner-only writes.
-- ---------------------------------------------------------------------

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "creators_public_read" ON public.creators;
CREATE POLICY "creators_public_read"
  ON public.creators FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "creators_self_insert" ON public.creators;
CREATE POLICY "creators_self_insert"
  ON public.creators FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "creators_self_update" ON public.creators;
CREATE POLICY "creators_self_update"
  ON public.creators FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "creators_self_delete" ON public.creators;
CREATE POLICY "creators_self_delete"
  ON public.creators FOR DELETE
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- creator_pages — public read, owner-only writes.
-- ---------------------------------------------------------------------

ALTER TABLE public.creator_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "creator_pages_public_read" ON public.creator_pages;
CREATE POLICY "creator_pages_public_read"
  ON public.creator_pages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "creator_pages_owner_write" ON public.creator_pages;
CREATE POLICY "creator_pages_owner_write"
  ON public.creator_pages FOR ALL
  USING (public.is_creator_owner(creator_id))
  WITH CHECK (public.is_creator_owner(creator_id));

-- ---------------------------------------------------------------------
-- tip_presets — public read, owner-only writes.
-- ---------------------------------------------------------------------

ALTER TABLE public.tip_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tip_presets_public_read" ON public.tip_presets;
CREATE POLICY "tip_presets_public_read"
  ON public.tip_presets FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "tip_presets_owner_write" ON public.tip_presets;
CREATE POLICY "tip_presets_owner_write"
  ON public.tip_presets FOR ALL
  USING (public.is_creator_owner(creator_id))
  WITH CHECK (public.is_creator_owner(creator_id));

-- ---------------------------------------------------------------------
-- products — public can read PUBLISHED rows; owner reads/writes everything.
-- ---------------------------------------------------------------------

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_published_read" ON public.products;
CREATE POLICY "products_public_published_read"
  ON public.products FOR SELECT
  USING (is_published = true OR public.is_creator_owner(creator_id));

DROP POLICY IF EXISTS "products_owner_write" ON public.products;
CREATE POLICY "products_owner_write"
  ON public.products FOR ALL
  USING (public.is_creator_owner(creator_id))
  WITH CHECK (public.is_creator_owner(creator_id));

-- ---------------------------------------------------------------------
-- product_files / product_variants — owner only. Public access is via
-- server-issued signed URLs (the `/d/{token}` route) which uses service role.
-- ---------------------------------------------------------------------

ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_files_owner_only" ON public.product_files;
CREATE POLICY "product_files_owner_only"
  ON public.product_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
       WHERE p.id = product_files.product_id
         AND public.is_creator_owner(p.creator_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
       WHERE p.id = product_files.product_id
         AND public.is_creator_owner(p.creator_id)
    )
  );

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_variants_public_read" ON public.product_variants;
CREATE POLICY "product_variants_public_read"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
       WHERE p.id = product_variants.product_id
         AND (p.is_published = true OR public.is_creator_owner(p.creator_id))
    )
  );

DROP POLICY IF EXISTS "product_variants_owner_write" ON public.product_variants;
CREATE POLICY "product_variants_owner_write"
  ON public.product_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
       WHERE p.id = product_variants.product_id
         AND public.is_creator_owner(p.creator_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
       WHERE p.id = product_variants.product_id
         AND public.is_creator_owner(p.creator_id)
    )
  );

-- ---------------------------------------------------------------------
-- tips — creator can READ their own, no one writes via API (server-only).
-- We expose anonymized "supporter wall" data through a separate VIEW (Phase 3).
-- ---------------------------------------------------------------------

ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tips_owner_read" ON public.tips;
CREATE POLICY "tips_owner_read"
  ON public.tips FOR SELECT
  USING (public.is_creator_owner(creator_id));

-- ---------------------------------------------------------------------
-- orders / order_items / order_downloads — creator can read. Writes via server.
-- ---------------------------------------------------------------------

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_owner_read" ON public.orders;
CREATE POLICY "orders_owner_read"
  ON public.orders FOR SELECT
  USING (public.is_creator_owner(creator_id));

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_owner_read" ON public.order_items;
CREATE POLICY "order_items_owner_read"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
       WHERE o.id = order_items.order_id
         AND public.is_creator_owner(o.creator_id)
    )
  );

ALTER TABLE public.order_downloads ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policy — service role only.

-- ---------------------------------------------------------------------
-- messages / milestones — creator read+write own, public read of public milestones.
-- ---------------------------------------------------------------------

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_owner_all" ON public.messages;
CREATE POLICY "messages_owner_all"
  ON public.messages FOR ALL
  USING (public.is_creator_owner(creator_id))
  WITH CHECK (public.is_creator_owner(creator_id));

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "milestones_public_read" ON public.milestones;
CREATE POLICY "milestones_public_read"
  ON public.milestones FOR SELECT
  USING (is_public = true OR public.is_creator_owner(creator_id));

DROP POLICY IF EXISTS "milestones_owner_write" ON public.milestones;
CREATE POLICY "milestones_owner_write"
  ON public.milestones FOR ALL
  USING (public.is_creator_owner(creator_id))
  WITH CHECK (public.is_creator_owner(creator_id));

-- ---------------------------------------------------------------------
-- payout_methods / payouts — owner read, server-only writes.
-- ---------------------------------------------------------------------

ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payout_methods_owner_read" ON public.payout_methods;
CREATE POLICY "payout_methods_owner_read"
  ON public.payout_methods FOR SELECT
  USING (public.is_creator_owner(creator_id));

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payouts_owner_read" ON public.payouts;
CREATE POLICY "payouts_owner_read"
  ON public.payouts FOR SELECT
  USING (public.is_creator_owner(creator_id));

-- ---------------------------------------------------------------------
-- supporters / webhooks_log / audit_log / analytics_daily — service-role only.
-- ---------------------------------------------------------------------

ALTER TABLE public.supporters       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks_log     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily  ENABLE ROW LEVEL SECURITY;

-- analytics_daily: creator can read their own row.
DROP POLICY IF EXISTS "analytics_daily_owner_read" ON public.analytics_daily;
CREATE POLICY "analytics_daily_owner_read"
  ON public.analytics_daily FOR SELECT
  USING (public.is_creator_owner(creator_id));

-- supporters: a logged-in supporter can read their own row.
DROP POLICY IF EXISTS "supporters_self_read" ON public.supporters;
CREATE POLICY "supporters_self_read"
  ON public.supporters FOR SELECT
  USING (user_id = auth.uid());
