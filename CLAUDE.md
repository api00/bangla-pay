<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# BanglaPay

A Buy Me a Coffee-style tipping platform for Bangladeshi creators. Supporters tip creators in BDT ("Buy a cha"). Visual language is Wise-inspired (see [`DESIGN.md`](./DESIGN.md)).

This file is the single source of truth for project context. Everything an agent needs to be useful on this codebase lives here or in `DESIGN.md`.

---

## 1. What this is

**One-liner**: A Buy Me a Coffee alternative built for Bangladeshi creators — supporters tip creators in BDT through local payment rails (bKash, Nagad, Rocket, cards via SSLCOMMERZ).

**Why it exists**:
- Buy Me a Coffee, Ko-fi, Patreon don't support local BDT payment methods. Bangladeshi creators lose revenue to payout friction and FX conversion.
- The Bangladeshi creator economy (YouTubers, writers, illustrators, educators, musicians) has no domestic tipping platform built for the market.
- Mobile financial services (MFS) — bKash/Nagad/Rocket — own payments in Bangladesh. A creator platform must meet supporters where they already pay.

**Target users**:
- **Creators** (primary): Bangladeshi YouTubers, illustrators, bloggers, musicians, educators. Often 18–35, mobile-primary, bilingual (Bangla/English).
- **Supporters** (primary): Fans of the above creators. Mostly Bangladesh-resident on mobile, plus diaspora (secondary, may pay by card).

**Positioning**: "The Wise of creator tipping for Bangladesh" — fintech-grade boldness, not cutesy coffee-cup iconography.

---

## 2. Scope

### Core primitives

- **Creator** — person with a public BanglaPay page who receives tips.
- **Supporter** — person who tips a creator; may be anonymous.
- **Tip** — one-off payment from supporter → creator. Default amounts: ৳50, ৳100, ৳500, custom.
- **Tip message** — optional note attached to a tip (public or private).
- **Payout** — creator withdraws balance to their bank or MFS wallet.
- **Milestone** — supporter-count or total-raised threshold (e.g. 100 supporters, ৳10,000 raised); renders a Heritage Red badge.

### Status (see `docs/PHASES.md` for the authoritative table)

Shipped:

- [x] Creator signup + onboarding + public page (`/{handle}`)
- [x] Supporter tips a creator (one-off, no account required)
- [x] Creator dashboard: tips, supporters, message inbox, milestones
- [x] Shop: digital products, uploads, signed/gated delivery, orders
- [x] Buyer library with per-order access
- [x] Payout methods (bKash/Nagad/Rocket/bank) + request flow

Not built:

- [ ] Real payment providers. Checkout is a **stub** at `/checkout/stub/*`
      that simulates success/failure. `webhooks_log` and the provider enums
      exist, but no webhook route does. This is phase 5, deferred until
      provider accounts are live.
- [ ] Email (receipts, magic links, notifications) — nothing is wired.
- [ ] Rate limiting, OG images, automated tests.

### Out of scope (v1)

- Recurring memberships (Patreon-style)
- Creator-to-creator transfers
- Multi-currency (USD, INR, EUR) — BDT only for v1
- Mobile app — web only, mobile-optimized
- Team/collaborator accounts

### Open product questions (don't fabricate answers)

Answer inline as decisions land:

- **Payment provider**: bKash direct API vs. SSLCOMMERZ aggregator vs. both? → TBD
- **Platform fee**: flat %, fixed fee, freemium with paid tier? → TBD
- **Payout minimum / cadence** → TBD
- **KYC**: what's legally required for creators in Bangladesh? → research needed
- **Domain**: `banglapay.com`? `banglapay.bd`? → TBD (currently `bangla-pay-nine.vercel.app`)

### Not competitors — references

- Buy Me a Coffee (product shape)
- Ko-fi (we do less, better)
- Patreon (memberships — out of scope for v1)
- bKash (payment UX reference)
- Wise (visual and typographic reference — see `DESIGN.md`)

---

## 3. Folder structure

~200 TS/TSX files, 35 routes, 20 tables. Keep this in sync — a stale map here
misleads every future change.

