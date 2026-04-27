# Build Phases

Single source of truth for what's done, what's in progress, and what's next.
Update the **Status** and **Done date** columns at the end of each phase.

| # | Phase | Status | Done date | Notes |
|---|-------|--------|-----------|-------|
| 0 | Foundations (Next 16, Tailwind v4, Supabase, OTP auth, RLS-ready proxy) | ✅ done | 2026-04-23 | OTP auth, dashboard shell, route gating |
| 1 | Schema extension + RLS + money/handle libs | ✅ done | 2026-04-27 | 18 tables, RLS on all, libs ready |
| 2 | Creator onboarding (claim handle → profile → payout step) | ✅ done | 2026-04-27 | 3-step flow, gated layouts, server actions |
| 3 | Public creator page `/{handle}` (bio + tip jar + supporter wall) | ✅ done | 2026-04-27 | ISR profile, tip jar, supporter wall, shop placeholder |
| 4 | Tips MVP (stub provider, receipts, dashboard tips inbox) | ✅ done | 2026-04-27 | E2E tip flow, stub checkout, real dashboard stats |
| 5 | Real payment providers (bKash + SSLCOMMERZ) + webhooks | ⏭️ deferred | — | Skipped until provider accounts live; mock checkout reused everywhere |
| 6 | Shop (digital products, file upload, signed downloads, orders) | ✅ done | 2026-04-27 | Storage buckets live (product-files private, public-assets public) |
| 7 | Engagement & analytics (messages, milestones, daily rollup) | ⬜ pending | — | |
| 8 | Payouts (method add/verify, request flow, audit trail) | ⬜ pending | — | |
| 9 | Polish & launch (emails, OG, E2E, rate limits) | ⬜ pending | — | |

Status legend: ⬜ pending · 🟡 in progress · ✅ done · ⏭️ deferred · ⛔ blocked

---

See [PHASES/](./PHASES/) for per-phase deliverable checklists.
