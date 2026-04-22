import { CheckIcon } from "./icons";

type Step = {
  title: string;
  body: string;
  done: boolean;
  cta: string;
};

const steps: Step[] = [
  {
    title: "Claim your handle",
    body: "Your page is live at banglapay.com/tahsina.",
    done: true,
    cta: "Done",
  },
  {
    title: "Add a cover image",
    body: "Pages with a cover get 3x more tips. Upload one now.",
    done: false,
    cta: "Upload",
  },
  {
    title: "Connect a payout method",
    body: "Link bKash, Nagad, or a Bangladeshi bank to receive your earnings.",
    done: false,
    cta: "Connect",
  },
  {
    title: "Share your page",
    body: "Post your link on Instagram, X, or send it to your group chat.",
    done: false,
    cta: "Share",
  },
];

export default function GettingStarted() {
  const doneCount = steps.filter((s) => s.done).length;
  const pct = (doneCount / steps.length) * 100;

  return (
    <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 shadow-[0_1px_0_0_rgba(14,15,12,0.03)]">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[17px] font-bold tracking-tight text-[#0e0f0c]">
            Get set up
          </h2>
          <p className="text-[13px] text-[#868685] mt-0.5 tabular-nums">
            {doneCount} of {steps.length} complete
          </p>
        </div>
        <div className="w-28 md:w-36 h-1.5 rounded-full bg-[#e8ebe6] overflow-hidden">
          <div
            className="h-full bg-[#9fe870]"
            style={{ width: `${pct}%` }}
            aria-hidden
          />
        </div>
      </div>

      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={`flex items-start gap-4 rounded-2xl border p-4 ${
              s.done
                ? "border-[rgba(14,15,12,0.04)] bg-[#f7f9f5]"
                : "border-[rgba(14,15,12,0.06)] bg-white"
            }`}
          >
            <div
              className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center ${
                s.done
                  ? "bg-[#9fe870] text-[#163300]"
                  : "bg-white border-[1.5px] border-[rgba(14,15,12,0.12)] text-[#868685]"
              }`}
            >
              {s.done ? (
                <CheckIcon width={14} height={14} />
              ) : (
                <span className="text-[12px] font-bold tabular-nums">
                  {i + 1}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div
                className={`text-[14px] font-semibold ${
                  s.done ? "text-[#454745] line-through" : "text-[#0e0f0c]"
                }`}
              >
                {s.title}
              </div>
              <div className="text-[13px] text-[#868685] mt-0.5">{s.body}</div>
            </div>

            <button
              type="button"
              disabled={s.done}
              className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors ${
                s.done
                  ? "bg-transparent text-[#868685] cursor-default"
                  : "bg-[#9fe870] text-[#163300] hover:bg-[#cdffad]"
              }`}
            >
              {s.cta}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
