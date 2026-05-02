import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/settings/Card";
import CopyLinkButton from "@/components/dashboard/settings/page/CopyLinkButton";
import { requireCreator } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Public page · Settings · BanglaPay" };

export default async function PublicPageSettingsPage() {
  const { creator } = await requireCreator();
  const url = `https://banglapay.com/${creator.handle}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Public page"
        subtitle="Your tip jar lives at this URL. Share it everywhere."
      />

      <Card title="Your link" description="Tap to copy.">
        <div className="rounded-2xl bg-[#f7f9f5] border border-[rgba(14,15,12,0.06)] p-4 flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0 font-mono text-[14px] text-[#0e0f0c] truncate tabular-nums">
            {url}
          </div>
          <CopyLinkButton value={url} />
          <a
            href={`/${creator.handle}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-[#0e0f0c] text-white text-[13px] font-semibold hover:bg-[#163300] transition-colors"
          >
            Open page
          </a>
        </div>
      </Card>

      <Card
        title="Share buttons"
        description="One-click links you can post to your audience."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <ShareLink
            label="Share on X / Twitter"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `Support my work on BanglaPay`,
            )}&url=${encodeURIComponent(url)}`}
          />
          <ShareLink
            label="Share on Facebook"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          />
          <ShareLink
            label="Share on WhatsApp"
            href={`https://wa.me/?text=${encodeURIComponent(`Support my work on BanglaPay — ${url}`)}`}
          />
          <ShareLink
            label="Share on Telegram"
            href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Support my work on BanglaPay")}`}
          />
        </div>
      </Card>

      <Card
        title="Embed your link"
        description="Drop this into your bio or signature."
      >
        <pre className="rounded-2xl bg-[#0e0f0c] text-[#e2f6d5] text-[12px] font-mono p-4 overflow-x-auto leading-[1.6]">
          {`<a href="${url}" target="_blank" rel="noreferrer">
  Buy me a cha · ${url.replace("https://", "")}
</a>`}
        </pre>
      </Card>
    </div>
  );
}

function ShareLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-between h-12 px-4 rounded-2xl bg-white border border-[rgba(14,15,12,0.08)] text-[14px] font-semibold text-[#0e0f0c] hover:border-[#0e0f0c] transition-colors"
    >
      <span>{label}</span>
      <span aria-hidden className="text-[#454745]">
        →
      </span>
    </a>
  );
}
