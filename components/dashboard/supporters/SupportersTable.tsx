import type { SupporterSummary } from "@/db/queries/dashboard-supporters";
import { formatTaka } from "@/lib/money";
import { formatBdtDate } from "@/lib/dates";

interface SupportersTableProps {
  supporters: SupporterSummary[];
}

function initialOf(name: string | null, email: string | null): string {
  const source = (name?.trim() || email?.trim() || "").trim();
  return source[0]?.toUpperCase() ?? "?";
}

function displayName(name: string | null, email: string | null): string {
  if (name?.trim()) return name.trim();
  if (email) return email;
  return "Anonymous";
}

export default function SupportersTable({ supporters }: SupportersTableProps) {
  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] overflow-hidden shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] px-6 py-3 border-b border-[rgba(14,15,12,0.06)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#868685]">
        <div>Supporter</div>
        <div className="text-right tabular-nums">Tips</div>
        <div className="text-right tabular-nums">Total</div>
        <div className="text-right">Last tip</div>
      </div>
      <ul className="divide-y divide-[rgba(14,15,12,0.05)]">
        {supporters.map((s, idx) => (
          <li
            key={`${s.email ?? "anon"}-${idx}`}
            className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_1fr] items-center gap-3 px-6 py-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#cdffad] to-[#e2f6d5] flex items-center justify-center shrink-0">
                <span className="text-[13px] font-semibold text-[#163300]">
                  {initialOf(s.displayName, s.email)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-[#0e0f0c] truncate">
                  {displayName(s.displayName, s.email)}
                </div>
                {s.email && s.displayName && (
                  <div className="text-[12px] text-[#868685] truncate">
                    {s.email}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right tabular-nums text-[13px] text-[#454745] hidden md:block">
              {s.tipCount}
            </div>
            <div className="text-right tabular-nums text-[14px] font-semibold text-[#163300]">
              {formatTaka(s.totalPaisa)}
            </div>
            <div className="text-right tabular-nums text-[12px] text-[#868685] hidden md:block">
              {formatBdtDate(s.lastTipAt)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
