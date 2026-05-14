/**
 * Skeleton placeholder for the StockGrid while data loads.
 */
export default function StockGridSkeleton() {
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
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-5 w-14" />
          </div>
          <div className="skeleton h-8 w-28" />
          <div className="skeleton h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