```text
bangla-pay/
├── app/
│   ├── page.tsx                   # landing (real creator directory, not mock)
│   ├── layout.tsx  globals.css    # fonts + @theme design tokens
│   ├── creators/                  # public creator directory
│   ├── [handle]/                  # public creator page
│   │   └── shop/[slug]/           # public product page + purchase action
│   ├── dashboard/                 # creator app (sidebar layout, ToastProvider)
│   │   ├── shop/                  # listing, 3-step new-product wizard, edit
│   │   │   └── _actions/          # server actions, one concern per file
│   │   ├── settings/              # profile, payouts, public page
│   │   ├── messages/ orders/ supporters/ tips/
│   ├── library/                   # buyer's purchases (order grants + email)
│   │   ├── [orderCode]/           # one purchase
│   │   ├── access/[downloadId]/   # mints a short-lived media token
│   │   └── media/[token]/         # streams the file
│   ├── checkout/stub/             # MOCK provider — phase 5 replaces this
│   ├── onboarding/ auth/ login/ signup/
│   └── d/[token]/                 # legacy bearer download link
├── components/                    # grouped by domain, not by type
│   ├── ui/                        # Button, Toast, LangToggle
│   ├── shop/ · shop/wizard/       # product surfaces
│   ├── creator-page/ creators/ dashboard/ landing/ onboarding/ auth/
├── db/
│   ├── schema/                    # 20 tables, one file per domain
│   └── queries/                   # all reads; every file is `server-only`
├── lib/                           # pure-ish helpers (money, auth, crypto…)
├── utils/supabase/                # browser, server, admin, proxy clients
├── drizzle/                       # SQL migrations (0000–0008) + meta
├── scripts/                       # apply-sql, ensure-storage, list-tables
└── docs/PHASES.md                 # authoritative build status
```

Rules for adding folders/files:
- Feature folders under `app/` for routes; keep route-local components co-located with the route.
- Shared components grouped by domain under `components/`, not by type.
- Shared pure utilities under `lib/`.
- Never nest deeper than 3 levels from `app/` or `components/`.
- Max 300 lines per component file; extract earlier.
- One React component per file for exported components.

---

## 4. Stack

| Package | Version | Notes |
|---------|---------|-------|
| `next` | 16.2.4 | Major version with breaking changes — read `node_modules/next/dist/docs/` before writing Next-specific code. |
| `react` / `react-dom` | 19.2.4 | Server Actions, `useActionState`, `useFormStatus`. Refs are props. |
| `tailwindcss` | ^4 | `@import "tailwindcss"` + `@theme` in CSS. No `tailwind.config.js`. |
| `drizzle-orm` + `postgres` | ^0.45 / ^3.4 | Supabase Postgres. Schema in `db/schema/`, migrations in `drizzle/`. |
| `@supabase/ssr` + `supabase-js` | ^0.10 / ^2.104 | Auth (email OTP), Storage. |
| `typescript` | ^5 | Strict. No `any` in app code. |

Still **not** installed: no state library, no data-fetching library, no test
runner, no validation library (Zod is proposed, not present — server actions
validate by hand). Propose before adding.

### Commands

```bash
npm run dev      # next dev — local dev server
npm run build    # next build — production build
npm run start    # next start — run production build locally
npm run lint     # eslint — lint the codebase
npx tsc --noEmit # type-check without emitting
```

### Next.js 16 notes

- App Router only — no `pages/` directory.
- Server Components by default; mark Client Components with `"use client"` only when needed (state, events, browser APIs).
- `next/image` for all raster images with explicit `width`/`height`.
- `next/font` for all fonts — no `<link>` to Google Fonts.
- Deprecation notices in the installed docs supersede outdated blog posts.

### React 19 notes

- Prefer `useActionState`, `useFormStatus`, `useOptimistic` over custom hooks for form flows.
- Server Actions: `"use server"` functions called from Client Components as form `action`.
- Refs are props — no more `forwardRef` for new components.
- `use()` unwraps promises inside components under Suspense.

### Tailwind v4 notes

- Stylesheet entry: `app/globals.css` with `@import "tailwindcss";`
- Tokens defined in a `@theme { ... }` block in CSS — not JS config.
- Current tokens are boilerplate (`--background`, `--foreground`). **Replace with the tokens codified in `DESIGN.md`** when wiring the design system.

### Design tokens — wired, but under-used

