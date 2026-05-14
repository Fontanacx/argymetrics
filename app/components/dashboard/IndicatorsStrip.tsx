import { AlertTriangle, Percent, Clock, Coins, Droplet, TrendingUp, TrendingDown, Flame } from "lucide-react";
import type { RiesgoPais, InflacionMensual, RiesgoPaisHistoryEntry, CommodityQuote } from "@/lib/types";
import { formatPoints, formatPercent, formatUSD } from "@/lib/formatters/currency";
import { formatDateOnly, formatMonthYear } from "@/lib/formatters/date";
import { INDICATOR_DEFINITIONS } from "@/lib/constants/definitions";
import IndicatorCard from "./IndicatorCard";

interface IndicatorsStripProps {
  riesgoPais: RiesgoPais | null;
  inflacion: InflacionMensual | null;
  riesgoHistory?: RiesgoPaisHistoryEntry[];
  inflacionHistory?: InflacionMensual[];
  commodities?: CommodityQuote[];
  goldHistory?: { fecha: string; valor: number }[];
  brentHistory?: { fecha: string; valor: number }[];
  gasHistory?: { fecha: string; valor: number }[];
}

/**
 * Horizontal strip showing key economic indicators.
 * Uses IndicatorCard for each item to avoid code duplication.
 * Includes Riesgo Pais, Inflacion, Oro, Petroleo Brent, and Gas Natural.
 */
