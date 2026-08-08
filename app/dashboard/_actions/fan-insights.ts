"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  getFanMessageState,
  getLatestFanInsight,
  isInsightStale,
  listFanMessageBodies,
} from "@/db/queries/fan-insights";
import { creatorFanInsights } from "@/db/schema";
import { getAiModel, isAiConfigured } from "@/lib/ai/client";
import {
  analyseFanMessages,
  MAX_MESSAGES_ANALYSED,
  MIN_MESSAGES_FOR_INSIGHT,
} from "@/lib/ai/fan-insights";
import { requireCreator } from "@/lib/auth";

// Read the creator's supporter messages into a happiness score and a list of
// what people are asking for next.
//
// Triggered from the dashboard rather than run on render: reading the inbox
// costs money, and a page refresh should not.

export interface FanInsightResult {
  ok: boolean;
  /** Why no insight came back, when the attempt ended without an error. */
  skipped?: "disabled" | "too_few" | "unusable";
  messagesAvailable?: number;
  error?: string;
}

export async function refreshFanInsights(): Promise<FanInsightResult> {
  const { creator } = await requireCreator();

  if (!isAiConfigured()) return { ok: true, skipped: "disabled" };

  const state = await getFanMessageState(creator.id);
  if (state.total < MIN_MESSAGES_FOR_INSIGHT) {
    return { ok: true, skipped: "too_few", messagesAvailable: state.total };
  }

  // Nothing new since the last read — reuse it rather than pay again.
  const existing = await getLatestFanInsight(creator.id);
  if (!isInsightStale(existing, state)) return { ok: true };

  const bodies = await listFanMessageBodies(creator.id, MAX_MESSAGES_ANALYSED);

  let outcome;
  try {
    outcome = await analyseFanMessages(bodies);
  } catch (error) {
    console.error("[ai.fan-insights]", {
      creatorId: creator.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: "Couldn't read your messages just now." };
  }

  if (outcome.status === "too_few") {
    return {
      ok: true,
      skipped: "too_few",
      messagesAvailable: outcome.messagesAvailable,
    };
  }
  if (outcome.status === "unusable") {
    console.error("[ai.fan-insights] unusable", {
      creatorId: creator.id,
      reason: outcome.reason,
    });
    return { ok: true, skipped: "unusable" };
  }

  const { insight } = outcome;
  try {
    await db.insert(creatorFanInsights).values({
      creatorId: creator.id,
      happinessScore: insight.happinessScore,
      mood: insight.mood,
      summary: insight.summary,
      wantsNext: insight.wantsNext,
      confidence: insight.confidence,
      messagesAnalysed: insight.messagesAnalysed,
      latestMessageAt: state.latestAt,
      model: getAiModel(),
    });
  } catch (error) {
    console.error("[ai.fan-insights] persist failed", {
      creatorId: creator.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: "Couldn't save the result. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/messages");
  return { ok: true };
}