`app/globals.css` defines the full palette, radii and font tokens in `@theme`,
so `bg-wise-green`, `text-near-black` etc. all work.

**Most components don't use them.** Historic code hardcodes hex through
Tailwind arbitrary values (`text-[#0e0f0c]`). Treat that as drift, not house
style: when you touch a component's colours, move it onto the token classes.
Don't add new arbitrary hex.

### Planned additions (ask before installing)

- `zod` — input/webhook validation
- DB + auth — Supabase or alternative (decision pending)
- Payment SDKs: bKash API / SSLCOMMERZ (decision pending)
- Test runner: Vitest (unit) + Playwright (E2E) — add when first test is written

---

## 5. Bangladesh context

### Currency

- **BDT (Bangladeshi Taka)** — ISO 4217: `BDT`, symbol: `৳` (U+09F3).
- Format: `৳1,234` (no decimal for whole-taka tips). Use `Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' })`.
- Symbol is tight to the number: `৳100` not `৳ 100`.
- **Always store money as integer paisa** (1/100 taka). Field: `amountPaisa: number`. Format through a single `formatTaka(paisa)` helper.

### Numerals

- Default: Arabic numerals (0–9) — timestamps, IDs, UI chrome.
- Creator opt-in: Bengali numerals (০–৯) for tip amounts on their own profile. Never for UI chrome.
- Unicode: Bengali digits are U+09E6 through U+09EF.

### Language

- **Bangla (bn-BD)** primary for Bangladesh-resident users.
- **English (en)** default for diaspora and UI chrome.
- Bilingual UI is normal; creator bios mix Bangla and English.
- Fonts: **Inter** for Latin, **Noto Sans Bengali** for Bangla (same x-height, weight 600). Avoid SolaimanLipi as web font — local fallback only.
- Wise Sans has no Bangla coverage — display-scale Bangla headlines use Noto Sans Bengali at weight 900 with the same 0.85 line-height.

### Payment rails

**Mobile Financial Services (MFS) — dominant**:

| Provider | Market share | Notes |
|----------|--------------|-------|
| **bKash** | ~60% | Direct Merchant API + PGW. Default expectation. If only one MFS launches, it's bKash. |
| **Nagad** | ~25% | Merchant API |
| **Rocket** | ~10% | Dutch-Bangla's MFS |
| Upay, MyCash, etc. | Long tail | Skip for v1 |

**Aggregators / Gateways**:
- **SSLCOMMERZ** — most common BD aggregator. Cards + MFS + local banks in one integration. Good v1 choice to ship faster.
- **ShurjoPay**, **PortWallet**, **AamarPay** — smaller alternatives.
- **Stripe / PayPal** — no direct BDT acquiring. Useful only for diaspora USD tipping (out of scope v1).

**Cards**: Visa and Mastercard dominant. AmEx rare. 3DS standard — budget for 3DS redirect UX.

**Payouts**: Creators expect payout to MFS wallet OR bank account. Bank payouts via BEFTN (same-day) or RTGS (large amounts).

### Regulatory (starting points — verify with counsel)

- **Bangladesh Bank** regulates MFS and payment aggregators. Merchant accounts require onboarding through an approved PSP.
- **NBR (tax)** — creator income above threshold may require TIN. Collect on creator KYC.
- **Foreign remittance** — accepting USD from diaspora likely requires a licensed remittance channel. Treat cross-border as v2.
- **Data protection** — no GDPR-equivalent yet (early 2026). Follow GDPR-style minimization anyway.

### Timezone & dates

- **Bangladesh Standard Time (BST) = UTC+6**. No DST.
- Store timestamps in UTC; render in `Asia/Dhaka` for BD users, user's local TZ for diaspora.
- UI date format: prefer ISO (`YYYY-MM-DD`) for sortability; local BD convention is `DD/MM/YYYY`.

### Phone numbers

- Country code: `+880`.
- Local format: 11 digits starting with `01` (e.g. `01712345678`).
- E.164: `+8801712345678`.
- Use `libphonenumber-js` if phone is used for auth or payout.

### Cultural notes

- **Cha** (চা) — tea. The native "Buy Me a Coffee" analogue. Use "Buy a cha" in CTAs.
- Peak cultural/economic moments: Pohela Boishakh (April 14), Eid (both), Independence Day (March 26), Victory Day (December 16), New Year. Plan for traffic spikes.
- Diaspora tipping spikes on the same calendar events.

