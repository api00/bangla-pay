-- Phase 9 — multi-image gallery on products.
--
-- One product can carry an ordered list of public image URLs. Index 0 is the
-- canonical cover (the existing `cover_url` becomes a derived view of
-- `gallery_urls[1]`). We keep `cover_url` populated for backward compatibility
-- with anything still reading it directly.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}';

-- Backfill: if a product already has a single cover_url, seed the gallery.
UPDATE public.products
   SET gallery_urls = ARRAY[cover_url]
 WHERE cover_url IS NOT NULL
   AND coalesce(array_length(gallery_urls, 1), 0) = 0;
