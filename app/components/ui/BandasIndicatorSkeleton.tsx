/**
 * Skeleton placeholder for BandasIndicator while data loads.
 */
export default function BandasIndicatorSkeleton() {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-primary)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-4 w-32" />
      </div>

      {/* Floor / Ceiling values */}
      <div className="mb-3 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <div className="skeleton h-3 w-10" />
          <div className="skeleton h-6 w-24" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="skeleton h-3 w-10" />
          <div className="skeleton h-6 w-24" />
        </div>
      </div>

      {/* Bar */}
      <div className="skeleton h-2 w-full rounded-full" />

      {/* Label */}
      <div className="mt-2 flex justify-center">
        <div className="skeleton h-3 w-36" />
      </div>
    </div>
  );
}