export default function IndicatorsStrip({
  riesgoPais,
  inflacion,
  riesgoHistory,
  inflacionHistory,
  commodities = [],
  goldHistory,
  brentHistory,
  gasHistory,
}: IndicatorsStripProps) {
  const gold = commodities.find((c) => c.name === "ORO");
  const brent = commodities.find((c) => c.name === "PETROLEO BRENT");
  const gas = commodities.find((c) => c.name === "GAS NATURAL");

  const isRiesgoTrendPositive =
    riesgoHistory && riesgoHistory.length >= 2
      ? riesgoHistory[riesgoHistory.length - 1].valor <= riesgoHistory[riesgoHistory.length - 2].valor
      : true;

  const isInflacionTrendPositive =
    inflacionHistory && inflacionHistory.length >= 2
      ? inflacionHistory[inflacionHistory.length - 1].valor <= inflacionHistory[inflacionHistory.length - 2].valor
      : true;

  const isGoldTrendPositive = gold ? gold.changePercent >= 0 : true;
  const isBrentTrendPositive = brent ? brent.changePercent >= 0 : true;
  const isGasTrendPositive = gas ? gas.changePercent >= 0 : true;

  /** Renders a percentage change badge with trend icon */
  function CommodityChangeBadge({ changePercent }: { changePercent: number }) {
    return (
      <div className="flex items-center gap-1 text-xs">
        {changePercent > 0 ? (
          <TrendingUp size={12} style={{ color: "var(--color-positive)" }} />
        ) : changePercent < 0 ? (
          <TrendingDown size={12} style={{ color: "var(--color-negative)" }} />
        ) : null}
        <span
          style={{
            color:
              changePercent > 0
                ? "var(--color-positive)"
                : changePercent < 0
                  ? "var(--color-negative)"
                  : "var(--text-muted)",
            fontWeight: 500,
          }}
        >
          {changePercent > 0 ? "+" : ""}
          {changePercent.toFixed(2)}%
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Riesgo Pais */}
      <IndicatorCard
        icon={<AlertTriangle size={20} />}
        iconBg="var(--color-negative-bg)"
        iconColor="var(--color-negative)"
        label="Riesgo Pais"
        value={riesgoPais ? `${formatPoints(riesgoPais.valor)} pts` : ""}
        dateLabel={riesgoPais ? `Datos al ${formatDateOnly(riesgoPais.fecha)}` : undefined}
        infoModal={
          riesgoHistory && riesgoHistory.length > 0
            ? {
                title: "Riesgo Pais",
                kind: "riesgo",
                data: riesgoHistory,
                definition: INDICATOR_DEFINITIONS.riesgoPais,
                updateTime: riesgoPais?.fecha,
              }
            : undefined
        }
        sparkline={
          riesgoHistory && riesgoHistory.length > 0
            ? {
                data: riesgoHistory,
                positive: isRiesgoTrendPositive,
                label: "Riesgo Pais",
                formatType: "riesgo",
                dataKey: "valor",
              }
            : undefined
        }
      />

      {/* Inflacion */}
      <IndicatorCard
        icon={<Percent size={20} />}
        iconBg="var(--color-accent-light)"
        iconColor="var(--color-accent)"
        label="Inflacion Mensual (IPC)"
        value={inflacion ? formatPercent(inflacion.valor) : ""}
        dateLabel={inflacion ? formatMonthYear(inflacion.fecha) : undefined}
        infoModal={{
          title: "Inflacion Mensual",
          kind: "inflacion",
          data: inflacionHistory ?? [],
          definition: INDICATOR_DEFINITIONS.inflacion,
          updateTime: inflacion?.fecha,
        }}
        sparkline={
          inflacionHistory && inflacionHistory.length > 0
            ? {
                data: inflacionHistory,
                positive: isInflacionTrendPositive,
                label: "Inflacion Mensual (IPC)",
                formatType: "inflacion",
                dataKey: "valor",
              }
            : undefined
        }
      />

      {/* Oro */}
      <IndicatorCard
        icon={<Coins size={20} />}
        iconBg="rgba(234, 179, 8, 0.1)"
        iconColor="rgb(234, 179, 8)"
        label="Oro"
        value={gold ? formatUSD(gold.price) : ""}
        dateLabel={gold ? undefined : undefined}
        infoModal={
          goldHistory && goldHistory.length > 0
            ? {
                title: "Oro (Gold Futures)",
                kind: "commodity",
                data: goldHistory,
                definition: INDICATOR_DEFINITIONS.oro,
                updateTime: gold?.fecha,
              }
            : undefined
        }
        sparkline={
          goldHistory && goldHistory.length > 0
            ? {
                data: goldHistory,
                positive: isGoldTrendPositive,
                label: "Oro",
                formatType: "commodity",
                dataKey: "valor",
              }
            : undefined
        }
      >
        {gold && <CommodityChangeBadge changePercent={gold.changePercent} />}
      </IndicatorCard>

      {/* Petróleo Brent */}
      <IndicatorCard
        icon={<Droplet size={20} />}
        iconBg="rgba(148, 163, 184, 0.1)"
        iconColor="var(--text-primary)"
        label="Petróleo Brent"
        value={brent ? formatUSD(brent.price) : ""}
        infoModal={
          brentHistory && brentHistory.length > 0
            ? {
                title: "Petróleo Brent",
                kind: "commodity",
                data: brentHistory,
                definition: INDICATOR_DEFINITIONS.petroleo,
                updateTime: brent?.fecha,
              }
            : undefined
        }
        sparkline={
          brentHistory && brentHistory.length > 0
            ? {
                data: brentHistory,
                positive: isBrentTrendPositive,
                label: "Petróleo Brent",
                formatType: "commodity",
                dataKey: "valor",
              }
            : undefined
        }
      >
        {brent && <CommodityChangeBadge changePercent={brent.changePercent} />}
      </IndicatorCard>

      {/* Gas Natural */}
      <IndicatorCard
        icon={<Flame size={20} />}
        iconBg="rgba(249, 115, 22, 0.1)"
        iconColor="rgb(249, 115, 22)"
        label="Gas Natural"
        value={gas ? formatUSD(gas.price) : ""}
        infoModal={
          gasHistory && gasHistory.length > 0
            ? {
                title: "Gas Natural",
                kind: "commodity",
                data: gasHistory,
                definition: INDICATOR_DEFINITIONS.gas,
                updateTime: gas?.fecha,
              }
            : undefined
        }
        sparkline={
          gasHistory && gasHistory.length > 0
            ? {
                data: gasHistory,
                positive: isGasTrendPositive,
                label: "Gas Natural",
                formatType: "commodity",
                dataKey: "valor",
              }
            : undefined
        }
      >
        {gas && <CommodityChangeBadge changePercent={gas.changePercent} />}
      </IndicatorCard>
    </div>
  );
}
