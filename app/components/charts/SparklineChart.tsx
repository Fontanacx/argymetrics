"use client";

import { useState } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis, CartesianGrid } from "recharts";
import { Modal } from "@/app/components/modals";
import { formatShortDate } from "@/lib/formatters/date";
import { formatPercent, formatPoints } from "@/lib/formatters/currency";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface SparklineChartProps {
  /** Historical data points. */
  data: any[];
  /** Whether the overall trend is positive. Controls line color. */
  positive: boolean;
  /** Optional title for the modal */
  label?: string;
  /** Key to extract the value from data. Defaults to 'venta'. */
  dataKey?: string;
  formatType?: "dollar" | "crypto" | "riesgo" | "inflacion" | "commodity" | "index";
  /** Optional brand color to override standard positive/negative line color */
  strokeColor?: string;
}

/**
 * Tiny line chart (no axes, no labels) for showing a 7-day price trend.
 * Client component because recharts requires browser APIs.
 */
export default function SparklineChart({ 
  data, 
  positive,
  label = "Evolución",
  dataKey = "venta",
  formatType = "dollar",
  strokeColor
}: SparklineChartProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const valueFormatter = (v: number) => {
    if (formatType === "riesgo") return `${formatPoints(v)} pts`;
    if (formatType === "inflacion") return formatPercent(v);
    if (formatType === "commodity" || formatType === "crypto") return `US$ ${v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (formatType === "index") return v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `$${v.toLocaleString("es-AR")}`; // dollar
  };

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

  const finalStrokeColor = strokeColor || (positive
    ? "var(--chart-positive)"
    : "var(--chart-negative)");

  return (
    <>
      <div 
        onClick={() => setModalOpen(true)}
        className="cursor-pointer transition-opacity hover:opacity-80 mt-2"
        title="Ver gráfico detallado"
      >
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={data}>
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={finalStrokeColor}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={label}
        size="fullscreen"
      >
        <div style={{ height: '80vh', minHeight: 400, maxHeight: 900 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="fecha"
                tickFormatter={(v) => formatShortDate(v)}
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                width={65}
                tickFormatter={valueFormatter}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                }}
                labelFormatter={(v) => formatShortDate(v as string)}
                formatter={(value: ValueType | undefined) => [valueFormatter(Number(value ?? 0)), "Valor"]}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={finalStrokeColor}
                strokeWidth={2}
                dot={{ r: 3, fill: finalStrokeColor }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Modal>
    </>
  );
}
