export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      className="space-y-6 animate-pulse"
    >
      <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 h-[120px]" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 h-[280px]" />
        <div className="rounded-[28px] bg-white border border-[rgba(14,15,12,0.06)] p-6 md:p-7 h-[280px]" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-[rgba(14,15,12,0.06)] p-5 h-[110px]"
          />
        ))}
      </div>
    </div>
  );
}
