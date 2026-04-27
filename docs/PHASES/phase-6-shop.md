# Phase 6 — Shop (digital products, mock checkout, signed downloads)

**Goal:** creators can list digital products on their shop, supporters can buy them through the same mock checkout flow as tips, and on successful purchase the supporter gets time-limited signed download links emailed (Phase 9) and viewable on a per-order success page.

Reuses the mock checkout pattern. Phase 5 (real providers) stays deferred.

## Deliverables

### 6.1 Storage

- [x] Supabase Storage helper to issue signed upload URLs (server-only, scoped to the creator's product folder)
- [x] Bucket convention documented: `product-files` (private), path `creators/{creatorId}/products/{productId}/{fileId}-{filename}`
- [x] Bucket creation script (`scripts/ensure-storage.mjs`) — idempotent, run once
- [x] `SUPABASE_SERVICE_ROLE_KEY` set in `.env.local` and buckets created via `npm run db:storage` (2026-04-27)

### 6.2 Server actions

- [x] `app/dashboard/shop/_actions/create-product.ts` — slug + title + price + pricing model
- [x] `app/dashboard/shop/_actions/update-product.ts` — full edit
- [x] `app/dashboard/shop/_actions/publish-product.ts` — toggle `is_published`
- [x] `app/dashboard/shop/_actions/delete-product.ts` — confirms via form, hard-deletes
- [x] `app/dashboard/shop/_actions/upload-file.ts` — issues a signed upload URL, returns it to the client; client PUTs to Storage; client calls `register-file` server action with the path + filename + size + mime
- [x] `app/dashboard/shop/_actions/register-file.ts` — inserts `product_files` row after Storage upload completes
- [x] `app/dashboard/shop/_actions/delete-file.ts` — removes `product_files` row + Storage object

### 6.3 Dashboard surfaces

- [x] `/dashboard/shop` — product list (cards) with publish toggle, sales count, edit link
- [x] `/dashboard/shop/new` — create flow: title + slug suggestion + pricing model
- [x] `/dashboard/shop/[productId]/edit` — full product editor with file uploader
- [x] `/dashboard/orders` — order list (creator-facing, paginated)
- [x] `/dashboard/orders/[orderId]` — order detail (items, supporter, amount, download status)
- [x] Sidebar "Shop" entry → `/dashboard/shop`

### 6.4 Public shop surfaces

- [x] `/{handle}/shop` — published product grid
- [x] `/{handle}/shop/[slug]` — product detail with description, price, "Buy now" form
- [x] `<ShopPreview>` on `/{handle}` replaced with first 3 published products + "View all"

### 6.5 Buy flow (mock)

- [x] `app/[handle]/shop/[slug]/_actions/start-purchase.ts` — validates + inserts `orders` (pending) + `order_items` rows, redirects to `/checkout/stub/order/<orderId>`
- [x] `/checkout/stub/order/[orderId]/page.tsx` — same mock-checkout shape as tips
- [x] `markOrderPaid` flips `orders` to `paid`, generates `order_downloads` rows with random tokens + 7-day expiry, increments `products.totalSales`
- [x] `markOrderFailed` flips to `failed`
- [x] `/checkout/success` accepts `?order=<id>` and renders the per-order download list

### 6.6 Download surface

- [x] `/d/[token]/route.ts` — validates token, expiry, download cap; streams file via Storage signed URL; increments `downloadsUsed`
- [x] If exhausted/expired: clean error page

### 6.7 Queries

- [x] `db/queries/products.ts` — `listProductsForCreator`, `getProductById`, `getPublishedProductsByCreator`, `getPublicProduct(handle, slug)`
- [x] `db/queries/orders.ts` — `listOrdersForCreator`, `getOrderForCreator`, `getOrderForSupporter` (by id + email match)

## Out of scope (explicitly)

- Cart / multi-product checkout in a single order beyond the API shape (UI buys exactly one product per order in v1)
- Discount codes, taxes
- Variants UI (the schema supports `product_variants` but the editor just exposes the base price for now)
- Receipt emails (Phase 9)
- Refunds (deferred with payments)

## Acceptance

- Creator can create, edit, publish, and delete a product
- Creator can upload files and they appear under the product
- Supporter sees published products on `/{handle}/shop`
- Supporter can buy a product via mock checkout, receives download link on success page
- `/d/{token}` streams the file once, increments counter, returns 410 after limit/expiry
- `npm run build` green, `npx tsc --noEmit` clean
