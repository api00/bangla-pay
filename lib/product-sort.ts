// Sort options for the dashboard shop listing.
//
// Deliberately outside `db/queries/products.ts`: that module is `server-only`
// and pulls in postgres/drizzle. The toolbar is a Client Component and needs
// these values, so they live in a module both sides can import.

export const PRODUCT_SORTS = [
  { value: "updated", label: "Recently updated" },
  { value: "newest", label: "Newest first" },
  { value: "title", label: "Name A–Z" },
  { value: "price", label: "Price: high to low" },
  { value: "sales", label: "Best selling" },
] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number]["value"];

export function isProductSort(value: unknown): value is ProductSort {
  return PRODUCT_SORTS.some((sort) => sort.value === value);
}
