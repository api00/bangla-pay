-- Let creators sell MCP bundles and developer-tool files as downloads.
-- Text casts keep the new enum value safe to reference in the same migration.

ALTER TYPE public.product_category
  ADD VALUE IF NOT EXISTS 'developer_tool';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_delivery_matches_category;

ALTER TABLE public.products
  ADD CONSTRAINT products_delivery_matches_category CHECK (
    category IS NULL
    OR (category::text = 'ebook' AND delivery_mode::text IN ('view_only', 'download'))
    OR (category::text = 'audio' AND delivery_mode::text IN ('stream_only', 'download'))
    OR (category::text = 'design_asset' AND delivery_mode::text = 'download')
    OR (category::text = 'developer_tool' AND delivery_mode::text = 'download')
  );
