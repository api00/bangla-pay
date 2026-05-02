"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { messages } from "@/db/schema";
import { getCreatorForAction } from "@/lib/auth";

const REPLY_MAX = 1000;

export interface ReplyState {
  ok: boolean;
  error?: string;
}

export async function markMessageRead(messageId: string): Promise<void> {
  const session = await getCreatorForAction();
  if (!session) return;
  const creator = session.creator;

  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.id, messageId),
        eq(messages.creatorId, creator.id),
      ),
    );

  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
}

export async function markAllMessagesRead(): Promise<void> {
  const session = await getCreatorForAction();
  if (!session) return;
  const creator = session.creator;

  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.creatorId, creator.id),
        eq(messages.isRead, false),
      ),
    );

  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
}

export async function bulkMarkRead(messageIds: string[]): Promise<void> {
  if (messageIds.length === 0) return;
  const session = await getCreatorForAction();
  if (!session) return;
  const creator = session.creator;

  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.creatorId, creator.id),
        inArray(messages.id, messageIds),
      ),
    );

  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
}

export async function replyToMessage(
  _prev: ReplyState,
  formData: FormData,
): Promise<ReplyState> {
  const messageIdRaw = formData.get("message_id");
  const replyRaw = formData.get("reply");

  if (typeof messageIdRaw !== "string" || !messageIdRaw) {
    return { ok: false, error: "Message id is missing." };
  }
  if (typeof replyRaw !== "string") {
    return { ok: false, error: "Reply text is required." };
  }
  const reply = replyRaw.trim();
  if (!reply) {
    return { ok: false, error: "Reply cannot be empty." };
  }
  if (reply.length > REPLY_MAX) {
    return {
      ok: false,
      error: `Reply must be ${REPLY_MAX} characters or fewer.`,
    };
  }

  const session = await getCreatorForAction();
  if (!session) return { ok: false, error: "Please sign in again." };
  const creator = session.creator;

  await db
    .update(messages)
    .set({
      replyBody: reply,
      repliedAt: new Date(),
      isRead: true,
    })
    .where(
      and(
        eq(messages.id, messageIdRaw),
        eq(messages.creatorId, creator.id),
      ),
    );

  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  return { ok: true };
}
