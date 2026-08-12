/**
 * Skeleton placeholder for the MarketTicker bar while its data loads.
 * Mirrors the ticker's height and bottom border to avoid layout shift.
 */
export default function TickerSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height: "33px",
        background: "var(--ticker-bg)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div className="skeleton" style={{ height: "100%", width: "100%", borderRadius: 0 }} />
    </div>
  );
}
