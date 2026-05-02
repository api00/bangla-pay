"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  markMessageRead,
  replyToMessage,
  type ReplyState,
} from "@/app/dashboard/messages/_actions";
import type { MessageWithTip } from "@/db/queries/messages";
import { formatBdtDateTime, timeAgo } from "@/lib/dates";
import { formatTaka } from "@/lib/money";

const initialState: ReplyState = { ok: false };

interface MessageCardProps {
  message: MessageWithTip;
}

function initialOf(name: string | null, email: string | null): string {
  const source = (name?.trim() || email?.trim() || "").trim();
  return source[0]?.toUpperCase() ?? "?";
}

function displayName(message: MessageWithTip): string {
  if (message.supporterName?.trim()) return message.supporterName.trim();
  if (message.supporterEmail) return message.supporterEmail;
  return "Anonymous";
}

function ReplyButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-[#0e0f0c] text-white text-[13px] font-semibold hover:bg-[#163300] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Sending…" : "Send reply"}
    </button>
  );
}

export default function MessageCard({ message }: MessageCardProps) {
  const [state, formAction] = useActionState(replyToMessage, initialState);
  const [replyOpen, setReplyOpen] = useState(false);
  const hasReplied = Boolean(message.replyBody);
  const showReplyForm = !hasReplied && (replyOpen || !message.isRead);

  return (
    <article
      className={`rounded-[24px] border p-5 md:p-6 transition-colors ${
        message.isRead
          ? "bg-white border-[rgba(14,15,12,0.06)]"
          : "bg-[#f7faf3] border-[#cdffad]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#cdffad] to-[#e2f6d5] flex items-center justify-center shrink-0">
          <span className="text-[13px] font-semibold text-[#163300]">
            {initialOf(message.supporterName, message.supporterEmail)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-[#0e0f0c] truncate">
                {displayName(message)}
              </div>
              <div className="text-[12px] text-[#868685] tabular-nums">
                {formatBdtDateTime(message.createdAt)} ·{" "}
                {timeAgo(message.createdAt)}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {message.kind === "tip" && message.tipAmountPaisa !== null && (
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full bg-[#e2f6d5] text-[#163300]">
                  Tip · {formatTaka(message.tipAmountPaisa)}
                </span>
              )}
              {message.kind === "order" && (
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full bg-[#fff4d9] text-[#7a5b00]">
                  Order
                </span>
              )}
              {!message.isRead && (
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded-full bg-[#da291c] text-white">
                  New
                </span>
              )}
            </div>
          </div>

          <p className="mt-3 text-[14px] text-[#0e0f0c] leading-[1.6] whitespace-pre-line">
            {message.body}
          </p>

          {hasReplied ? (
            <div className="mt-4 pl-4 border-l-2 border-[#9fe870]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#868685] mb-1">
                Your reply ·{" "}
                {message.repliedAt ? timeAgo(message.repliedAt) : ""}
              </div>
              <p className="text-[13px] text-[#454745] leading-[1.6] whitespace-pre-line">
                {message.replyBody}
              </p>
            </div>
          ) : showReplyForm ? (
            <form action={formAction} className="mt-4 space-y-2">
              <input type="hidden" name="message_id" value={message.id} />
              <textarea
                name="reply"
                rows={3}
                maxLength={1000}
                placeholder="Write a quick thank-you…"
                className="w-full px-4 py-3 rounded-2xl border border-[rgba(14,15,12,0.1)] bg-white text-[14px] text-[#0e0f0c] placeholder:text-[#868685] focus:outline-none focus:border-[#163300] focus:ring-2 focus:ring-[#9fe870]/40 resize-y"
                required
              />
              {state.error && (
                <p className="text-[12px] text-[#a3221a] font-medium">
                  {state.error}
                </p>
              )}
              <div className="flex items-center justify-end gap-2">
                {message.isRead && (
                  <button
                    type="button"
                    onClick={() => setReplyOpen(false)}
                    className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c] px-3 h-10 rounded-full"
                  >
                    Cancel
                  </button>
                )}
                <ReplyButton />
              </div>
            </form>
          ) : (
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReplyOpen(true)}
                className="text-[13px] font-semibold text-[#163300] underline underline-offset-4 decoration-[#9fe870] decoration-[2px] hover:decoration-[#cdffad]"
              >
                Reply
              </button>
              {!message.isRead && (
                <form
                  action={async () => {
                    await markMessageRead(message.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
                  >
                    Mark as read
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
