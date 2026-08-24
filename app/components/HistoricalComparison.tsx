"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  HistoricalComparisonPeriod,
  HistoricalComparisonPoint,
  HistoricalComparisonSeries,
  HistoricalComparisonSeriesKey,
} from "@/lib/types";
import { formatARS, formatPercent, formatPoints } from "@/lib/formatters/currency";
import { formatDateOnly } from "@/lib/formatters/date";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface HistoricalComparisonProps {
  datasets: HistoricalComparisonSeries[];
}

const PERIOD_OPTIONS: { value: Exclude<HistoricalComparisonPeriod, "custom">; label: string; days: number }[] = [
  { value: "7d", label: "7 días", days: 7 },
  { value: "30d", label: "30 días", days: 30 },
  { value: "90d", label: "90 días", days: 90 },
  { value: "1y", label: "1 año", days: 365 },
];

const SERIES_COLORS: Record<HistoricalComparisonSeriesKey, string> = {
  blue: "var(--brand-cyan)",
  mep: "var(--color-accent)",
  riesgo: "var(--color-negative)",
  inflacion: "var(--color-warning)",
};

const SERIES_DESCRIPTIONS: Record<HistoricalComparisonSeriesKey, string> = {
  blue: "Dólar Blue",
  mep: "Dólar MEP",
  riesgo: "Riesgo País",
  inflacion: "Inflación mensual",
};

const PRESET_DAYS: Record<Exclude<HistoricalComparisonPeriod, "custom">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function subtractDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return toISODate(date);
}

function getLatestDate(datasets: HistoricalComparisonSeries[]): string {
  return datasets.reduce((latest, dataset) => {
    const last = dataset.data[dataset.data.length - 1]?.fecha ?? "";
    return last > latest ? last : latest;
  }, "");
}

function getSeriesPoints(
  dataset: HistoricalComparisonSeries,
  fromDate: string,
  toDate: string
): HistoricalComparisonPoint[] {
  return dataset.data.filter((point) => point.fecha >= fromDate && point.fecha <= toDate);
}

