/**
 * Skeleton placeholder for the CryptoStrip (BTC/ETH cards) while data loads.
 */
export default function CryptoStripSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border p-4"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-primary)",
          }}
        >
          <div className="skeleton h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-7 w-32" />
            <div className="skeleton h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
