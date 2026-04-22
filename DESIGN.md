# BanglaPay Design System

> A design system for **BanglaPay** — a Buy Me a Coffee-style support platform for Bangladeshi creators. Visual language inspired by Wise, adapted for the creator economy and a Bangladeshi audience.

## 1. Visual Theme & Atmosphere

BanglaPay is a bold, confident platform that communicates **"support without borders"** — connecting Bangladeshi creators with supporters at home and across the diaspora. The design takes Wise's fintech-grade boldness and applies it to the intimate act of tipping a creator.

The canvas is a warm off-white with near-black text (`#0e0f0c`) and a signature Wise-derived lime green (`#9fe870`) — fresh, optimistic, alive. Unlike the soft pastels and gradient-heavy aesthetic that dominates creator platforms, BanglaPay feels **stamped, pressed, physical** — the visual equivalent of a handwritten thank-you from a creator.

Typography uses Wise Sans at extreme weight 900 (black) with a remarkably tight line-height of 0.85 for display headings, and Inter at weight 600 as the default body voice. At 96px, a creator's name on their page feels like a protest sign — impossible to ignore. Interaction is physical: buttons grow on hover (`scale(1.05)`), compress on press (`scale(0.95)`), and never rely on color shifts alone.

A small **Heritage Red** (`#da291c`) accent — drawn from the Bangladeshi flag — appears sparingly on supporter-count badges and tip-milestone markers. It is **never** used for CTAs (green owns that role) but it anchors BanglaPay's identity as Bangladeshi-first.

**Key Characteristics:**
- Wise Sans at weight 900, 0.85 line-height — billboard-scale creator names
- Lime Green (`#9fe870`) with dark green text (`#163300`) — the "Buy a cha" CTA
- Heritage Red (`#da291c`) — used only for supporter badges and milestone markers
- Inter body at weight 600 as default — confident, not light
- `scale(1.05)` hover / `scale(0.95)` active — buttons physically respond
- OpenType `"calt"` on all text
- Pill buttons (9999px), large rounded creator cards (30–40px)
- Mobile-first: most Bangladeshi supporters are mobile-primary

## 2. Color Palette & Roles

### Primary Brand
- **Near Black** (`#0e0f0c`): Primary text, background for dark sections
- **Wise Green** (`#9fe870`): Primary CTA ("Buy a cha", "Support creator")
- **Dark Green** (`#163300`): Button text on green, deep green accent
- **Light Mint** (`#e2f6d5`): Soft surface for supporter cards, badge backgrounds
- **Pastel Green** (`#cdffad`): Interactive contrast hover state

### Heritage Accent
- **Heritage Red** (`#da291c`): Supporter-count badges, milestone markers, streak indicators
- **Heritage Red Soft** (`rgba(218, 41, 28, 0.10)`): Tint for milestone backgrounds

> **Rule**: Heritage Red is **never** a CTA. It is a cultural anchor — used for counts, badges, and "trending" markers only.

### Semantic
- **Positive Green** (`#054d28`): Success (tip sent, payout confirmed)
- **Danger Red** (`#d03238`): Error, destructive (delete, cancel tip)
- **Warning Yellow** (`#ffd11a`): Warning (low balance, unverified payout)
- **Background Cyan** (`rgba(56, 200, 255, 0.10)`): Info tint
- **Bright Orange** (`#ffc091`): Warm accent (reserved for promos)

### Neutral
- **Warm Dark** (`#454745`): Secondary text, borders
- **Gray** (`#868685`): Muted text, tertiary, placeholder
- **Light Surface** (`#e8ebe6`): Subtle green-tinted surface

### Currency
- **BDT Accent**: Use `#163300` (Dark Green) for the `৳` symbol in prominent tip amounts, matching button text tone.

## 3. Typography Rules

### Font Families
- **Display**: `Wise Sans`, fallback: `Inter` — OpenType `"calt"` on all text
- **Body / UI (Latin)**: `Inter`, fallbacks: `Helvetica, Arial`
- **Body / UI (Bangla)**: `Noto Sans Bengali`, fallback: `SolaimanLipi`

