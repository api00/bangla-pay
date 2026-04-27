# Phase 1 — Schema, RLS, and core libs

**Goal:** every table needed for the entire product exists in Postgres with proper RLS, and we have well-tested money/handle helpers ready to use across the app.

## Deliverables

### 1.1 Extend `db/schema.ts`

Add these tables (all in `public` schema):

- [x] `creators` (already present — extend with: `email`, `category`, `country`, `onboarding_step`, `is_verified`)
- [x] `creator_pages` (1:1 with creators — page customization)
- [x] `tip_presets` (creator's default tip amounts / cha labels)
- [x] `supporters` (optional supporter accounts — keyed by email)
- [x] `tips` (extend existing — add `supporter_id`, `cha_count`, `paid_at`)
- [x] `products` (digital shop items)
- [x] `product_files` (uploaded assets per product)
- [x] `product_variants` (optional pricing tiers)
- [x] `orders` (shop purchases)
- [x] `order_items`
- [x] `order_downloads` (signed token + expiry per item)
- [x] `messages` (supporter notes + creator replies)
- [x] `milestones` (cha goals, supporter count badges)
- [x] `payout_methods` (KYC'd MFS / bank destinations)
- [x] `payouts` (extend — add `fee_paisa`, `net_paisa`, `payout_method_id`, `provider_ref`, `failure_reason`)
- [x] `webhooks_log` (raw provider events)
- [x] `audit_log` (sensitive ops trail)
- [x] `analytics_daily` (pre-aggregated metrics rollup)

### 1.2 Enums

- [x] `tip_provider`, `tip_status` (already exist)
- [x] `payout_method`, `payout_status` (already exist)
- [x] `order_status`
- [x] `product_type` (`digital_download | external_link`)
- [x] `pricing_model` (`fixed | pay_what_you_want | free`)
- [x] `creator_category`
- [x] `onboarding_step`
- [x] `milestone_kind`
- [x] `message_kind`

### 1.3 Migrations

- [x] Hand-written `drizzle/0002_phase1_schema.sql` (drizzle-kit generate needs TTY for column-rename detection — manual SQL is the project standard going forward)
- [x] Hand-written `drizzle/0003_rls.sql` enabling RLS + policies for every new table
- [x] `npm run db:apply -- drizzle/0002_phase1_schema.sql` applied to Supabase
- [x] `npm run db:apply -- drizzle/0003_rls.sql` applied to Supabase
- [x] Verified: 18 tables in `public`, all RLS-enabled (`scripts/list-tables.mjs`)

### 1.4 Core libs

- [x] `lib/money.ts` — `formatTaka`, `formatTakaCompact`, `parseTakaInput`, `paisaToTaka`, `takaToPaisa`
- [x] `lib/handle.ts` — `validateHandle`, `RESERVED_HANDLES`, `normalizeHandle`
- [x] `lib/ids.ts` — short URL-safe id generator (used for download tokens)

### 1.5 Types & queries

- [x] Re-export all `Creator`, `Tip`, `Order`, `Product`, … types from `db/schema/`
- [x] Skeleton query files under `db/queries/` — empty stubs to fill in later phases

## Out of scope (explicitly)

- Onboarding UI (Phase 2)
- Public creator page (Phase 3)
- Any payment integration (Phase 5)
- Tests for money/handle libs (will add when first test runner lands)

## Acceptance

- `npm run build` — green
- `npx tsc --noEmit` — clean
- Drizzle Studio shows every table, every column, every enum
- Trying to read `tips` from a logged-in user that's NOT the creator returns 0 rows
