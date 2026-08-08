-- Search tags for a product.
--
-- Written by the upload analysis alongside the title and description, and
-- editable by the creator afterwards. Stored as a text[] rather than a join
-- table: tags here are a small, unshared list per product with no identity of
-- their own, so a table would buy nothing but joins.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];

-- GIN makes containment ("products tagged 'recipes'") cheap once a search
-- surface exists. Small table today; the index costs nothing to add early.
CREATE INDEX IF NOT EXISTS products_tags_idx
  ON public.products USING GIN (tags);
