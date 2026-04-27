# Phase 2 — Creator onboarding

**Goal:** a freshly-authed user is funneled through a 3-step onboarding that creates their `creators` + `creator_pages` rows, claims their handle, sets their public profile basics, and lands them in the dashboard with `onboarding_step='done'`.

## Deliverables

### 2.1 Routing & gating

- [x] Onboarding routes live at `/onboarding/handle`, `/onboarding/profile`, `/onboarding/payout`
- [x] `proxy.ts` redirects authed users with no creator row → `/onboarding/handle`
- [x] `proxy.ts` redirects authed users with `onboarding_step != 'done'` → the matching step
- [x] `proxy.ts` redirects fully-onboarded users away from `/onboarding/*` → `/dashboard`
- [x] Onboarding page lookups bypass app-layer creator check via cookies — proxy reads it via Supabase + Drizzle directly

### 2.2 Step 1 — Claim handle

- [x] Form: handle input with live availability check (Server Action, debounced)
- [x] Validation: `lib/handle.ts` rules + DB uniqueness
- [x] On submit: insert `creators` + `creator_pages` + default `tip_presets` (৳50, ৳100, ৳500), set `onboarding_step='profile'`
- [x] Display preview: `banglapay.com/{handle}`

### 2.3 Step 2 — Profile

- [x] Display name (default = email prefix)
- [x] Category (select from `creator_category` enum)
- [x] Bio (optional, 280 char max)
- [x] On submit: update `creators.display_name + category` and `creator_pages.bio`, set `onboarding_step='payout'`
- [ ] Avatar upload — deferred to Phase 7 (needs Storage buckets first)

### 2.4 Step 3 — Payout (skippable)

- [x] Brief copy explaining payout setup is required before withdrawing
- [x] "Skip for now" button → sets `onboarding_step='done'` → `/dashboard`
- [ ] Actual payout method form — deferred to Phase 8

### 2.5 Server actions

- [x] `actions/onboarding/check-handle.ts` — returns `{ available: boolean, reason?: string }`
- [x] `actions/onboarding/claim-handle.ts`
- [x] `actions/onboarding/save-profile.ts`
- [x] `actions/onboarding/finish.ts`

### 2.6 UI shell

- [x] `OnboardingLayout` — split layout, step indicator (1/3 · 2/3 · 3/3), brand mark
- [x] Reuse existing `AuthLayout` visual language (Wise Green CTAs, Inter 600)

## Acceptance

- New OTP signup → redirected to `/onboarding/handle`
- Claim valid handle → redirected to `/onboarding/profile`
- Save profile → redirected to `/onboarding/payout`
- Skip payout → redirected to `/dashboard`
- Returning to `/onboarding/handle` after completion → bounced to `/dashboard`
- Reserved handle (`admin`, `bkash`) is rejected with a friendly message
- Handle that's already taken is rejected
- `npx tsc --noEmit` clean, `npm run build` green
