ALTER TABLE public.supporters
  ADD COLUMN IF NOT EXISTS library_code_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS supporters_library_code_hash_unique
  ON public.supporters (library_code_hash)
  WHERE library_code_hash IS NOT NULL;
