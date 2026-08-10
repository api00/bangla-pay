import EmptyState from "@/components/dashboard/EmptyState";
import { MessageIcon } from "@/components/dashboard/icons";
import MarkAllReadButton from "@/components/dashboard/messages/MarkAllReadButton";
import MessageCard from "@/components/dashboard/messages/MessageCard";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  countAwaitingReply,
  countUnreadMessages,
  listMessagesForCreator,
} from "@/db/queries/messages";
import { getFanMessageState } from "@/db/queries/fan-insights";
import { requireCreator } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages · BanglaPay" };

export default async function DashboardMessagesPage() {
  const { creator } = await requireCreator();

  const [messages, messageState, unreadCount, awaitingReply] = await Promise.all([
    listMessagesForCreator(creator.id, { limit: 100 }),
    getFanMessageState(creator.id),
    countUnreadMessages(creator.id),
    countAwaitingReply(creator.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        subtitle="Notes from your supporters. Replies are private."
        action={<MarkAllReadButton disabled={unreadCount === 0} />}
      />

      <dl className="grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Total" value={String(messageState.total)} />
        <Stat label="Unread" value={String(unreadCount)} highlight={unreadCount > 0} />
        <Stat label="Awaiting reply" value={String(awaitingReply)} />
      </dl>

      {messages.length === 0 ? (
        <EmptyState
          icon={<MessageIcon width={22} height={22} />}
          title="No messages yet"
          body="When supporters leave a note with their tip, it'll land here. Quick replies are great for retention."
        />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <MessageCard key={m.id} message={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-5 py-4 ${
        highlight
          ? "bg-[#f7faf3] border-pastel-green"
          : "bg-white border-[rgba(14,15,12,0.06)]"
      }`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray">
        {label}
      </div>
      <div className="mt-1 text-[22px] font-semibold tabular-nums text-near-black">
        {value}
      </div>
    </div>
  );
}
