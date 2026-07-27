-- Archiving for products that have already sold.
--
-- product_files cascades from products, and buyers' order_downloads point at
-- those files. Hard-deleting a sold product therefore destroys access to
-- something people already paid for, which is why the delete was blocked.
--
-- Archiving gives the creator a way out: the product disappears from the shop
-- and from every public surface, while the files and entitlements behind it
-- stay intact.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Listings filter on this constantly; keep it cheap.
CREATE INDEX IF NOT EXISTS products_creator_archived_idx
  ON public.products (creator_id, archived_at);
