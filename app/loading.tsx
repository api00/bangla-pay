export default function RootLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="min-h-screen bg-[#f7f9f5] flex items-center justify-center"
    >
      <div className="flex items-center gap-1.5">
        <span className="display text-2xl tracking-tight text-[#0e0f0c]">
          banglapay
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#9fe870] animate-pulse"
          aria-hidden
        />
      </div>
    </div>
  );
}