> **Bilingual Pairing**: Creator names, tip amounts, and supporter messages may appear in Bangla. Pair Inter (Latin) with Noto Sans Bengali (Bangla) — both have weight 600 available and similar x-heights. Never stack Bangla text at weight 900 in Wise Sans — Wise Sans has no Bangla coverage; display-scale Bangla headlines should use Noto Sans Bengali at weight 900 with the same 0.85 line-height.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Mega | Wise Sans | 126px (7.88rem) | 900 | 0.85 | normal | `"calt"` — landing hero |
| Display Hero | Wise Sans | 96px (6.00rem) | 900 | 0.85 | normal | `"calt"` — creator name on profile |
| Section Heading | Wise Sans | 64px (4.00rem) | 900 | 0.85 | normal | `"calt"` |
| Sub-heading | Wise Sans | 40px (2.50rem) | 900 | 0.85 | normal | `"calt"` |
| Alt Heading | Inter | 78px (4.88rem) | 600 | 1.10 | -2.34px | `"calt"` |
| Card Title | Inter | 26px (1.62rem) | 600 | 1.23 | -0.39px | `"calt"` — creator card name |
| Feature Title | Inter | 22px (1.38rem) | 600 | 1.25 | -0.396px | `"calt"` |
| Body | Inter | 18px (1.13rem) | 400 | 1.44 | 0.18px | `"calt"` — supporter messages |
| Body Semibold | Inter | 18px (1.13rem) | 600 | 1.44 | -0.108px | `"calt"` — default UI |
| Button | Inter | 18–22px | 600 | 1.00–1.44 | -0.108px | `"calt"` |
| Caption | Inter | 14px (0.88rem) | 400–600 | 1.50–1.86 | -0.084 to -0.108px | `"calt"` |
| Small | Inter | 12px (0.75rem) | 400–600 | 1.00–2.17 | -0.084 to -0.108px | `"calt"` — timestamps |
| Tip Amount Mega | Wise Sans | 96px | 900 | 0.85 | normal | `৳` in Dark Green |

### Numerals
- **Default**: Arabic numerals (0–9), tabular lining figures.
- **Optional**: Creators may opt in to display tip amounts in Bengali numerals (০–৯) on their own profile. The UI chrome (totals, timestamps) always uses Arabic numerals for consistency.
- Use `font-variant-numeric: tabular-nums` on all numeric displays (tip amounts, supporter counts, totals).

### Principles
- **Weight 900 as identity**: Wise Sans Black (900) is used exclusively for display. It is the heaviest weight in the system and creates text that feels stamped and physical.
- **0.85 line-height**: The tightest display line-height. Letters overlap vertically, creating dense, billboard-like text blocks. Never relax this on display text.
- **"calt" everywhere**: Contextual alternates enabled on ALL text — Wise Sans, Inter, and Noto Sans Bengali.
- **Weight 600 as body default**: Inter Semibold is the standard reading weight — confident, not light.

## 4. Component Stylings

### Buttons

**Primary Green Pill — "Buy a cha" / "Support"**
- Background: `#9fe870` (Wise Green)
- Text: `#163300` (Dark Green), Inter 600
- Padding: 5px 16px (small) / 12px 24px (large hero CTA)
- Radius: 9999px
- Hover: `scale(1.05)`
- Active: `scale(0.95)`
- Focus: inset ring + outline `2px solid #163300` with `2px` offset
- Transition: `transform 150ms ease-out`

**Secondary Subtle Pill**
- Background: `rgba(22, 51, 0, 0.08)` (dark green at 8% opacity)
- Text: `#0e0f0c`
- Padding: 8px 12px 8px 16px
- Radius: 9999px
- Same scale hover/active behavior

**Destructive Pill** (refund, delete tip)
- Background: `#d03238`
- Text: white
- Same pill shape and scale behavior

### Cards & Containers
- Small card: radius 16px
- Medium card: radius 30px (default for supporter cards)
- Large card: radius 40px (creator hero card, payout summary table)
- Border: `1px solid rgba(14, 15, 12, 0.12)` — or `1px solid #9fe870` when highlighted
- Shadow: `rgba(14, 15, 12, 0.12) 0px 0px 0px 1px` — ring shadow only

### Domain Components

**Tip Button ("Buy a cha")**
- Primary CTA variant of the green pill
- Label format: `Buy {name} a cha · ৳{amount}`
- Default amounts: `৳50`, `৳100`, `৳500` as chip options + custom input
- Amount chip: pill (9999px), `rgba(22, 51, 0, 0.08)` background, 18px Inter 600, scale hover
- On tip success: 600ms green flash (background `#cdffad` → `#9fe870`) + confetti-free haptic feedback only (no emoji storms)