function formatSeriesValue(value: number, unit: HistoricalComparisonSeries["unit"]): string {
  if (unit === "ars") return formatARS(value);
  if (unit === "points") return `${formatPoints(value)} pts`;
  return `${value.toLocaleString("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatSeriesDelta(value: number, unit: HistoricalComparisonSeries["unit"]): string {
  if (unit === "percent") return formatPercent(value);
  if (unit === "points") return `${value > 0 ? "+" : ""}${formatPoints(value)} pts`;
  return `${value > 0 ? "+" : ""}${formatARS(value)}`;
}

function formatChartPercent(value: ValueType | undefined): string {
  return `${Number(value ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatChartDate(dateString: string): string {
  return formatDateOnly(dateString).slice(0, 5);
}

export default function HistoricalComparison({ datasets }: HistoricalComparisonProps) {
  const latestDate = getLatestDate(datasets);
  const safeLatestDate = latestDate || toISODate(new Date());
  const defaultFrom = subtractDays(safeLatestDate, 29);
  const [period, setPeriod] = useState<HistoricalComparisonPeriod>("30d");
  const [customFrom, setCustomFrom] = useState(defaultFrom);
  const [customTo, setCustomTo] = useState(safeLatestDate);
  const [selected, setSelected] = useState<Record<HistoricalComparisonSeriesKey, boolean>>(() =>
    datasets.reduce<Record<HistoricalComparisonSeriesKey, boolean>>(
      (initial, dataset) => ({ ...initial, [dataset.key]: true }),
      { blue: false, mep: false, riesgo: false, inflacion: false }
    )
  );

  if (datasets.length === 0 || !latestDate) {
    return (
      <div className="historical-empty-state">
        No hay suficientes datos históricos para construir la comparación.
      </div>
    );
  }

  const fromDate = period === "custom"
    ? customFrom
    : subtractDays(safeLatestDate, PRESET_DAYS[period] - 1);
  const toDate = period === "custom" ? customTo : latestDate;
  const invalidCustomRange = period === "custom" && (!fromDate || !toDate || fromDate > toDate);
  const activeDatasets = datasets.filter((dataset) => selected[dataset.key]);

  const filteredSeries = activeDatasets.map((dataset) => ({
    dataset,
    points: getSeriesPoints(dataset, fromDate, toDate),
  }));

  const normalizedByDate = new Map<string, Record<string, number | string>>();
  filteredSeries.forEach(({ dataset, points }) => {
    const baseline = points[0]?.valor;
    if (baseline === undefined || baseline === 0) return;

    points.forEach((point) => {
      const normalized = ((point.valor - baseline) / baseline) * 100;
      const existing = normalizedByDate.get(point.fecha) ?? { fecha: point.fecha };
      existing[dataset.key] = Number(normalized.toFixed(4));
      existing[`${dataset.key}Raw`] = point.valor;
      normalizedByDate.set(point.fecha, existing);
    });
  });

  const chartData = Array.from(normalizedByDate.values()).sort((a, b) =>
    String(a.fecha).localeCompare(String(b.fecha))
  );

  const toggleSeries = (key: HistoricalComparisonSeriesKey) => {
    setSelected((current) => {
      const activeCount = Object.values(current).filter(Boolean).length;
      if (current[key] && activeCount === 1) return current;
      return { ...current, [key]: !current[key] };
    });
  };

  return (
    <div className="historical-comparison-card">
      <div className="historical-comparison-toolbar">
        <div>
          <p className="historical-comparison-kicker">Lectura relativa</p>
          <h3>Qué mercado tomó más impulso</h3>
          <p className="historical-comparison-helper">
            Todas las series parten de una base 100 para comparar tendencias aunque sus unidades sean distintas.
          </p>
        </div>

        <div className="historical-period-control" role="group" aria-label="Período de comparación">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={period === option.value}
              onClick={() => setPeriod(option.value)}
              className={period === option.value ? "is-active" : ""}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={period === "custom"}
            onClick={() => setPeriod("custom")}
            className={period === "custom" ? "is-active" : ""}
          >
            Personalizado
          </button>
        </div>
      </div>

      {period === "custom" && (
        <div className="historical-date-fields">
          <label>
            Desde
            <input
              type="date"
              value={customFrom}
              max={customTo || latestDate}
              onChange={(event) => setCustomFrom(event.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              value={customTo}
              min={customFrom}
              max={latestDate}
              onChange={(event) => setCustomTo(event.target.value)}
            />
          </label>
        </div>
      )}

      <div className="historical-series-toggle" role="group" aria-label="Series a comparar">
        {datasets.map((dataset) => (
          <button
            key={dataset.key}
            type="button"
            aria-pressed={selected[dataset.key]}
            onClick={() => toggleSeries(dataset.key)}
            className={selected[dataset.key] ? "is-selected" : ""}
            style={{ "--series-color": SERIES_COLORS[dataset.key] } as React.CSSProperties}
          >
            <span className="historical-series-dot" aria-hidden="true" />
            {SERIES_DESCRIPTIONS[dataset.key]}
          </button>
        ))}
      </div>

      {invalidCustomRange ? (
        <div className="historical-empty-state">Elegí un rango de fechas válido para ver la comparación.</div>
      ) : (
        <>
          <div className="historical-comparison-layout">
            <div className="historical-chart-panel">
              {chartData.length < 2 || activeDatasets.length === 0 ? (
                <div className="historical-empty-state">
                  No hay suficientes datos para este período.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={330}>
                  <LineChart data={chartData} margin={{ top: 12, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={(value) => formatChartDate(String(value))}
                      tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={34}
                    />
                    <YAxis
                      tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                      tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: "10px",
                        color: "var(--text-primary)",
                        fontSize: "12px",
                      }}
                      labelFormatter={(value) => formatDateOnly(String(value))}
                      formatter={(value: ValueType | undefined, name: string | number | undefined, item) => {
                        const key = String(name) as HistoricalComparisonSeriesKey;
                        const dataset = activeDatasets.find((activeDataset) => activeDataset.key === key);
                        const payload = item?.payload;
                        const rawValue: unknown =
                          payload !== null && typeof payload === "object"
                            ? (payload as Record<string, unknown>)[`${key}Raw`]
                            : undefined;
                        const realValue = typeof rawValue === "number" && dataset
                          ? formatSeriesValue(rawValue, dataset.unit)
                          : null;

                        return [
                          realValue
                            ? `${realValue} · ${formatChartPercent(value)}`
                            : formatChartPercent(value),
                          SERIES_DESCRIPTIONS[key] ?? String(name ?? "Valor"),
                        ];
                      }}
                    />
                    {activeDatasets.map((dataset) => (
                      <Line
                        key={dataset.key}
                        type="monotone"
                        dataKey={dataset.key}
                        name={dataset.key}
                        stroke={SERIES_COLORS[dataset.key]}
                        strokeWidth={2.2}
                        dot={false}
                        connectNulls
                        isAnimationActive={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="historical-summary-list">
              <div className="historical-summary-heading">
                <span>Último dato</span>
                <span>{period === "custom" ? `${formatDateOnly(fromDate)} — ${formatDateOnly(toDate)}` : PERIOD_OPTIONS.find((option) => option.value === period)?.label}</span>
              </div>
              {filteredSeries.map(({ dataset, points }) => {
                const first = points[0];
                const last = points[points.length - 1];
                const change = points.length >= 2 && first && last && first.valor !== 0
                  ? ((last.valor - first.valor) / first.valor) * 100
                  : null;
                const changeClass = change === null ? "is-neutral" : change >= 0 ? "is-positive" : "is-negative";

                return (
                  <div className="historical-summary-row" key={dataset.key}>
                    <div className="historical-summary-label">
                      <span className="historical-series-dot" style={{ "--series-color": SERIES_COLORS[dataset.key] } as React.CSSProperties} />
                      <span>{SERIES_DESCRIPTIONS[dataset.key]}</span>
                    </div>
                    <div className="historical-summary-values">
                      <strong>{last ? formatSeriesValue(last.valor, dataset.unit) : "Sin datos"}</strong>
                      {first && last && change !== null && (
                        <span className="historical-summary-baseline">
                          Inicio {formatSeriesValue(first.valor, dataset.unit)} · Δ {formatSeriesDelta(last.valor - first.valor, dataset.unit)}
                        </span>
                      )}
                      <span className={`historical-summary-change ${changeClass}`}>
                        {change === null ? "Sin comparación" : formatPercent(change)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <p className="historical-summary-note">
                La inflación se muestra como último dato mensual publicado; puede tener rezago respecto del resto de las series.
              </p>
            </div>
          </div>

          <p className="historical-comparison-footnote">
            Período analizado: {formatDateOnly(fromDate)} — {formatDateOnly(toDate)}. Variaciones calculadas sobre el primer y último dato disponible.
          </p>
        </>
      )}
    </div>
  );
}
