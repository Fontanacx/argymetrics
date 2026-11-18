"use client";

import { useState } from "react";
import { computeMetrics } from "@/lib/formatters/metrics";
import { formatARS } from "@/lib/formatters/currency";
import { formatShortDate, formatMonthYear } from "@/lib/formatters/date";
import {
  buildChartData,
  getMarketStatus,
  getPreviousClose,
  getStrokeColor,
  getValueFormatter,
} from "./indicator-detail/helpers";
import { getDefaultRange, getRanges } from "./indicator-detail/ranges";
import { IndicatorChart } from "./indicator-detail/IndicatorChart";
import { BandasMetricCards, MetricCards } from "./indicator-detail/MetricCards";
import { RangeSelector } from "./indicator-detail/RangeSelector";
import { SpreadIndicator } from "./indicator-detail/SpreadIndicator";
import {
  CurrentValueTile,
  PreviousCloseTile,
  UpdateTime,
} from "./indicator-detail/SummaryTiles";
import type { IndicatorDetailProps } from "./indicator-detail/types";

/**
 * Modal content for indicator detail: definition, spread, chart, and metrics.
 */
export default function IndicatorDetail(props: IndicatorDetailProps) {
  const ranges = getRanges(props.kind);
  const [rangeValue, setRangeValue] = useState(getDefaultRange(props.kind, ranges));

  const activeRange = ranges.find((r) => r.value === rangeValue) ?? ranges[0];

  // Build normalized chart data
  const chartData = buildChartData(props, activeRange.days);
  const values = props.kind !== "bandas" ? chartData.map((d) => d.value as number) : [];
  const metrics = props.kind !== "bandas" ? computeMetrics(values) : null;

  const macroFormat = props.kind === "macro" ? props.format : undefined;
  const formatValue = getValueFormatter(props.kind, macroFormat);
  const marketStatus = getMarketStatus(props.kind);

  const previousClose = getPreviousClose(props, marketStatus.text === "Operando");
  const showsPreviousClose =
    (props.kind === "dollar" || props.kind === "stock" || props.kind === "index") &&
    previousClose !== null;

  // X-axis formatter: date-based for all ranges (data is daily, not intraday)
  const formatLabel =
    props.kind === "inflacion" || props.kind === "macro"
      ? (v: string) => formatMonthYear(v)
      : (v: string) => formatShortDate(v);

  // Color logic
  const isPositive = metrics ? metrics.changePercent >= 0 : true;
  const strokeColor = props.kind === "bandas" ? "var(--color-accent)" : getStrokeColor(props.kind, isPositive);

  const currentValueText =
    props.kind === "dollar" && props.currentRate
      ? formatARS(props.currentRate.venta)
      : props.kind === "bandas" && props.cotizacionActual
        ? formatARS(props.cotizacionActual)
        : formatValue(values[values.length - 1] ?? 0);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Definition */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {props.definition}
      </p>

      {/* Current Value, Spread & Market Status */}
      <CurrentValueTile
        kind={props.kind}
        valueText={currentValueText}
        spread={
          props.kind === "dollar" && props.currentRate
            ? props.currentRate.venta - props.currentRate.compra
            : undefined
        }
        marketStatus={marketStatus}
      />

      {/* Spread indicator (dollar only) */}
      {props.kind === "dollar" && props.spread && <SpreadIndicator spread={props.spread} />}

      {/* Range selector */}
      <RangeSelector ranges={ranges} value={rangeValue} onChange={setRangeValue} />

      {/* Metric cards */}
      {props.kind === "bandas" ? (
        <BandasMetricCards data={props.data} cotizacionActual={props.cotizacionActual} />
      ) : metrics ? (
        <MetricCards
          metrics={metrics}
          formatValue={formatValue}
          kind={props.kind}
          currentValue={values[values.length - 1]}
        />
      ) : null}

      {/* Cierre anterior card */}
      {showsPreviousClose && <PreviousCloseTile valueText={formatValue(previousClose)} />}

      {/* Chart */}
      <IndicatorChart
        kind={props.kind}
        label={props.label}
        macroFormat={macroFormat}
        chartData={chartData}
        strokeColor={strokeColor}
        formatLabel={formatLabel}
        formatValue={formatValue}
        previousClose={showsPreviousClose ? previousClose : null}
      />

      {/* Update Time */}
      {props.updateTime && <UpdateTime updateTime={props.updateTime} />}
    </div>
  );
}
