import "server-only";

import { and, countDistinct, desc, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  creatorPages,
  creators,
  tipPresets,
  tips,
  type Creator,
  type CreatorPage,
  type TipPreset,
} from "@/db/schema";

export interface PublicProfileSupporter {
  id: string;
  supporterName: string | null;
  amountPaisa: number;
  message: string;
  createdAt: Date;
}

export interface PublicProfile {
  creator: Creator;
  page: CreatorPage;
  presets: TipPreset[];
  supporters: PublicProfileSupporter[];
  totalRaisedPaisa: number;
  supporterCount: number;
}

const SUPPORTER_WALL_LIMIT = 12;

const DEFAULT_PAGE: Omit<CreatorPage, "creatorId" | "updatedAt"> = {
  bio: null,
  avatarUrl: null,
  coverUrl: null,
  themeColor: "#9fe870",
  chaEmoji: "☕",
  chaLabel: "cha",
  chaUnitPaisa: 5000,
  socialLinks: {},
  showSupporters: true,
  showTotalRaised: true,
  bnNumerals: false,
};

/**
 * Fetch all data needed to render a creator's public page.
 * Returns `null` if the handle isn't claimed.
 *
 * Public-safe: never returns email, payout info, or unpublished anything.
 * Server-only — uses Drizzle directly.
 */
export async function getPublicProfile(
  handle: string,
): Promise<PublicProfile | null> {
  const creatorRows = await db
    .select()
    .from(creators)
    .where(eq(creators.handle, handle))
    .limit(1);
  const creator = creatorRows[0];
  if (!creator) return null;

  const [pageRows, presetRows, walletRows, aggregateRows] = await Promise.all([
    db
      .select()
      .from(creatorPages)
      .where(eq(creatorPages.creatorId, creator.id))
      .limit(1),
    db
      .select()
      .from(tipPresets)
      .where(eq(tipPresets.creatorId, creator.id))
      .orderBy(tipPresets.position),
    db
      .select({
        id: tips.id,
        supporterName: tips.supporterName,
        amountPaisa: tips.amountPaisa,
        message: tips.message,
        createdAt: tips.createdAt,
      })
      .from(tips)
      .where(
        and(
          eq(tips.creatorId, creator.id),
          eq(tips.status, "succeeded"),
          eq(tips.messageIsPublic, true),
          isNotNull(tips.message),
        ),
      )
      .orderBy(desc(tips.createdAt))
      .limit(SUPPORTER_WALL_LIMIT),
    db
      .select({
        totalRaisedPaisa: sql<number>`COALESCE(SUM(${tips.amountPaisa}), 0)::int`,
        supporterCount: countDistinct(tips.supporterEmail),
      })
      .from(tips)
      .where(
        and(eq(tips.creatorId, creator.id), eq(tips.status, "succeeded")),
      ),
  ]);

  const supporters: PublicProfileSupporter[] = walletRows
    .filter((row): row is typeof row & { message: string } => row.message !== null);

  const aggregate = aggregateRows[0] ?? {
    totalRaisedPaisa: 0,
    supporterCount: 0,
  };

  const page: CreatorPage = pageRows[0] ?? {
    creatorId: creator.id,
    updatedAt: new Date(),
    ...DEFAULT_PAGE,
  };

  return {
    creator,
    page,
    presets: presetRows,
    supporters,
    totalRaisedPaisa: Number(aggregate.totalRaisedPaisa) || 0,
    supporterCount: Number(aggregate.supporterCount) || 0,
  };
}
