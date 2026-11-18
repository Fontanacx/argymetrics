import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { formatARS } from "@/lib/formatters/currency";
import { getYAxisLabel } from "./helpers";
import type { ChartPoint, IndicatorKind, MacroFormat } from "./types";

interface IndicatorChartProps {
  kind: IndicatorKind;
  label: string;
  macroFormat?: MacroFormat;
  chartData: ChartPoint[];
  strokeColor: string;
  formatLabel: (v: string) => string;
  formatValue: (v: number) => string;
  previousClose: number | null;
}

/** Area chart (or bands chart for FX bands) with tooltip and previous-close line. */
export function IndicatorChart({
  kind,
  label,
  macroFormat,
  chartData,
  strokeColor,
  formatLabel,
  formatValue,
  previousClose,
}: IndicatorChartProps) {
  if (chartData.length < 2) {
    return (
      <div
        className="flex h-48 items-center justify-center text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        Sin datos suficientes para este rango.
      </div>
    );
  }

  return (
    <div className="flex-1 w-full mt-2 relative min-h-[220px]">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="modal-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="fecha"
              tickFormatter={formatLabel}
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
              width={55}
              tickFormatter={(v: number) => getYAxisLabel(kind, v, macroFormat)}
            />
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--text-primary)",
              }}
              labelFormatter={(v) => formatLabel(v as string)}
              formatter={(value: ValueType | undefined, name: string | number | undefined) => {
                if (kind === "bandas") {
                  if (name === "range") return []; // Hide range area from tooltip
                  const labelName = name === "techo" ? "Techo" : name === "piso" ? "Piso" : "Oficial";
                  return [formatARS(Number(value ?? 0)), labelName];
                }
                return [formatValue(Number(value ?? 0)), label];
              }}
            />
            {kind === "bandas" ? (
              <>
                <Area dataKey="range" stroke="none" fill="var(--color-accent)" fillOpacity={0.15} isAnimationActive={false} />
                <Line type="monotone" dataKey="techo" stroke="var(--color-accent)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="piso" stroke="var(--color-accent)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="oficial" stroke="var(--text-primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </>
            ) : (
              <>
                <Area
                  type={kind === "inflacion" ? "stepAfter" : "monotone"}
                  dataKey="value"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fill="url(#modal-gradient)"
                  dot={false}
                  isAnimationActive={false}
                />
                {(kind === "dollar" || kind === "stock" || kind === "index") && previousClose !== null && (
                  <ReferenceLine
                    y={previousClose}
                    stroke="var(--text-muted)"
                    strokeDasharray="6 4"
                    strokeWidth={1}
                    label={{
                      value: "Cierre ant.",
                      position: "right",
                      fill: "var(--text-muted)",
                      fontSize: 10,
                    }}
                  />
                )}
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
