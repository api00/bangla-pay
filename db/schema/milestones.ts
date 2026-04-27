import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { creators } from "./creators";
import { milestoneKind } from "./enums";

// ---------- milestones ----------
// Cha goals, supporter-count badges, product-sales achievements.
// Heritage Red badge appears when `reachedAt` is set and `isPublic`.
export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    kind: milestoneKind("kind").notNull(),
    threshold: integer("threshold").notNull(),
    title: text("title").notNull(),
    isPublic: boolean("is_public").notNull().default(true),
    reachedAt: timestamp("reached_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("milestones_creator_idx").on(table.creatorId)],
);

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;
