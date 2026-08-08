-- What the supporter messages add up to: how happy the community is, and
-- what they keep asking for next.
--
-- Stored rather than computed on view. Reading every message on each
-- dashboard load would bill the creator for a page refresh, so a row is kept
-- and reused until new messages arrive — messages_analysed and
-- latest_message_at together are the cache key.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fan_mood') THEN
    -- Ordered worst to best so a comparison reads naturally.
    CREATE TYPE public.fan_mood AS ENUM ('concerned', 'mixed', 'positive', 'delighted');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.creator_fan_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creators (id) ON DELETE CASCADE,
  happiness_score integer NOT NULL,
  mood public.fan_mood NOT NULL,
  summary text NOT NULL,
  wants_next jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence text NOT NULL,
  messages_analysed integer NOT NULL,
  latest_message_at timestamptz,
  model text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_fan_insights_score_range
    CHECK (happiness_score >= 0 AND happiness_score <= 100)
);

-- The lookup is always "newest insight for this creator".
CREATE INDEX IF NOT EXISTS creator_fan_insights_creator_idx
  ON public.creator_fan_insights (creator_id, created_at DESC);

-- Written only by server actions that check creator ownership first.
-- RLS on with no policy = deny all, matching media_access_tokens et al.
ALTER TABLE public.creator_fan_insights ENABLE ROW LEVEL SECURITY;
