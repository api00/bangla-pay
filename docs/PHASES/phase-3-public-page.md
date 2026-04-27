# Phase 3 — Public creator page

**Goal:** every creator gets a server-rendered, mobile-first public page at `/{handle}` with a tip jar, bio, supporter wall, and a placeholder Shop section. The page renders for anonymous visitors (no auth) and surfaces only data the creator chose to make public.

## Deliverables

### 3.1 Routing

- [x] `/{handle}` — public profile (catch-all under root, low priority so it doesn't shadow auth/dashboard routes)
- [x] 404 surface (`/{handle}` for unknown handle) — clean, on-brand
- [x] Reserved-handle URLs (e.g. `/admin`, `/api`) never reach the catch-all (Next route precedence + RESERVED_HANDLES guard)

### 3.2 Page composition

- [x] `<CreatorHeader>` — avatar (placeholder for now), display name, handle, category badge, bio
- [x] `<TipJar>` — tip presets (from `tip_presets`) + custom amount field + supporter name + optional message + "Buy a cha" CTA. Form posts to a Phase 4 stub.
- [x] `<SupporterWall>` — list of recent succeeded tips that have a public message (`messageIsPublic = true`). Empty state on no tips.
- [x] `<ShopPreview>` — section title + "coming soon" empty state for now (full Shop is Phase 6)
- [x] Footer: minimal — built on BanglaPay link

### 3.3 Theming

- [x] `creator_pages.themeColor` drives the accent button color (default Wise Green)
- [x] `bnNumerals` opt-in renders preset amounts in Bengali numerals on this page only

### 3.4 Data layer

- [x] `db/queries/profile.ts` — `getPublicProfile(handle)` returns `{ creator, page, presets, recentMessages }` in one round-trip-friendly batch
- [x] `db/queries/tips.ts` — `getPublicSupporterWall(creatorId, limit)` returns recent public-message tips
- [x] All queries are server-only and use Drizzle, not Supabase JS

### 3.5 Caching

- [x] Page uses `revalidate = 60` (ISR with 60s revalidation window)
- [x] Server Action stub for tip submission already triggers `revalidatePath("/{handle}")` so wall refreshes on tip success (Phase 4 hooks into this)

### 3.6 Accessibility & responsive

- [x] Mobile-first (375px baseline)
- [x] Tip preset buttons are real `<button>` elements with proper `aria-pressed`
- [x] `prefers-reduced-motion` respected on hover transitions

## Out of scope (explicitly)

- Real payment flow → Phase 4 (this phase ends with a "buy a cha" form that POSTs to a server action which returns a placeholder error / TODO)
- Shop products listing → Phase 6
- Avatar / cover image upload → Phase 7 (Storage)
- Social share images / OG cards → Phase 9

## Acceptance

- `/{validHandle}` renders a public page for both authed and anonymous visitors
- `/{takenButReservedHandle}` (e.g. `/admin`) does NOT reach the public route
- `/{nonexistentHandle}` returns a clean 404
- Tip jar form submits to a stub server action (does not crash)
- `npm run build` green, `npx tsc --noEmit` clean
