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

import { creators } from "./creators";
import { fanMood } from "./enums";

// ---------- creator_fan_insights ----------
// What the supporter messages add up to: how happy the community is, and
// what they keep asking for.
//
// Stored rather than computed on view. Reading every message on each
// dashboard load would bill the creator for a page refresh, so a row is kept
// and reused until new messages arrive — `messagesAnalysed` and
// `latestMessageAt` together are the cache key.
export const creatorFanInsights = pgTable(
  "creator_fan_insights",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    /** 0–100. How happy the supporters read overall. */
    happinessScore: integer("happiness_score").notNull(),
    mood: fanMood("mood").notNull(),
    summary: text("summary").notNull(),
    /** `[{ topic, evidence }]` — what supporters are asking for next. */
    wantsNext: jsonb("wants_next").notNull().default(sql`'[]'::jsonb`),
    /** Low when there are too few messages to read much into. */
    confidence: text("confidence").notNull(),
    messagesAnalysed: integer("messages_analysed").notNull(),
    /** Newest message included. With the count, this is the cache key. */
    latestMessageAt: timestamp("latest_message_at", { withTimezone: true }),
    model: text("model").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("creator_fan_insights_creator_idx").on(
      table.creatorId,
      table.createdAt,
    ),
  ],
);

export type CreatorFanInsight = typeof creatorFanInsights.$inferSelect;
export type NewCreatorFanInsight = typeof creatorFanInsights.$inferInsert;

/** One thing supporters are asking for, with the wording that showed it. */
export interface FanWant {
  topic: string;
  evidence: string;
}