### Reference URLs (verify before relying on them)

- Bangladesh Bank: https://www.bb.org.bd/
- bKash Developer: https://developer.bka.sh/
- SSLCOMMERZ Developer: https://developer.sslcommerz.com/

---

## 6. Glossary

Use these exact terms in code, UI copy, and docs.

### Product terms

| Term | Meaning | Code / UI usage |
|------|---------|-----------------|
| Creator | Person with a public BanglaPay page who receives tips | `Creator` model, `/{handle}` route |
| Supporter | Person who tips a creator; may be anonymous | `Supporter` model |
| Handle | Creator's URL slug | `handle: string`, unique, lowercased |
| Tip | One-off payment from supporter → creator | `Tip` model |
| Tip message | Optional note attached to a tip | `message?: string` on `Tip` |
| Balance | Creator's accumulated, un-paid-out BDT | `balance: number` (in paisa) |
| Payout | Creator withdrawal to MFS or bank | `Payout` model |
| Milestone | Supporter-count or total-raised threshold | `Milestone` model |

### Copy / CTA vocabulary

| Phrase | When to use |
|--------|-------------|
| "Buy a cha" | Primary tip CTA on creator pages |
| "Buy {name} a cha · ৳{amount}" | Full primary CTA format |
| "Support" | Neutral secondary CTA |
| "Send a tip" | Neutral alternative in dashboards |
| "Thanks, {supporter}!" | Creator-facing acknowledgement |

### Money / payment terms

| Term | Meaning |
|------|---------|
| BDT | Bangladeshi Taka (ISO 4217) — developer-facing |
| Taka | Colloquial BDT — user-facing |
| Paisa | 1/100 taka — internal integer storage |
| ৳ | Taka symbol (U+09F3); tight to the number |
| MFS | Mobile Financial Services (bKash, Nagad, Rocket) |
| PSP | Payment Service Provider (BB-approved) |
| PGW | Payment Gateway |
| BEFTN | Bangladesh Electronic Funds Transfer Network (bank-to-bank) |
| RTGS | Real-Time Gross Settlement (large-value) |
| 3DS | 3-D Secure (card auth) |
| KYC | Know Your Customer (identity verification) |
| TIN | Taxpayer Identification Number (NBR) |

### Technical terms

| Term | Meaning |
|------|---------|
| Client Component | React component with `"use client"` directive |
| Server Component | React component rendered on the server (default) |
| Server Action | React 19 function with `"use server"`, callable from Client Components |
| Token (design) | Named CSS/Tailwind variable from `DESIGN.md`; never a hardcoded value |

### Brand terms

| Term | Meaning |
|------|---------|
| Wise Green | `#9fe870` — primary accent, CTA backgrounds |
| Heritage Red | `#da291c` — cultural accent; badges/milestones only; never a CTA |
| Wise Sans | Display typeface, weight 900 only, line-height 0.85 |
| Inter 600 | Default body weight; always specify 600 |
| Noto Sans Bengali | Bangla typeface paired with Inter at the same weight |

### Avoid these terms

| Avoid | Prefer |
|-------|--------|
| Fan | Supporter |
| Donation | Tip |
| Creator page when you mean the URL | Creator profile (screen) vs. `/{handle}` (URL) |
| Coffee | Cha |
| Mixing "BDT" and "৳" in the same sentence | `৳` in UI, `BDT` in developer docs |

---

## 7. Golden rules

1. **Design tokens come from `DESIGN.md`** — never invent colors, radii, or font weights. If it's not in `DESIGN.md`, stop and ask.
2. **Heritage Red (`#da291c`) is never a CTA** — only badges and milestone markers. Primary CTA is always Wise Green (`#9fe870`).
3. **Wise Sans only at weight 900** — never 400/500/700. Inter 600 is the body default.
4. **Mobile-first** — most Bangladeshi supporters are mobile-primary. Start every component at 375px.
5. **No secrets in code** — payment keys, webhook secrets, DB keys live in `.env.local` (never committed).
6. **Currency: always BDT (`৳`)** — never fall back to USD without explicit creator opt-in. Store as integer paisa; display via `formatTaka(paisa)`.
7. **No emoji/confetti on tip success** — scale flash only. See `DESIGN.md` §7.
8. **Ask before fabricating product decisions** — payment provider, pricing, feature scope, auth are all TBD.

