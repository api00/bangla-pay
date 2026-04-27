# Phase 4 — Tips MVP (stub provider)

**Goal:** end-to-end tip flow without a real payment processor. Supporter clicks "Buy a cha" → `tips` row inserted (`pending`) → fake checkout page → click "I paid" → row flips to `succeeded` → supporter wall + dashboard reflect it. Phase 5 swaps the stub for bKash / SSLCOMMERZ without changing the surrounding code.

## Deliverables

### 4.1 Database

- [x] No new tables — `tips` already covers it
- [x] `tips.providerRef` populated with a `stub_<short-id>` for tracking

### 4.2 Server actions / routes

- [x] Replace stub `app/[handle]/_actions/start-tip.ts` with real implementation that:
  - Validates input (already done in Phase 3)
  - Inserts a `tips` row in `pending` status with `provider='card'` (placeholder), `providerRef='stub_<id>'`
  - Returns redirect URL `/checkout/stub/<tipId>`
- [x] `/checkout/stub/[tipId]/page.tsx` — server-rendered fake checkout: shows tip summary + "I paid" / "Cancel" buttons
- [x] `/checkout/stub/[tipId]/_actions.ts`:
  - `markTipPaid(tipId)` — flips status to `succeeded`, sets `paidAt`, upserts `supporters` row, also creates a `messages` row when there's a non-empty message
  - `markTipFailed(tipId)` — flips to `failed`
- [x] `/checkout/success/page.tsx` — generic post-payment thanks page with tip summary + back-to-creator link

### 4.3 Public page integration

- [x] `start-tip` redirect lands the supporter at the stub checkout
- [x] On success, `revalidatePath('/{handle}')` so the wall and stats update without a hard refresh

### 4.4 Dashboard tips inbox

- [x] `/dashboard/tips/page.tsx` — paginated list of all tips for the logged-in creator, grouped by status (pending / succeeded / failed)
- [x] Empty state with onboarding hint
- [x] Sidebar nav: "Tips" entry now points to `/dashboard/tips` (was `#`)

### 4.5 Dashboard home updates

- [x] Pull real "total raised" + "supporter count" from queries (replaces hardcoded numbers in EarningsCard / StatsGrid)
- [x] Recent activity component lists last 5 succeeded tips with supporter name + amount + message snippet

### 4.6 Queries

- [x] `db/queries/tips.ts` — `listTipsForCreator(creatorId, opts)`, `getCreatorTipStats(creatorId)`, `recentSucceededTips(creatorId, limit)`
- [x] `db/queries/supporters.ts` — `upsertSupporterByEmail(email, name)`

## Out of scope (explicitly)

- Real payment provider integration → Phase 5
- Receipt emails → Phase 5 (needs provider context for receipt content)
- Refund flow → Phase 5
- Webhooks → Phase 5

## Acceptance

- Visitor on `/{handle}` → tips → fake checkout → success → wall updates
- Tip with public message creates a `messages` row visible in `/dashboard/messages` (Phase 7 surfaces it; row exists now)
- Dashboard home shows real totals
- Reload `/{handle}` after success → wall reflects new tip
- `npm run build` green, `npx tsc --noEmit` clean