**Creator Card**
- 30px radius
- Layout: circular avatar (radius 50%, 80–120px), creator name (Inter 600, 26px), bio (Inter 400, 18px, 2-line clamp)
- Supporter count: pill badge with Heritage Red (`#da291c`) text on `rgba(218, 41, 28, 0.10)` background, Inter 600, 14px, `৳` prefix for total raised
- Ring shadow: `rgba(14, 15, 12, 0.12) 0px 0px 0px 1px`
- Hover: no scale; green border highlight (`1px solid #9fe870`) over 150ms

**Supporter Row**
- 16px radius, 16px padding
- Layout: small avatar (32px, radius 50%), supporter name (Inter 600, 18px), tip amount (Inter 600, 18px, Dark Green `#163300`), optional message (Inter 400, 18px, gray `#868685`)
- Divider between rows: `1px solid rgba(14, 15, 12, 0.08)`
- "Anonymous" supporters: avatar fallback uses initials on `#e8ebe6`

**Milestone Marker**
- Inline badge shown on creator pages when milestones hit (100 supporters, ৳10,000 raised, etc.)
- Background: Heritage Red (`#da291c`)
- Text: white, Inter 600, 14px
- Radius: 9999px
- Padding: 4px 10px
- Icon: none — text only, cultural restraint

### Navigation
- Clean header with BanglaPay wordmark (Wise Sans 900, 22px, `#0e0f0c`)
- Primary CTA pill right-aligned
- Hover on nav links: `rgba(211, 242, 192, 0.4)` background, 10px radius
- Mobile: bottom nav preferred over hamburger (mobile-primary users)

### Inputs
- Text input: radius 10px, `1px solid #868685`, padding 12px 16px, Inter 400 18px
- Focus: inset ring `rgb(134, 134, 133) 0px 0px 0px 1px inset` + outline `2px solid #9fe870` offset 2px
- Currency input: `৳` prefix in Dark Green, tabular numerals for the amount

## 5. Layout Principles

### Spacing System
Base unit: **8px**. Scale: `1, 2, 3, 4, 5, 8, 10, 11, 12, 16, 18, 19, 20, 22, 24` (px).

### Border Radius Scale
| Token | Value | Use |
|-------|-------|-----|
| Minimal | 2px | Inline links, hairline inputs |
| Standard | 10px | Comboboxes, text inputs |
| Card | 16px | Small cards, supporter rows |
| Medium | 20px | Medium cards, inline links |
| Large | 30px | Creator cards, feature tiles |
| Section | 40px | Hero sections, payout tables |
| Mega | 1000px | Presentation surfaces |
| Pill | 9999px | All buttons, amount chips, badges |
| Circle | 50% | Avatars, icon circles |

### Page Grid
- Max content width: 1200px
- Gutter: 24px (desktop), 16px (mobile)
- Creator page: single-column on mobile (<768px), 2-column (creator info + tip panel) on desktop

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (0) | No shadow | Default |
| Ring (1) | `rgba(14, 15, 12, 0.12) 0px 0px 0px 1px` | Card borders |
| Inset (2) | `rgb(134, 134, 133) 0px 0px 0px 1px inset` | Input focus |

**Shadow Philosophy**: Minimal — ring shadows only. Depth comes from the bold green accent and typographic weight against the neutral canvas, not from drop shadows.

## 7. Do's and Don'ts

### Do
- Use Wise Sans weight 900 for display — the extreme boldness IS the brand
- Keep line-height 0.85 on all Wise Sans display — ultra-tight is intentional
- Use Lime Green (`#9fe870`) with Dark Green (`#163300`) text for all primary CTAs
- Apply `scale(1.05)` hover and `scale(0.95)` active on every interactive element
- Enable `"calt"` on all text
- Use Inter weight 600 as the body default
- Pair Latin with Noto Sans Bengali for bilingual content at the same weight
- Use `tabular-nums` on every numeric display
- Use Heritage Red (`#da291c`) **only** for supporter-count badges and milestone markers

