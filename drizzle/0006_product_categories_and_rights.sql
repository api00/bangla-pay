-- Narrow the first BanglaPay shop release to three supported digital-product
-- categories and record the creator's one-time rights declaration.
--
-- Both columns remain nullable for existing products. New products require a
-- category in the server action, and the publish action requires both fields.

DO $$ BEGIN
  CREATE TYPE "product_category" AS ENUM (
    'ebook',
    'audio',
    'design_asset'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category "product_category";

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS rights_confirmed_at timestamptz;

-- Existing listings predate the declaration and cannot be presented as
-- compliant. Keep their data intact, but return them to draft until the
-- creator chooses a category, confirms their rights, and republishes.
UPDATE public.products
   SET is_published = false,
       updated_at = now()
 WHERE is_published = true
   AND (category IS NULL OR rights_confirmed_at IS NULL);
