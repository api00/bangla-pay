import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { messages, tips, type Message } from "@/db/schema";

export interface MessageWithTip extends Message {
  tipAmountPaisa: number | null;
}

export async function listMessagesForCreator(
  creatorId: string,
  options: { onlyUnread?: boolean; limit?: number } = {},
): Promise<MessageWithTip[]> {
  const { onlyUnread = false, limit = 100 } = options;
  const where = onlyUnread
    ? and(eq(messages.creatorId, creatorId), eq(messages.isRead, false))
    : eq(messages.creatorId, creatorId);

  const rows = await db
    .select({
      id: messages.id,
      creatorId: messages.creatorId,
      kind: messages.kind,
      tipId: messages.tipId,
      orderId: messages.orderId,
      supporterName: messages.supporterName,
      supporterEmail: messages.supporterEmail,
      body: messages.body,
      isRead: messages.isRead,
      replyBody: messages.replyBody,
      repliedAt: messages.repliedAt,
      createdAt: messages.createdAt,
      tipAmountPaisa: tips.amountPaisa,
    })
    .from(messages)
    .leftJoin(tips, eq(tips.id, messages.tipId))
    .where(where)
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  return rows;
}

export async function getMessageForCreator(
  creatorId: string,
  messageId: string,
): Promise<MessageWithTip | null> {
  const rows = await db
    .select({
      id: messages.id,
      creatorId: messages.creatorId,
      kind: messages.kind,
      tipId: messages.tipId,
      orderId: messages.orderId,
      supporterName: messages.supporterName,
      supporterEmail: messages.supporterEmail,
      body: messages.body,
      isRead: messages.isRead,
      replyBody: messages.replyBody,
      repliedAt: messages.repliedAt,
      createdAt: messages.createdAt,
      tipAmountPaisa: tips.amountPaisa,
    })
    .from(messages)
    .leftJoin(tips, eq(tips.id, messages.tipId))
    .where(and(eq(messages.creatorId, creatorId), eq(messages.id, messageId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function countUnreadMessages(creatorId: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(messages)
    .where(
      and(eq(messages.creatorId, creatorId), eq(messages.isRead, false)),
    );
  return Number(rows[0]?.count ?? 0);
}

export async function countAwaitingReply(creatorId: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(messages)
    .where(
      and(eq(messages.creatorId, creatorId), isNull(messages.replyBody)),
    );
  return Number(rows[0]?.count ?? 0);
}
