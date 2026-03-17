import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatPercent } from "@/lib/formatters/currency";

interface VariationBadgeProps {
  /** Percentage variation (e.g. 2.5 means +2.5%). Null renders a neutral dash. */
  value: number | null;
}

/**
 * Displays a colored badge with a trend icon showing daily price variation.
 * Green + up arrow for positive, red + down arrow for negative, gray dash for zero/null.
 */
export default function VariationBadge({ value }: VariationBadgeProps) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
        style={{ background: "var(--color-neutral-bg)", color: "var(--color-neutral)" }}>
        <Minus size={12} />
        <span>--</span>
      </span>
    );
  }

  const isPositive = value > 0;
  const isNeutral = value === 0;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  const bgColor = isNeutral
    ? "var(--color-neutral-bg)"
    : isPositive
      ? "var(--color-positive-bg)"
      : "var(--color-negative-bg)";

  const textColor = isNeutral
    ? "var(--color-neutral)"
    : isPositive
      ? "var(--color-positive)"
      : "var(--color-negative)";

  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ background: bgColor, color: textColor }}
    >
      <Icon size={12} />
      <span>{formatPercent(value)}</span>
    </span>
  );
}
