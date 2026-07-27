export default function RootLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="min-h-screen bg-off-white flex items-center justify-center"
    >
      <div className="flex items-center gap-1.5">
        <span className="display text-2xl tracking-tight text-near-black">
          banglapay
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-wise-green animate-pulse"
          aria-hidden
        />
      </div>
    </div>
  );
}
