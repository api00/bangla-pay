type Activity = {
  type: "tip" | "shop" | "message";
  name: string;
  detail: string;
  amount: string;
  time: string;
  bangla?: boolean;
  initial: string;
  bg: string;
  fg: string;
};

const items: Activity[] = [
  {
    type: "tip",
    name: "Raisa Haque",
    detail: "Sent 1 cha — “Keep making comics!”",
    amount: "+৳100",
    time: "2m",
    bangla: true,
    initial: "রা",
    bg: "from-[#cdffad] to-[#e2f6d5]",
    fg: "#163300",
  },
  {
    type: "shop",
    name: "Nahiyan R.",
    detail: "Bought Monsoon Stories, Vol. 2",
    amount: "+৳250",
    time: "8m",
    initial: "N",
    bg: "from-[#163300] to-[#054d28]",
    fg: "#9fe870",
  },
  {
    type: "tip",
    name: "Anonymous",
    detail: "Sent 5 cha",
    amount: "+৳500",
    time: "1h",
    initial: "?",
    bg: "from-[#f7f9f5] to-[#e8ebe6]",
    fg: "#454745",
  },
  {
    type: "message",
    name: "Priya Das",
    detail: "New message about your zine",
    amount: "",
    time: "3h",
    bangla: true,
    initial: "প",
    bg: "from-[#9fe870] to-[#cdffad]",
    fg: "#163300",
  },
  {
    type: "tip",
    name: "Rakib Islam",
    detail: "Sent 2 cha",
    amount: "+৳200",
    time: "5h",
    initial: "R",
    bg: "from-[#054d28] to-[#163300]",
    fg: "#9fe870",
  },
];

export default function RecentActivity() {
  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[17px] font-bold tracking-tight text-[#0e0f0c]">
          Recent activity
        </h2>
        <a
          href="#"
          className="text-[13px] font-semibold text-[#454745] hover:text-[#0e0f0c]"
        >
          View all →
        </a>
      </div>

      <ul className="divide-y divide-[rgba(14,15,12,0.05)]">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${it.bg} flex items-center justify-center shrink-0`}
            >
              <span
                className={`${
                  it.bangla ? "bangla-display" : "font-bold"
                } text-[13px]`}
                style={{ color: it.fg }}
                aria-hidden
              >
                {it.initial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-[#0e0f0c] truncate">
                {it.name}
              </div>
              <div className="text-[12px] text-[#868685] truncate">
                {it.detail}
              </div>
            </div>
            <div className="text-right shrink-0">
              {it.amount && (
                <div className="text-[14px] font-bold tabular-nums text-[#163300]">
                  {it.amount}
                </div>
              )}
              <div className="text-[11px] text-[#868685] tabular-nums mt-0.5">
                {it.time}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
