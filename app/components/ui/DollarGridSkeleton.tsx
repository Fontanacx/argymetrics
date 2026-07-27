/**
 * Skeleton placeholder for the DollarGrid while data loads.
 * Mirrors the card layout with shimmer animation placeholders.
 */
export default function DollarGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-xl border p-4"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-primary)",
          }}
        >
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-5 w-14" />
          </div>

          {/* Price skeleton */}
          <div className="skeleton h-8 w-36" />

          {/* Buy / Sell / Spread row skeleton */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex flex-col gap-1">
                <div className="skeleton h-3 w-12" />
                <div className="skeleton h-4 w-16" />
              </div>
            ))}
          </div>

          {/* Sparkline skeleton */}
          <div className="skeleton mt-1 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