---

## 8. Conventions

### Naming

- React components: `PascalCase.tsx` (`TipButton.tsx`, `CreatorCard.tsx`)
- Hooks: `camelCase.ts`, `use` prefix (`useTipAmount.ts`)
- Utilities: `kebab-case.ts` or `camelCase.ts` — pick per folder and stay consistent
- Types / interfaces: PascalCase (`Creator`, `TipInput`, `PayoutStatus`)
- CSS classes (when hand-written): kebab-case
- Constants: `UPPER_SNAKE_CASE`

### Components

- Default export for the component, named export for its props type:
  ```tsx
  export interface TipButtonProps { /* ... */ }
  export default function TipButton(props: TipButtonProps) { /* ... */ }
  ```
- All callback props explicitly typed — no `Function`, no inferred any.
- No prop spread (`{...props}`) unless the component is an unstyled primitive wrapper.
- Server Component by default. `"use client"` only when needed (state, events, browser APIs).

### Money

- Always store money as integer paisa. Field: `amountPaisa: number`.
- Format through a single `formatTaka(paisa)` helper (`lib/money.ts`).
- Never use `Math.round` in money math — integer arithmetic only.
- Never accept taka input as float — parse to integer paisa at the form boundary.

### Dates

- Store in UTC. Render in `Asia/Dhaka` for BD, user's local TZ for diaspora.
- Single formatter helper per format (`formatBdtDate`, `formatBdtTimestamp`).

### Strings / i18n

- Every user-facing string goes through an i18n layer (TBD). Until wired, put strings in a single `copy.ts` per feature and import from there. Don't inline copy in JSX.
- Default locale: `en-BD`. Primary additional: `bn-BD`.
- Use placeholders (`{name}`, `{amount}`), never concatenation.

### Forms

- Use React 19 Server Actions where possible.
- Validate server-side with Zod (add dep when first form lands). Client-side validation is UX only.
- Never trust client-submitted money amounts — re-parse to integer paisa server-side.

### Error handling

- Never silently swallow errors. Show specific failure messages to supporters on tip failure.
- Never leak provider-specific errors to the UI ("bKash returned code 9000" is not user-facing). Map to domain errors.
- Log server-side with context (`supporter_id`, `creator_id`, `tip_id`, `provider`, `provider_error_code`) — never log card numbers, OTPs, or access tokens.

### Security

- All payment webhooks must verify signature before acting.
- Creator handles must be unique, lowercased, validated against a blocklist (no `admin`, `api`, `auth`, `login`, `dashboard`, etc.).
- Never trust the `amount` in a payment webhook without reconciling against the tip record created at initiation.
- Rate-limit tip initiation per IP + device fingerprint.

### Testing

- No framework installed yet. When first test is written: **Vitest** for unit, **Playwright** for E2E.
- Target 80% coverage on `lib/` and payment code.
- Visual regression via Playwright screenshots on key creator-page states (empty, few supporters, many, milestone hit).
- Use provider sandboxes at the integration boundary — mock only for pure unit tests.

### Git

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, `ci:`.
- Never commit `.env.local`, API keys, webhook secrets, `node_modules/`, or `.next/`.
- Never force-push `main`.

### Adding a dependency

1. Check if the thing can be done with the existing stack in under 50 lines.
2. If not, propose the dep in a short note before installing: what it is, why we need it, bundle size impact, maintenance status.
3. Prefer widely-used packages with recent releases. Avoid single-maintainer packages for payment-critical paths.

### Removing code

- Delete; don't comment out.
- Remove the related test, type, import, and route.
- Update this file if a removed feature was listed in scope.

---

## 9. User context

- Operator: apialam008@gmail.com
- Today: 2026-04-22 (Bangladesh time UTC+6)
- Repo: local at `/Users/apialam/Desktop/WORK/side-projects/bangla-pay`
- Branch: `main` (clean as of init)

---

## 10. Required reading for UI work

- [`DESIGN.md`](./DESIGN.md) — Wise-inspired visual system, typography, color, components. **Always load for any UI work.** Do not invent tokens.
