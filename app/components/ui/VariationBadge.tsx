import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatPercent } from "@/lib/formatters/currency";

interface VariationBadgeProps {
  value: number | null;
  /** Optional brand color to override positive/negative colors */
  brandColor?: string;
  /** Inverts semantic colors: negative = positive (green), positive = negative (red) */
  inverseSemantic?: boolean;
}

/**
 * Displays a colored badge with a trend icon showing daily price variation.
 * Green + up arrow for positive, red + down arrow for negative, gray dash for zero/null.
 */
export default function VariationBadge({ value, brandColor, inverseSemantic = false }: VariationBadgeProps) {
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

  const positiveColor = inverseSemantic
    ? "var(--color-negative)"
    : "var(--color-positive)";

  const positiveBg = inverseSemantic
    ? "var(--color-negative-bg)"
    : "var(--color-positive-bg)";

  const negativeColor = inverseSemantic
    ? "var(--color-positive)"
    : "var(--color-negative)";

  const negativeBg = inverseSemantic
    ? "var(--color-positive-bg)"
    : "var(--color-negative-bg)";

  const bgColor = brandColor
    ? `${brandColor}26`
    : isNeutral
      ? "var(--color-neutral-bg)"
      : isPositive
        ? positiveBg
        : negativeBg;

  const textColor = brandColor
    ? brandColor
    : isNeutral
      ? "var(--color-neutral)"
      : isPositive
        ? positiveColor
        : negativeColor;

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
