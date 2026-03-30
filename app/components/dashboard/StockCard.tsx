import type { StockData } from "@/lib/types";
import { formatARS } from "@/lib/formatters/currency";
import { formatRelativeTime, formatDateTime } from "@/lib/formatters/date";
import { VariationBadge } from "@/app/components/ui";
import { SparklineChart } from "@/app/components/charts";
import { InfoButton } from "@/app/components/modals";
import { IndicatorDetail } from "@/app/components/modals";
import { INDICATOR_DEFINITIONS } from "@/lib/constants/definitions";

export default function StockCard({ stock }: { stock: StockData }) {
  const { symbol, name, price, variation, high, low, history } = stock;
  const trendPositive = variation !== null ? variation >= 0 : true;

  return (
    <article
      className="flex flex-col gap-3 rounded-xl border p-4 transition-shadow h-full"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-1 min-w-0 pr-1">
            <h3 className="text-sm font-bold tracking-tight uppercase leading-tight" style={{ color: "var(--text-primary)" }}>
              {symbol.replace(".BA", "")}
            </h3>
            {history && history.length > 0 && (
              <div className="shrink-0 flex items-center ml-0.5">
                <InfoButton title={symbol}>
                  <IndicatorDetail
                    kind="stock"
                    data={history}
                    label={symbol}
                    definition={INDICATOR_DEFINITIONS[symbol.toLowerCase()] || "Precio de cierre diario de la acción en el mercado BYMA (Bolsas y Mercados Argentinos), expresado en pesos argentinos (ARS)."}
                    updateTime={stock.updatedAt}
                  />
                </InfoButton>
              </div>
            )}
          </div>
          <span className="text-xs font-medium truncate w-full" style={{ color: "var(--text-muted)" }} title={name}>
            {name}
          </span>
        </div>
        <div className="shrink-0">
          <VariationBadge value={variation} />
        </div>
      </div>

      <div className="mt-1 mb-2">
        <SparklineChart data={history} positive={trendPositive} strokeColor="var(--color-accent)" dataKey="valor" formatType="dollar" />
      </div>

      <div className="flex flex-col gap-1 mt-auto pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex justify-between items-baseline">
           <span className="text-xl font-bold tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
            {formatARS(price)}
           </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-[10px] mt-1 gap-1.5 sm:gap-2">
          <div className="flex flex-col sm:flex-row gap-x-2 gap-y-0.5 min-w-0 overflow-hidden">
            <span className="truncate" style={{ color: "var(--text-muted)" }}>Min <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{formatARS(low)}</span></span>
            <span className="truncate" style={{ color: "var(--text-muted)" }}>Max <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{formatARS(high)}</span></span>
          </div>
          <span className="shrink-0 max-sm:self-end" style={{ color: "var(--text-muted)", fontSize: "9px" }} title={`Actualizado: ${formatDateTime(stock.updatedAt)}`}>
            {formatRelativeTime(stock.updatedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}