### Don't
- Don't use light font weights for Wise Sans — only 900
- Don't relax the 0.85 line-height on display — the density is the identity
- Don't use Wise Green as a background for large surfaces — it's for buttons and accents
- Don't use Heritage Red as a CTA or button background — that's green's territory
- Don't skip the scale animation on buttons — it's how BanglaPay "feels"
- Don't use traditional drop shadows — ring shadows only
- Don't set Bangla text in Wise Sans — use Noto Sans Bengali
- Don't overuse the Bangladeshi flag palette; one accent is enough, the rest is Wise-green
- Don't use confetti, emoji storms, or celebratory animation on tip success — rely on the scale flash and a calm state transition

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <576px | Single column, bottom-nav, 16px gutter |
| Tablet | 576–992px | 2-column supporter lists, side nav optional |
| Desktop | 992–1440px | Full 2-column creator page, 24px gutter |
| Large | >1440px | Expanded max-width to 1200px, generous whitespace |

**Mobile-first priority**: Most Bangladeshi supporters reach BanglaPay via mobile. Display Mega (126px) scales down to 64px on mobile; Display Hero (96px) scales to 48px. The 0.85 line-height holds at all sizes.

### Tip Flow on Mobile
- Single tap to amount chip → sheet modal (not full page) → confirm
- Keep hero CTA sticky on creator pages when scrolling below fold
- Bangla numerals, if enabled by creator, never render smaller than 18px

## 9. Agent Prompt Guide

### Quick Color Reference
- Text: Near Black (`#0e0f0c`)
- Background: White (`#ffffff`) or off-white
- Primary accent / CTA: Wise Green (`#9fe870`)
- Button text: Dark Green (`#163300`)
- Cultural accent: Heritage Red (`#da291c`) — badges only
- Secondary text: Gray (`#868685`)

### Example Component Prompts

**Creator Page Hero**
> "Build a creator profile hero: white background. Creator name at 96px Wise Sans weight 900, line-height 0.85, `'calt'` enabled, `#0e0f0c` text. Bio below at 22px Inter weight 600, `#454745`. Green pill CTA labeled `Buy {name} a cha · ৳100` (`#9fe870` background, `#163300` text, 9999px radius, 12px 24px padding). Hover: `scale(1.05)`. Active: `scale(0.95)`. Supporter count as Heritage Red badge (pill, `#da291c` text on `rgba(218,41,28,0.10)`)."

**Supporter Card Grid**
> "Build a 3-column supporter card grid (2-col tablet, 1-col mobile). Card radius 30px, 1px solid `rgba(14,15,12,0.12)`. Avatar 80px circle. Name at 26px Inter 600, letter-spacing -0.39px. Amount at 18px Inter 600, Dark Green `#163300`, tabular-nums. Message at 18px Inter 400, gray `#868685`, 2-line clamp."

**Tip Amount Chips**
> "Row of 4 pill chips: `৳50`, `৳100`, `৳500`, `Custom`. Each: 9999px radius, `rgba(22,51,0,0.08)` background, Inter 600 18px `#0e0f0c` text, 8px 16px padding. Selected: `#9fe870` background, `#163300` text. Scale 1.05 hover, 0.95 active."

**Milestone Announcement Bar**
> "Inline bar below creator hero: 9999px radius, `#da291c` background, white Inter 600 14px text. Content: `100 supporters — thank you!`. No icon, no emoji. 4px 10px padding."

### Iteration Guide
1. **Wise Sans 900 at 0.85 line-height** — the extreme weight IS the brand. Never compromise.
2. **Green for CTAs, Red for identity** — Lime Green owns interaction; Heritage Red owns cultural anchoring. Never swap them.
3. **Scale animations (1.05 hover, 0.95 active)** on every interactive element — no color-only hover states.
4. **`"calt"` everywhere** — contextual alternates are mandatory across Wise Sans, Inter, and Noto Sans Bengali.
5. **Inter 600 for body** — confident reading weight, not thin or regular.
6. **Ring shadows only** — depth is typographic, not drop-shadowed.
7. **Mobile-first** — every component must pass the mobile test before desktop polish.

---

**Tech stack note**: This project uses Next.js 16, React 19, and Tailwind v4. Codify these tokens in `app/globals.css` using `@theme` / CSS custom properties (see Tailwind v4 theme API) rather than extending a JS config.
