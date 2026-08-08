-- Cache + audit trail for reading an uploaded file into listing fields.
--
-- Two jobs:
--   1. Stop paying twice. The wizard can be revisited and stepped back
--      through; re-reading a 40-page PDF each time is money for nothing.
--   2. Record what was machine-written. A creator editing a suggested
--      description should leave a trace that the first draft wasn't theirs.
--
-- `suggestion` holds the already-validated payload, never the raw model
-- response, so no reader has to re-check it.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_suggestion_status') THEN
    -- 'unreadable' is an outcome, not an error: audio and archives carry
    -- nothing a model can read, and neither does a blank scan.
    CREATE TYPE public.ai_suggestion_status AS ENUM ('ok', 'unreadable', 'failed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.product_ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  -- Cascades with the file: a suggestion about a deleted upload is noise.
  product_file_id uuid NOT NULL REFERENCES public.product_files (id) ON DELETE CASCADE,
  status public.ai_suggestion_status NOT NULL,
  model text NOT NULL,
  suggestion jsonb,
  failure_reason text,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- The cache lookup: "have we already read this exact file?"
CREATE INDEX IF NOT EXISTS product_ai_suggestions_file_idx
  ON public.product_ai_suggestions (product_file_id);

CREATE INDEX IF NOT EXISTS product_ai_suggestions_product_idx
  ON public.product_ai_suggestions (product_id);

-- Reached only through server actions holding the service role, which check
-- creator ownership first. RLS on with no policy = deny all by default, which
-- is the intended posture for anon/authenticated clients.
ALTER TABLE public.product_ai_suggestions ENABLE ROW LEVEL SECURITY;
