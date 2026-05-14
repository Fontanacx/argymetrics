/**
 * Skeleton placeholder for the IndicatorsStrip while data loads.
 * Mirrors the horizontal card layout with shimmer animation placeholders.
 */
export default function IndicatorsStripSkeleton() {
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
          {/* Icon skeleton */}
          <div className="skeleton h-10 w-10 shrink-0 rounded-lg" />

          {/* Content skeleton */}
          <div className="flex flex-1 flex-col gap-2">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-6 w-20" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
