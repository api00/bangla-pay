import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";

export interface SupporterSummary {
  email: string | null;
  displayName: string | null;
  contributionCount: number;
  tipCount: number;
  orderCount: number;
  totalPaisa: number;
  lastContributionAt: Date;
  firstContributionAt: Date;
}

export interface CreatorSupporterStats {
  supporterCount: number;
  totalContributedPaisa: number;
}

interface SupporterRow extends Record<string, unknown> {
  email: string | null;
  display_name: string | null;
  contribution_count: number;
  tip_count: number;
  order_count: number;
  total_paisa: number;
  last_contribution_at: string | Date;
  first_contribution_at: string | Date;
}

interface SupporterStatsRow extends Record<string, unknown> {
  supporter_count: number;
  total_contributed_paisa: number;
}

/**
 * Roll up every completed payment into one row per supporter.
 *
 * A supporter is identified by normalized email first so older payments that
 * predate supporter rows still merge with newer ones. The durable row and
 * name are fallbacks; a fully anonymous tip remains its own supporter.
 */
export async function listSupportersForCreator(
  creatorId: string,
  limit = 100,
): Promise<SupporterSummary[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 500);
  const rows = await db.execute<SupporterRow>(sql`
    WITH contributions AS (
      SELECT
        COALESCE(
          CASE WHEN NULLIF(TRIM(supporter_email), '') IS NOT NULL
            THEN 'email:' || LOWER(TRIM(supporter_email)) END,
          CASE WHEN supporter_id IS NOT NULL
            THEN 'supporter:' || supporter_id::text END,
          CASE WHEN NULLIF(TRIM(supporter_name), '') IS NOT NULL
            THEN 'name:' || LOWER(TRIM(supporter_name)) END,
          'tip:' || id::text
        ) AS supporter_key,
        LOWER(NULLIF(TRIM(supporter_email), '')) AS email,
        NULLIF(TRIM(supporter_name), '') AS display_name,
        1::int AS tip_count,
        0::int AS order_count,
        amount_paisa,
        COALESCE(paid_at, created_at) AS contribution_at
      FROM tips
      WHERE creator_id = ${creatorId} AND status = 'succeeded'

      UNION ALL

      SELECT
        COALESCE(
          CASE WHEN NULLIF(TRIM(supporter_email), '') IS NOT NULL
            THEN 'email:' || LOWER(TRIM(supporter_email)) END,
          CASE WHEN supporter_id IS NOT NULL
            THEN 'supporter:' || supporter_id::text END,
          'order:' || id::text
        ) AS supporter_key,
        LOWER(NULLIF(TRIM(supporter_email), '')) AS email,
        NULLIF(TRIM(supporter_name), '') AS display_name,
        0::int AS tip_count,
        1::int AS order_count,
        total_paisa AS amount_paisa,
        COALESCE(paid_at, created_at) AS contribution_at
      FROM orders
      WHERE creator_id = ${creatorId} AND status = 'paid'
    )
    SELECT
      MAX(email) AS email,
      (ARRAY_AGG(display_name ORDER BY contribution_at DESC)
        FILTER (WHERE display_name IS NOT NULL))[1] AS display_name,
      COUNT(*)::int AS contribution_count,
      SUM(tip_count)::int AS tip_count,
      SUM(order_count)::int AS order_count,
      COALESCE(SUM(amount_paisa), 0)::int AS total_paisa,
      MAX(contribution_at) AS last_contribution_at,
      MIN(contribution_at) AS first_contribution_at
    FROM contributions
    GROUP BY supporter_key
    ORDER BY total_paisa DESC, last_contribution_at DESC
    LIMIT ${safeLimit}
  `);

  return rows.map((row) => ({
    email: row.email,
    displayName: row.display_name,
    contributionCount: Number(row.contribution_count) || 0,
    tipCount: Number(row.tip_count) || 0,
    orderCount: Number(row.order_count) || 0,
    totalPaisa: Number(row.total_paisa) || 0,
    lastContributionAt:
      row.last_contribution_at instanceof Date
        ? row.last_contribution_at
        : new Date(row.last_contribution_at),
    firstContributionAt:
      row.first_contribution_at instanceof Date
        ? row.first_contribution_at
        : new Date(row.first_contribution_at),
  }));
}

/** Lifetime unique supporters and money across tips plus paid shop orders. */
export async function getCreatorSupporterStats(
  creatorId: string,
): Promise<CreatorSupporterStats> {
  const rows = await db.execute<SupporterStatsRow>(sql`
    WITH identities AS (
      SELECT
        COALESCE(
          CASE WHEN NULLIF(TRIM(supporter_email), '') IS NOT NULL
            THEN 'email:' || LOWER(TRIM(supporter_email)) END,
          CASE WHEN supporter_id IS NOT NULL
            THEN 'supporter:' || supporter_id::text END,
          CASE WHEN NULLIF(TRIM(supporter_name), '') IS NOT NULL
            THEN 'name:' || LOWER(TRIM(supporter_name)) END,
          'tip:' || id::text
        ) AS supporter_key,
        amount_paisa
      FROM tips
      WHERE creator_id = ${creatorId} AND status = 'succeeded'

      UNION ALL

      SELECT
        COALESCE(
          CASE WHEN NULLIF(TRIM(supporter_email), '') IS NOT NULL
            THEN 'email:' || LOWER(TRIM(supporter_email)) END,
          CASE WHEN supporter_id IS NOT NULL
            THEN 'supporter:' || supporter_id::text END,
          'order:' || id::text
        ) AS supporter_key,
        total_paisa AS amount_paisa
      FROM orders
      WHERE creator_id = ${creatorId} AND status = 'paid'
    ), rolled_up AS (
      SELECT supporter_key, SUM(amount_paisa)::int AS total_paisa
      FROM identities
      GROUP BY supporter_key
    )
    SELECT
      COUNT(*)::int AS supporter_count,
      COALESCE(SUM(total_paisa), 0)::int AS total_contributed_paisa
    FROM rolled_up
  `);
  const row = rows[0];

  return {
    supporterCount: Number(row?.supporter_count) || 0,
    totalContributedPaisa: Number(row?.total_contributed_paisa) || 0,
  };
}
