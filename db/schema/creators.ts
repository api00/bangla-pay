import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { creatorCategory, onboardingStep } from "./enums";

// ---------- creators ----------
// `userId` points at Supabase's `auth.users.id`.
// Drizzle cannot own `auth.*`, so the cross-schema FK is added via a hand-written SQL migration.
export const creators = pgTable(
  "creators",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(),
    handle: text("handle").notNull(),
    displayName: text("display_name").notNull(),
    email: text("email").notNull(),
    category: creatorCategory("category").notNull().default("other"),
    country: text("country").notNull().default("BD"),
    onboardingStep: onboardingStep("onboarding_step")
      .notNull()
      .default("handle"),
    isVerified: boolean("is_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("creators_user_id_unique").on(table.userId),
    uniqueIndex("creators_handle_unique").on(table.handle),
  ],
);

// ---------- creator_pages ----------
// 1:1 with creators — page customization. Split out so heavy edits don't churn `creators`.
export const creatorPages = pgTable("creator_pages", {
  creatorId: uuid("creator_id")
    .primaryKey()
    .references(() => creators.id, { onDelete: "cascade" }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  themeColor: text("theme_color").notNull().default("#9fe870"),
  chaEmoji: text("cha_emoji").notNull().default("☕"),
  chaLabel: text("cha_label").notNull().default("cha"),
  chaUnitPaisa: integer("cha_unit_paisa").notNull().default(5000),
  socialLinks: jsonb("social_links")
    .$type<{
      twitter?: string;
      instagram?: string;
      youtube?: string;
      facebook?: string;
      website?: string;
    }>()
    .notNull()
    .default({}),
  showSupporters: boolean("show_supporters").notNull().default(true),
  showTotalRaised: boolean("show_total_raised").notNull().default(true),
  bnNumerals: boolean("bn_numerals").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------- tip_presets ----------
// Default tip amounts shown on the public page (e.g. ৳50, ৳100, ৳500 + custom).
export const tipPresets = pgTable(
  "tip_presets",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    amountPaisa: integer("amount_paisa").notNull(),
    label: text("label"),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("tip_presets_creator_position_unique").on(
      table.creatorId,
      table.position,
    ),
  ],
);

export type Creator = typeof creators.$inferSelect;
export type NewCreator = typeof creators.$inferInsert;
export type CreatorPage = typeof creatorPages.$inferSelect;
export type NewCreatorPage = typeof creatorPages.$inferInsert;
export type TipPreset = typeof tipPresets.$inferSelect;
export type NewTipPreset = typeof tipPresets.$inferInsert;
