"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface SparklineChartProps {
  /** Historical data points. Each must have a numeric `venta` field. */
  data: { fecha: string; venta: number }[];
  /** Whether the overall trend is positive. Controls line color. */
  positive: boolean;
}

/**
 * Tiny line chart (no axes, no labels) for showing a 7-day price trend.
 * Client component because recharts requires browser APIs.
 */
export default function SparklineChart({ data, positive }: SparklineChartProps) {
  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs"
        style={{ height: 40, color: "var(--text-muted)" }}
      >
        Sin datos
      </div>
    );
  }

  const strokeColor = positive
    ? "var(--chart-positive)"
    : "var(--chart-negative)";

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <YAxis domain={["dataMin", "dataMax"]} hide />
        <Line
          type="monotone"
          dataKey="venta"
          stroke={strokeColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
