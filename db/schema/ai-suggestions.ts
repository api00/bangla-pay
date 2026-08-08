import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { aiSuggestionStatus } from "./enums";
import { productFiles, products } from "./products";

// ---------- product_ai_suggestions ----------
// One row per attempt to read an uploaded file into listing fields.
//
// It exists to stop us paying twice for the same file: the wizard can be
// revisited, and re-reading a 40-page PDF on every visit is money for nothing.
// It doubles as the record of what was machine-written and what the creator
// typed themselves.
//
// `suggestion` holds the already-validated payload — never the raw model
// response. Nothing downstream should have to re-check it.
export const productAiSuggestions = pgTable(
  "product_ai_suggestions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    // Cascades with the file: a suggestion about a deleted upload is noise.
    productFileId: uuid("product_file_id")
      .notNull()
      .references(() => productFiles.id, { onDelete: "cascade" }),
    status: aiSuggestionStatus("status").notNull(),
    model: text("model").notNull(),
    suggestion: jsonb("suggestion"),
    /** Why a non-`ok` attempt ended that way. Operator-facing, never shown. */
    failureReason: text("failure_reason"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("product_ai_suggestions_file_idx").on(table.productFileId),
    index("product_ai_suggestions_product_idx").on(table.productId),
  ],
);

export type ProductAiSuggestion = typeof productAiSuggestions.$inferSelect;
export type NewProductAiSuggestion = typeof productAiSuggestions.$inferInsert;
