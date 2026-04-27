-- =====================================================================
-- Phase 1 — full product schema
-- Run after 0000 and 0001. Apply via:
--   psql "$DATABASE_URL" -f drizzle/0002_phase1_schema.sql
-- or paste into Supabase SQL editor.
--
-- Idempotent where Postgres allows. Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "public"."order_status" AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."product_type" AS ENUM ('digital_download', 'external_link');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."pricing_model" AS ENUM ('fixed', 'pay_what_you_want', 'free');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."creator_category" AS ENUM (
    'writer','illustrator','musician','educator','developer',
    'podcaster','video_creator','photographer','other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."onboarding_step" AS ENUM ('handle','profile','payout','done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."milestone_kind" AS ENUM ('supporter_count','total_raised','product_sales');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."message_kind" AS ENUM ('tip','order','direct');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- creators — extend existing table
--   Move profile fields to creator_pages, add identity/onboarding fields.
-- ---------------------------------------------------------------------

ALTER TABLE "creators"
  ADD COLUMN IF NOT EXISTS "email" text,
  ADD COLUMN IF NOT EXISTS "category" "creator_category" NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS "country" text NOT NULL DEFAULT 'BD',
  ADD COLUMN IF NOT EXISTS "onboarding_step" "onboarding_step" NOT NULL DEFAULT 'handle',
  ADD COLUMN IF NOT EXISTS "is_verified" boolean NOT NULL DEFAULT false;

-- Backfill email from auth.users for any pre-existing rows, then enforce NOT NULL.
UPDATE "creators" c
   SET "email" = u.email
  FROM "auth"."users" u
 WHERE c."user_id" = u.id
   AND c."email" IS NULL;

ALTER TABLE "creators" ALTER COLUMN "email" SET NOT NULL;

-- ---------------------------------------------------------------------
-- creator_pages
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "creator_pages" (
  "creator_id"        uuid PRIMARY KEY REFERENCES "creators"("id") ON DELETE CASCADE,
  "bio"               text,
  "avatar_url"        text,
  "cover_url"         text,
  "theme_color"       text NOT NULL DEFAULT '#9fe870',
  "cha_emoji"         text NOT NULL DEFAULT '☕',
  "cha_label"         text NOT NULL DEFAULT 'cha',
  "cha_unit_paisa"    integer NOT NULL DEFAULT 5000,
  "social_links"      jsonb NOT NULL DEFAULT '{}'::jsonb,
  "show_supporters"   boolean NOT NULL DEFAULT true,
  "show_total_raised" boolean NOT NULL DEFAULT true,
  "bn_numerals"       boolean NOT NULL DEFAULT false,
  "updated_at"        timestamptz NOT NULL DEFAULT now()
);

-- Backfill: migrate bio/avatar_url from creators (they live on creator_pages now).
INSERT INTO "creator_pages" ("creator_id","bio","avatar_url")
SELECT c."id", c."bio", c."avatar_url"
  FROM "creators" c
  LEFT JOIN "creator_pages" p ON p."creator_id" = c."id"
 WHERE p."creator_id" IS NULL;

-- Drop legacy columns now that data is migrated.
ALTER TABLE "creators" DROP COLUMN IF EXISTS "bio";
ALTER TABLE "creators" DROP COLUMN IF EXISTS "avatar_url";
ALTER TABLE "creators" DROP COLUMN IF EXISTS "payout_method_json";

-- ---------------------------------------------------------------------
-- tip_presets
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "tip_presets" (
  "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id"   uuid NOT NULL REFERENCES "creators"("id") ON DELETE CASCADE,
  "amount_paisa" integer NOT NULL,
  "label"        text,
  "position"     integer NOT NULL,
  "created_at"   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "tip_presets_creator_position_unique"
  ON "tip_presets" ("creator_id", "position");

-- ---------------------------------------------------------------------
-- supporters
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "supporters" (
  "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"      uuid,
  "email"        text NOT NULL,
  "display_name" text,
  "created_at"   timestamptz NOT NULL DEFAULT now(),
  "last_seen_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "supporters_email_unique"
  ON "supporters" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "supporters_user_id_unique"
  ON "supporters" ("user_id");

-- Cross-schema FK to auth.users (Drizzle can't model auth.*).
ALTER TABLE "supporters"
  DROP CONSTRAINT IF EXISTS "supporters_user_id_auth_users_fk";
ALTER TABLE "supporters"
  ADD CONSTRAINT "supporters_user_id_auth_users_fk"
  FOREIGN KEY ("user_id")
  REFERENCES "auth"."users"("id")
  ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- tips — extend existing
-- ---------------------------------------------------------------------

ALTER TABLE "tips"
  ADD COLUMN IF NOT EXISTS "supporter_id" uuid REFERENCES "supporters"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "cha_count"    integer,
  ADD COLUMN IF NOT EXISTS "paid_at"      timestamptz;

ALTER TABLE "tips"
  DROP CONSTRAINT IF EXISTS "tips_amount_positive";
ALTER TABLE "tips"
  ADD CONSTRAINT "tips_amount_positive" CHECK ("amount_paisa" > 0);

CREATE INDEX IF NOT EXISTS "tips_creator_created_idx"
  ON "tips" ("creator_id", "created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "tips_provider_ref_unique"
  ON "tips" ("provider", "provider_ref")
  WHERE "provider_ref" IS NOT NULL;

-- ---------------------------------------------------------------------
-- products / product_files / product_variants
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "products" (
  "id"                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id"         uuid NOT NULL REFERENCES "creators"("id") ON DELETE CASCADE,
  "slug"               text NOT NULL,
  "title"              text NOT NULL,
  "subtitle"           text,
  "description_md"     text,
  "cover_url"          text,
  "product_type"       "product_type" NOT NULL DEFAULT 'digital_download',
  "pricing_model"      "pricing_model" NOT NULL DEFAULT 'fixed',
  "base_price_paisa"   integer NOT NULL DEFAULT 0,
  "min_price_paisa"    integer,
  "is_published"       boolean NOT NULL DEFAULT false,
  "external_url"       text,
  "download_limit"     integer NOT NULL DEFAULT 5,
  "download_ttl_hours" integer NOT NULL DEFAULT 168,
  "total_sales"        integer NOT NULL DEFAULT 0,
  "created_at"         timestamptz NOT NULL DEFAULT now(),
  "updated_at"         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "products_base_price_nonneg" CHECK ("base_price_paisa" >= 0),
  CONSTRAINT "products_min_price_nonneg"
    CHECK ("min_price_paisa" IS NULL OR "min_price_paisa" >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS "products_creator_slug_unique"
  ON "products" ("creator_id", "slug");
CREATE INDEX IF NOT EXISTS "products_creator_published_idx"
  ON "products" ("creator_id", "is_published");

CREATE TABLE IF NOT EXISTS "product_files" (
  "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id"   uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "storage_path" text NOT NULL,
  "filename"     text NOT NULL,
  "mime_type"    text NOT NULL,
  "size_bytes"   bigint NOT NULL,
  "position"     integer NOT NULL DEFAULT 0,
  "created_at"   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "product_files_product_idx"
  ON "product_files" ("product_id");

CREATE TABLE IF NOT EXISTS "product_variants" (
  "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id"   uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "name"         text NOT NULL,
  "price_paisa"  integer NOT NULL,
  "position"     integer NOT NULL DEFAULT 0,
  "created_at"   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "product_variants_price_nonneg" CHECK ("price_paisa" >= 0)
);

CREATE INDEX IF NOT EXISTS "product_variants_product_idx"
  ON "product_variants" ("product_id");

-- ---------------------------------------------------------------------
-- orders / order_items / order_downloads
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "orders" (
  "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id"      uuid NOT NULL REFERENCES "creators"("id") ON DELETE CASCADE,
  "supporter_id"    uuid REFERENCES "supporters"("id") ON DELETE SET NULL,
  "supporter_name"  text,
  "supporter_email" text NOT NULL,
  "total_paisa"     integer NOT NULL,
  "status"          "order_status" NOT NULL DEFAULT 'pending',
  "provider"        "tip_provider",
  "provider_ref"    text,
  "created_at"      timestamptz NOT NULL DEFAULT now(),
  "paid_at"         timestamptz,
  CONSTRAINT "orders_total_positive" CHECK ("total_paisa" > 0)
);

CREATE INDEX IF NOT EXISTS "orders_creator_created_idx"
  ON "orders" ("creator_id", "created_at");
CREATE INDEX IF NOT EXISTS "orders_supporter_email_idx"
  ON "orders" ("supporter_email");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_provider_ref_unique"
  ON "orders" ("provider", "provider_ref")
  WHERE "provider_ref" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "order_items" (
  "id"                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"               uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "product_id"             uuid NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
  "variant_id"             uuid REFERENCES "product_variants"("id") ON DELETE RESTRICT,
  "product_title_snapshot" text NOT NULL,
  "unit_price_paisa"       integer NOT NULL,
  "quantity"               integer NOT NULL DEFAULT 1,
  "created_at"             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" > 0),
  CONSTRAINT "order_items_unit_price_nonneg" CHECK ("unit_price_paisa" >= 0)
);

CREATE INDEX IF NOT EXISTS "order_items_order_idx"
  ON "order_items" ("order_id");

CREATE TABLE IF NOT EXISTS "order_downloads" (
  "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_item_id"   uuid NOT NULL REFERENCES "order_items"("id") ON DELETE CASCADE,
  "product_file_id" uuid NOT NULL REFERENCES "product_files"("id") ON DELETE RESTRICT,
  "download_token"  text NOT NULL,
  "downloads_used"  integer NOT NULL DEFAULT 0,
  "expires_at"      timestamptz NOT NULL,
  "created_at"      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "order_downloads_token_unique"
  ON "order_downloads" ("download_token");
CREATE INDEX IF NOT EXISTS "order_downloads_order_item_idx"
  ON "order_downloads" ("order_item_id");

-- ---------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "messages" (
  "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id"      uuid NOT NULL REFERENCES "creators"("id") ON DELETE CASCADE,
  "kind"            "message_kind" NOT NULL DEFAULT 'direct',
  "tip_id"          uuid REFERENCES "tips"("id") ON DELETE SET NULL,
  "order_id"        uuid REFERENCES "orders"("id") ON DELETE SET NULL,
  "supporter_name"  text,
  "supporter_email" text,
  "body"            text NOT NULL,
  "is_read"         boolean NOT NULL DEFAULT false,
  "reply_body"      text,
  "replied_at"      timestamptz,
  "created_at"      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "messages_creator_unread_idx"
  ON "messages" ("creator_id", "is_read", "created_at");

-- ---------------------------------------------------------------------
-- milestones
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "milestones" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id"  uuid NOT NULL REFERENCES "creators"("id") ON DELETE CASCADE,
  "kind"        "milestone_kind" NOT NULL,
  "threshold"   integer NOT NULL,
  "title"       text NOT NULL,
  "is_public"   boolean NOT NULL DEFAULT true,
  "reached_at"  timestamptz,
  "created_at"  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "milestones_creator_idx"
  ON "milestones" ("creator_id");

-- ---------------------------------------------------------------------
-- payout_methods + payouts (rebuild — old payouts had no method link)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "payout_methods" (
  "id"                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id"         uuid NOT NULL REFERENCES "creators"("id") ON DELETE CASCADE,
  "method"             "payout_method" NOT NULL,
  "account_label"      text NOT NULL,
  "encrypted_details"  bytea NOT NULL,
  "is_default"         boolean NOT NULL DEFAULT false,
  "is_verified"        boolean NOT NULL DEFAULT false,
  "created_at"         timestamptz NOT NULL DEFAULT now(),
  "updated_at"         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "payout_methods_creator_idx"
  ON "payout_methods" ("creator_id");
CREATE UNIQUE INDEX IF NOT EXISTS "payout_methods_creator_default_unique"
  ON "payout_methods" ("creator_id") WHERE "is_default" = true;

ALTER TABLE "payouts"
  ADD COLUMN IF NOT EXISTS "payout_method_id" uuid REFERENCES "payout_methods"("id") ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS "fee_paisa"        integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "net_paisa"        integer,
  ADD COLUMN IF NOT EXISTS "provider_ref"     text,
  ADD COLUMN IF NOT EXISTS "failure_reason"   text;

UPDATE "payouts" SET "net_paisa" = "amount_paisa" - "fee_paisa" WHERE "net_paisa" IS NULL;
ALTER TABLE "payouts" ALTER COLUMN "net_paisa" SET NOT NULL;

ALTER TABLE "payouts"
  DROP CONSTRAINT IF EXISTS "payouts_amount_positive";
ALTER TABLE "payouts"
  ADD CONSTRAINT "payouts_amount_positive" CHECK ("amount_paisa" > 0);

ALTER TABLE "payouts"
  DROP CONSTRAINT IF EXISTS "payouts_fee_nonneg";
ALTER TABLE "payouts"
  ADD CONSTRAINT "payouts_fee_nonneg" CHECK ("fee_paisa" >= 0);

ALTER TABLE "payouts"
  DROP CONSTRAINT IF EXISTS "payouts_net_consistent";
ALTER TABLE "payouts"
  ADD CONSTRAINT "payouts_net_consistent"
  CHECK ("net_paisa" = "amount_paisa" - "fee_paisa");

CREATE INDEX IF NOT EXISTS "payouts_creator_status_idx"
  ON "payouts" ("creator_id", "status");

-- ---------------------------------------------------------------------
-- webhooks_log + audit_log + analytics_daily
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "webhooks_log" (
  "id"               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "provider"         text NOT NULL,
  "event_type"       text NOT NULL,
  "payload"          jsonb NOT NULL,
  "signature"        text,
  "signature_valid"  boolean NOT NULL DEFAULT false,
  "processed"        boolean NOT NULL DEFAULT false,
  "error"            text,
  "received_at"      timestamptz NOT NULL DEFAULT now(),
  "processed_at"     timestamptz
);

CREATE INDEX IF NOT EXISTS "webhooks_log_provider_processed_idx"
  ON "webhooks_log" ("provider", "processed");

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "actor_user_id"  uuid,
  "entity"         text NOT NULL,
  "entity_id"      uuid,
  "action"         text NOT NULL,
  "before"         jsonb,
  "after"          jsonb,
  "at"             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "audit_log_entity_idx"
  ON "audit_log" ("entity", "entity_id");
CREATE INDEX IF NOT EXISTS "audit_log_actor_idx"
  ON "audit_log" ("actor_user_id", "at");

CREATE TABLE IF NOT EXISTS "analytics_daily" (
  "creator_id"        uuid NOT NULL REFERENCES "creators"("id") ON DELETE CASCADE,
  "date"              date NOT NULL,
  "tips_count"        integer NOT NULL DEFAULT 0,
  "tips_paisa"        integer NOT NULL DEFAULT 0,
  "orders_count"      integer NOT NULL DEFAULT 0,
  "orders_paisa"      integer NOT NULL DEFAULT 0,
  "unique_supporters" integer NOT NULL DEFAULT 0,
  "page_views"        integer NOT NULL DEFAULT 0,
  CONSTRAINT "analytics_daily_pk" PRIMARY KEY ("creator_id", "date")
);
