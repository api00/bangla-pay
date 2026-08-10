import type { DailyActivity } from "@/db/queries/activity";
import { formatTaka } from "@/lib/money";

interface SparklineProps {
  data: DailyActivity[];
  ariaLabel?: string;
}

const WIDTH = 320;
const HEIGHT = 64;
const PAD = 4;

export default function Sparkline({
  data,
  ariaLabel = "Daily earnings from tips and shop sales over the last 30 days",
}: SparklineProps) {
  if (data.length === 0) {
    return (
      <div className="h-[64px] rounded-2xl bg-mint-surface flex items-center justify-center text-[12px] text-gray">
        No activity yet
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.totalPaisa), 1);
  const points = data.map((d, i) => {
    const x = PAD + (i * (WIDTH - 2 * PAD)) / Math.max(data.length - 1, 1);
    const y = HEIGHT - PAD - (d.totalPaisa / max) * (HEIGHT - 2 * PAD);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePath = `M ${points.join(" L ")}`;
  const areaPath =
    `M ${PAD},${HEIGHT - PAD} ` +
    `L ${points.join(" L ")} ` +
    `L ${WIDTH - PAD},${HEIGHT - PAD} Z`;

  const peak = data.reduce((acc, d) => (d.totalPaisa > acc.totalPaisa ? d : acc), data[0]);

  return (
    <div className="space-y-2">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full h-[64px] block"
      >
        <defs>
          <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9fe870" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9fe870" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkFill)" />
        <path
          d={linePath}
          stroke="#163300"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div className="flex items-center justify-between text-[11px] text-gray tabular-nums">
        <span>Last 30 days</span>
        {peak && peak.totalPaisa > 0 && (
          <span>
            Peak day: <span className="font-semibold text-near-black">{formatTaka(peak.totalPaisa)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
