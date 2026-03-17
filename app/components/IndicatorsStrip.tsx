import { AlertTriangle, Percent, Clock, Coins, Droplet, TrendingUp, TrendingDown } from "lucide-react";
import type { RiesgoPais, InflacionMensual, RiesgoPaisHistoryEntry, CryptoRate, CryptoHistoryEntry } from "@/lib/types";
import { formatPoints, formatPercent } from "@/lib/formatters/currency";
import { formatDateOnly, formatMonthYear } from "@/lib/formatters/date";
import { INDICATOR_DEFINITIONS } from "@/lib/constants/definitions";
import type { CommodityQuote } from "@/lib/api/commodities";
import InfoButton from "./InfoButton";
import IndicatorDetail from "./IndicatorDetail";
import SparklineChart from "./SparklineChart";

interface IndicatorsStripProps {
  riesgoPais: RiesgoPais | null;
  inflacion: InflacionMensual | null;
  riesgoHistory?: RiesgoPaisHistoryEntry[];
  inflacionHistory?: InflacionMensual[];
  commodities?: CommodityQuote[];
  goldHistory?: { fecha: string; valor: number }[];
  brentHistory?: { fecha: string; valor: number }[];
}

/**
 * Horizontal strip showing key economic indicators.
 * Now includes Riesgo Pais, Inflacion, Oro, and Petroleo.
 */
