-- Hybrid product delivery:
--   ebooks -> private reader, audio -> private player, design assets -> download.
-- Buyers keep a durable entitlement while browser access uses short-lived,
-- hashed tokens. Every first token use is recorded as an access event.

DO $$ BEGIN
  CREATE TYPE "delivery_mode" AS ENUM (
    'view_only',
    'stream_only',
    'download'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "access_event_kind" AS ENUM (
    'view',
    'stream',
    'download'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS delivery_mode "delivery_mode"
  NOT NULL DEFAULT 'download';

UPDATE public.products
   SET delivery_mode = CASE category
     WHEN 'ebook' THEN 'view_only'::delivery_mode
     WHEN 'audio' THEN 'stream_only'::delivery_mode
     ELSE 'download'::delivery_mode
   END;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_delivery_matches_category;

ALTER TABLE public.products
  ADD CONSTRAINT products_delivery_matches_category CHECK (
    category IS NULL
    OR (category = 'ebook' AND delivery_mode IN ('view_only', 'download'))
    OR (category = 'audio' AND delivery_mode IN ('stream_only', 'download'))
    OR (category = 'design_asset' AND delivery_mode = 'download')
  );

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_code text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS license_accepted_at timestamptz;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS license_version text;

UPDATE public.orders
   SET order_code = 'BP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
 WHERE order_code IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN order_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_code_unique
  ON public.orders (order_code);

ALTER TABLE public.order_downloads
  ADD COLUMN IF NOT EXISTS access_mode "delivery_mode"
  NOT NULL DEFAULT 'download';

UPDATE public.order_downloads od
   SET access_mode = p.delivery_mode
  FROM public.order_items oi
  JOIN public.products p ON p.id = oi.product_id
 WHERE oi.id = od.order_item_id;

ALTER TABLE public.order_downloads
  ALTER COLUMN expires_at DROP NOT NULL;

UPDATE public.order_downloads
   SET expires_at = NULL;

CREATE TABLE IF NOT EXISTS public.media_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_download_id uuid NOT NULL
    REFERENCES public.order_downloads(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  first_accessed_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS media_access_tokens_hash_unique
  ON public.media_access_tokens (token_hash);

CREATE INDEX IF NOT EXISTS media_access_tokens_entitlement_idx
  ON public.media_access_tokens (order_download_id);

CREATE INDEX IF NOT EXISTS media_access_tokens_expires_idx
  ON public.media_access_tokens (expires_at);

CREATE TABLE IF NOT EXISTS public.content_access_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL
    REFERENCES public.orders(id) ON DELETE CASCADE,
  order_download_id uuid NOT NULL
    REFERENCES public.order_downloads(id) ON DELETE CASCADE,
  supporter_id uuid
    REFERENCES public.supporters(id) ON DELETE SET NULL,
  kind "access_event_kind" NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_access_events_order_idx
  ON public.content_access_events (order_id, created_at);

CREATE INDEX IF NOT EXISTS content_access_events_entitlement_idx
  ON public.content_access_events (order_download_id);

ALTER TABLE public.media_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_access_events ENABLE ROW LEVEL SECURITY;

-- No client policies: both tables are only read or written by server routes.
