"use client";

import { useMemo } from "react";
import { computeDailyInsights, type NormalizedAsset } from "@/lib/utils/insights";
import SparklineChart from "./SparklineChart";

interface DailyInsightsProps {
  assets: NormalizedAsset[];
}

export default function DailyInsights({ assets }: DailyInsightsProps) {
  const insights = useMemo(() => computeDailyInsights(assets), [assets]);

  if (!insights.mostVolatile && !insights.mostStable) return null;

  const renderCard = (
    label: string, 
    data: (NormalizedAsset & { changePercent: number }) | null, 
    colorVar: string
  ) => {
    if (!data) return null;

    const isPositive = data.changePercent > 0;
    const isNegative = data.changePercent < 0;
    const arrow = isPositive ? "▲" : isNegative ? "▼" : "–";
    const changeStr = `${Math.abs(data.changePercent).toFixed(2)}%`;
    
    const diffCalc = data.current - data.previous;
    const diffSign = diffCalc > 0 ? "+" : "";
    const prefix = data.prefix || "";
    const unit = data.unit || "";

    let color = colorVar;
    if (label === "Más Volátil") {
      color = isPositive ? "var(--color-positive)" : isNegative ? "var(--color-negative)" : "var(--color-neutral)";
    }

    return (
      <div 
        className="flex flex-col justify-between rounded-lg border px-4 py-3 shadow-sm transition-shadow"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)", boxShadow: "var(--shadow-card)" }}
      >
        <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>{label}</span>
        
        <div className="mt-2 flex items-baseline justify-between">
          <span className="truncate pr-2 text-base font-bold flex-1" style={{ color: "var(--text-primary)" }}>
            {data.name}
          </span>
          <div className="flex flex-col items-end">
            <span className="tabular-nums text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {prefix}{data.current.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{unit}
            </span>
            <span className="tabular-nums text-xs font-bold" style={{ color }}>
              {arrow} {changeStr}
            </span>
          </div>
        </div>

        {/* Sparkline Chart */}
        {data.history && data.history.length >= 2 && (
          <div className="-mx-2 mt-2 border-t pt-2" style={{ borderColor: "var(--border-subtle)" }}>
            <SparklineChart 
              data={data.history} 
              positive={isPositive} 
              label={data.name} 
              dataKey={data.dataKey} 
              formatType={data.formatType as any}
            />
          </div>
        )}

        <div className="mt-2 flex justify-between text-[11px]" style={{ color: "var(--text-secondary)" }}>
            <div>
                Ayer: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{prefix}{data.previous.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{unit}</span>
            </div>
            <div className="text-right">
                Var: <span className="font-semibold" style={{ color }}>{diffSign}{diffCalc.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{unit}</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {renderCard("Más Volátil", insights.mostVolatile, "var(--color-neutral)")}
      {renderCard("Más Estable", insights.mostStable, "var(--color-neutral)")}
      {renderCard("Mayor Subida", insights.topPerformer, "var(--color-positive)")}
    </div>
  );
}