export default function IndicatorsStrip({
  riesgoPais,
  inflacion,
  riesgoHistory,
  inflacionHistory,
  commodities = [],
  goldHistory,
  brentHistory,
}: IndicatorsStripProps) {
  const gold = commodities.find((c) => c.name === "ORO");
  const brent = commodities.find((c) => c.name === "PETROLEO BRENT");

  const isRiesgoTrendPositive = riesgoHistory && riesgoHistory.length >= 2
    ? riesgoHistory[riesgoHistory.length - 1].valor <= riesgoHistory[riesgoHistory.length - 2].valor
    : true;
  
  const isInflacionTrendPositive = inflacionHistory && inflacionHistory.length >= 2
    ? inflacionHistory[inflacionHistory.length - 1].valor <= inflacionHistory[inflacionHistory.length - 2].valor
    : true;

  const isGoldTrendPositive = gold ? gold.changePercent >= 0 : true;
  const isBrentTrendPositive = brent ? brent.changePercent >= 0 : true;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Riesgo Pais */}
      <div
        className="flex items-center gap-4 rounded-xl border p-4"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-primary)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--color-negative-bg)", color: "var(--color-negative)" }}
        >
          <AlertTriangle size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Riesgo Pais
            </p>
            {riesgoHistory && riesgoHistory.length > 0 && (
              <InfoButton title="Riesgo Pais">
                <IndicatorDetail
                  kind="riesgo"
                  data={riesgoHistory}
                  label="Riesgo Pais"
                  definition={INDICATOR_DEFINITIONS.riesgoPais}
                  updateTime={riesgoPais?.fecha}
                />
              </InfoButton>
            )}
          </div>
          {riesgoPais ? (
            <>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {formatPoints(riesgoPais.valor)} pts
              </p>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Clock size={10} />
                <span>Datos al {formatDateOnly(riesgoPais.fecha)}</span>
              </div>
              {riesgoHistory && riesgoHistory.length > 0 && (
                <SparklineChart 
                  data={riesgoHistory.slice(-7)} 
                  dataKey="valor" 
                  positive={isRiesgoTrendPositive} 
                  label="Riesgo Pais"
                  formatType="riesgo"
                />
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sin datos disponibles
            </p>
          )}
        </div>
      </div>

      {/* Inflacion */}
      <div
        className="flex items-center gap-4 rounded-xl border p-4"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-primary)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--color-accent-light)", color: "var(--color-accent)" }}
        >
          <Percent size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Inflacion Mensual (IPC)
            </p>
            {inflacionHistory && inflacionHistory.length > 0 ? (
              <InfoButton title="Inflacion Mensual">
                <IndicatorDetail
                  kind="inflacion"
                  data={inflacionHistory}
                  label="Inflacion Mensual"
                  definition={INDICATOR_DEFINITIONS.inflacion}
                  updateTime={inflacion?.fecha}
                />
              </InfoButton>
            ) : (
              <InfoButton title="Inflacion Mensual">
                <IndicatorDetail
                  kind="inflacion"
                  data={[]}
                  label="Inflacion Mensual"
                  definition={INDICATOR_DEFINITIONS.inflacion}
                  updateTime={inflacion?.fecha}
                />
              </InfoButton>
            )}
          </div>
          {inflacion ? (
            <>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {formatPercent(inflacion.valor)}
              </p>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Clock size={10} />
                <span>{formatMonthYear(inflacion.fecha)}</span>
              </div>
              {inflacionHistory && inflacionHistory.length > 0 && (
                <SparklineChart 
                  data={inflacionHistory.slice(-12)} 
                  dataKey="valor" 
                  positive={isInflacionTrendPositive} 
                  label="Inflacion Mensual (IPC)"
                  formatType="inflacion"
                />
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sin datos disponibles
            </p>
          )}
        </div>
      </div>

      {/* Oro */}
      <div
        className="flex items-center gap-4 rounded-xl border p-4"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-primary)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "rgba(234, 179, 8, 0.1)", color: "rgb(234, 179, 8)" }}
        >
          <Coins size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>
              Oro
            </p>
            {goldHistory && goldHistory.length > 0 && (
              <InfoButton title="Oro (Gold Futures)">
                <IndicatorDetail
                  kind="commodity"
                  data={goldHistory}
                  label="Oro"
                  definition={INDICATOR_DEFINITIONS.oro}
                  updateTime={gold?.fecha}
                />
              </InfoButton>
            )}
          </div>
          {gold ? (
            <>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                US$ {gold.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-xs">
                {gold.changePercent > 0 ? (
                  <TrendingUp size={12} style={{ color: "var(--color-positive)" }} />
                ) : gold.changePercent < 0 ? (
                  <TrendingDown size={12} style={{ color: "var(--color-negative)" }} />
                ) : null}
                <span
                  style={{
                    color:
                      gold.changePercent > 0
                        ? "var(--color-positive)"
                        : gold.changePercent < 0
                          ? "var(--color-negative)"
                          : "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {gold.changePercent > 0 ? "+" : ""}
                  {gold.changePercent.toFixed(2)}%
                </span>
              </div>
              {goldHistory && goldHistory.length > 0 && (
                <SparklineChart 
                  data={goldHistory.slice(-7)} 
                  dataKey="valor" 
                  positive={isGoldTrendPositive} 
                  label="Oro"
                  formatType="commodity"
                />
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sin datos disponibles
            </p>
          )}
        </div>
      </div>

      {/* Petróleo */}
      <div
        className="flex items-center gap-4 rounded-xl border p-4"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-primary)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "rgba(148, 163, 184, 0.1)", color: "var(--text-primary)" }}
        >
          <Droplet size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>
              Petróleo Brent
            </p>
            {brentHistory && brentHistory.length > 0 && (
              <InfoButton title="Petróleo Brent">
                <IndicatorDetail
                  kind="commodity"
                  data={brentHistory}
                  label="Petróleo Brent"
                  definition={INDICATOR_DEFINITIONS.petroleo}
                  updateTime={brent?.fecha}
                />
              </InfoButton>
            )}
          </div>
          {brent ? (
            <>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                US$ {brent.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-xs">
                {brent.changePercent > 0 ? (
                  <TrendingUp size={12} style={{ color: "var(--color-positive)" }} />
                ) : brent.changePercent < 0 ? (
                  <TrendingDown size={12} style={{ color: "var(--color-negative)" }} />
                ) : null}
                <span
                  style={{
                    color:
                      brent.changePercent > 0
                        ? "var(--color-positive)"
                        : brent.changePercent < 0
                          ? "var(--color-negative)"
                          : "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {brent.changePercent > 0 ? "+" : ""}
                  {brent.changePercent.toFixed(2)}%
                </span>
              </div>
              {brentHistory && brentHistory.length > 0 && (
                <SparklineChart 
                  data={brentHistory.slice(-7)} 
                  dataKey="valor" 
                  positive={isBrentTrendPositive} 
                  label="Petróleo Brent"
                  formatType="commodity"
                />
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sin datos disponibles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
