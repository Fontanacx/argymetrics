"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles, DollarSign, Bitcoin, BarChart3, Info, Wallet, type LucideIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from "recharts";
import SparklineChart from "./SparklineChart";
import Modal from "./Modal";
import type { DollarWithHistory, RiesgoPais, InflacionMensual, CryptoRate, CryptoHistoryEntry, RiesgoPaisHistoryEntry } from "@/lib/types";
import type { CommodityQuote } from "@/lib/api/commodities";
import { formatShortDate } from "@/lib/formatters/date";
import { formatPercent as formatPercentUtil, formatPoints as formatPointsUtil } from "@/lib/formatters/currency";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import {
  computeDollarInsights,
  computeCryptoInsights,
  computeIndicatorInsights,
  computeInsightOfTheDay,
  computeWalletInsights,
  generateNarrative,
  type InsightCard,
  type InsightCategory,
} from "@/lib/utils/insights";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DailyInsightsProps {
  dollars: DollarWithHistory[];
  cryptos: Record<string, CryptoRate | null>;
  cryptoHistory?: Record<string, CryptoHistoryEntry[]>;
  riesgoPais: RiesgoPais | null;
  inflacion: InflacionMensual | null;
  commodities: CommodityQuote[];
  indicatorHistory?: {
    riesgoPais?: RiesgoPaisHistoryEntry[];
    inflacion?: InflacionMensual[];
    gold?: { fecha: string; valor: number }[];
    brent?: { fecha: string; valor: number }[];
  };
  walletDollars?: DollarWithHistory[];
}

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

interface TabConfig {
  key: InsightCategory;
  label: string;
  icon: LucideIcon;
}

const TABS: TabConfig[] = [
  { key: "dollars", label: "Dólares", icon: DollarSign },
  { key: "crypto", label: "Cripto", icon: Bitcoin },
  { key: "indicators", label: "Indicadores", icon: BarChart3 },
  { key: "wallets", label: "Billeteras", icon: Wallet },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Premium categorized financial insights panel.
 * Client component for tab switching only — all computations are pure functions.
 */
export default function DailyInsights({
  dollars,
  cryptos,
  cryptoHistory,
  riesgoPais,
  inflacion,
  commodities,
  indicatorHistory,
  walletDollars = [],
}: DailyInsightsProps) {
  const [activeTab, setActiveTab] = useState<InsightCategory>("dollars");
  const [selectedCard, setSelectedCard] = useState<InsightCard | null>(null);

  // Compute all insights once via memoization
  const dollarCards = useMemo(() => computeDollarInsights(dollars), [dollars]);
  const cryptoCards = useMemo(() => computeCryptoInsights(cryptos, cryptoHistory), [cryptos, cryptoHistory]);
  const indicatorCards = useMemo(
    () => computeIndicatorInsights(riesgoPais, inflacion, commodities, indicatorHistory),
    [riesgoPais, inflacion, commodities, indicatorHistory]
  );

  const walletCards = useMemo(() => computeWalletInsights(walletDollars), [walletDollars]);

  // Active category data
  const categoryMap: Record<InsightCategory, InsightCard[]> = {
    dollars: dollarCards,
    crypto: cryptoCards,
    indicators: indicatorCards,
    wallets: walletCards,
  };

  const activeCards = categoryMap[activeTab];
  
  const insightOfTheDay = useMemo(
    () => computeInsightOfTheDay(activeCards),
    [activeCards]
  );

  const narrative = useMemo(
    () => generateNarrative(activeTab, activeCards),
    [activeTab, activeCards]
  );

  return (
    <div className="space-y-4">
      {/* Insight of the Day — hero card */}
      {insightOfTheDay && (
        <div
          className="insights-hero animate-fade-in rounded-xl border p-5"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-primary)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: "var(--color-accent-light)",
                color: "var(--color-accent)",
              }}
            >
              <Sparkles size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                {insightOfTheDay.label}
              </p>
              {insightOfTheDay.originalLabel && (
                <p
                  className="mt-0.5 text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {insightOfTheDay.originalLabel}
                </p>
              )}
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {insightOfTheDay.value}
                </span>
                {insightOfTheDay.changePercent !== undefined && (
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{
                      color: sentimentColor(insightOfTheDay.sentiment),
                    }}
                  >
                    {insightOfTheDay.changePercent >= 0 ? "+" : ""}
                    {insightOfTheDay.changePercent.toFixed(2)}%
                  </span>
                )}
              </div>
              {insightOfTheDay.subtitle && (
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {insightOfTheDay.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div
        className="insights-tab-bar flex gap-1 rounded-lg border p-1 overflow-x-auto hide-scrollbar"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
        }}
      >
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`insights-tab flex-1 shrink-0 whitespace-nowrap items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key ? "insights-tab-active" : ""
              }`}
              style={{
                color:
                  activeTab === tab.key
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                background:
                  activeTab === tab.key
                    ? "var(--bg-card)"
                    : "transparent",
                boxShadow:
                  activeTab === tab.key
                    ? "var(--shadow-card)"
                    : "none",
                display: "inline-flex",
              }}
            >
              <TabIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Narrative summary */}
      <p
        className="animate-fade-in text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
        key={`narrative-${activeTab}`}
      >
        {narrative}
      </p>

      {/* Bento grid */}
      <div
        className="insights-bento-grid animate-fade-in"
        key={`grid-${activeTab}`}
      >
        {activeCards.map((card) => (
          <InsightCardView
            key={card.id}
            card={card}
            onCardClick={card.sparklineData && card.sparklineData.length >= 2 ? () => setSelectedCard(card) : undefined}
          />
        ))}
      </div>

      {/* Detail Modal */}
      <InsightDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// InsightCard sub-component
// ---------------------------------------------------------------------------

function InsightCardView({ card, onCardClick }: { card: InsightCard; onCardClick?: () => void }) {
  const color = sentimentColor(card.sentiment);
  const SentimentIcon =
    card.sentiment === "positive"
      ? TrendingUp
      : card.sentiment === "negative"
        ? TrendingDown
        : Minus;
  const isClickable = Boolean(onCardClick);

  return (
    <div
      className={`insights-card rounded-xl border p-4 transition-shadow ${
        card.size === "featured" ? "insights-card-featured" : ""
      } ${isClickable ? "cursor-pointer" : ""}`}
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        boxShadow: "var(--shadow-card)",
        borderLeftColor: card.size === "featured" ? color : undefined,
        borderLeftWidth: card.size === "featured" ? "3px" : undefined,
      }}
      onClick={onCardClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") onCardClick?.(); } : undefined}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {card.label}
        </span>
        <div className="flex items-center gap-1">
          {card.rank && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                background: rankBackground(card.rank),
                color: "#ffffff",
              }}
            >
              {card.rank}
            </span>
          )}
          {isClickable && (
            <Info size={13} style={{ color: "var(--text-muted)", opacity: 0.6 }} />
          )}
          <SentimentIcon size={14} style={{ color }} />
        </div>
      </div>

      {/* Value */}
      <p
        className="mt-2 text-lg font-bold tabular-nums leading-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {card.value}
      </p>

      {/* Change percent badge */}
      {card.changePercent !== undefined && Number.isFinite(card.changePercent) && (
        <span
          className="mt-1 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
          style={{
            background: sentimentBg(card.sentiment),
            color,
          }}
        >
          {card.changePercent >= 0 ? "▲" : "▼"}{" "}
          {Math.abs(card.changePercent).toFixed(2)}%
        </span>
      )}

      {/* Subtitle */}
      {card.subtitle && (
        <p
          className="mt-2 text-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {card.subtitle}
        </p>
      )}

      {/* Sparkline chart */}
      {card.sparklineData && card.sparklineData.length >= 2 && (
        <div className="-mx-2 mt-2 border-t pt-2" style={{ borderColor: "var(--border-subtle)" }}>
          <SparklineChart
            data={card.sparklineData}
            positive={card.sentiment === "positive" || card.sentiment === "neutral"}
            label={card.value}
            dataKey={card.sparklineDataKey ?? "venta"}
            formatType={card.sparklineFormatType ?? "dollar"}
          />
        </div>
      )}

      {/* Context tag */}
      {card.context && (
        <span
          className="mt-2 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            background: "var(--bg-card-hover)",
            color: "var(--text-muted)",
          }}
        >
          {card.context === "24h"
            ? "Últimas 24h"
            : card.context === "monthly"
              ? "vs mes anterior"
              : "vs ayer"}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// InsightDetailModal — full chart view when clicking a card
// ---------------------------------------------------------------------------



function InsightDetailModal({ card, onClose }: { card: InsightCard | null; onClose: () => void }) {
  if (!card || !card.sparklineData || card.sparklineData.length < 2) {
    return <Modal open={false} onClose={onClose} title="">
      <div />
    </Modal>;
  }

  const isPositive = card.sentiment === "positive" || card.sentiment === "neutral";
  const strokeColor = isPositive ? "var(--chart-positive)" : "var(--chart-negative)";
  const dataKey = card.sparklineDataKey ?? "venta";
  const formatType = card.sparklineFormatType ?? "dollar";

  const valueFormatter = (v: number) => {
    if (formatType === "riesgo") return `${formatPointsUtil(v)} pts`;
    if (formatType === "inflacion") return formatPercentUtil(v);
    if (formatType === "commodity" || formatType === "crypto")
      return `US$ ${v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${v.toLocaleString("es-AR")}`;
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={card.label}
      size="lg"
      allowFullscreen
    >
      {/* Card info summary */}
      <div className="mb-4 flex items-baseline gap-3">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {card.value}
        </span>
        {card.changePercent !== undefined && Number.isFinite(card.changePercent) && (
          <span
            className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-sm font-semibold tabular-nums"
            style={{
              background: sentimentBg(card.sentiment),
              color: sentimentColor(card.sentiment),
            }}
          >
            {card.changePercent >= 0 ? "▲" : "▼"}{" "}
            {Math.abs(card.changePercent).toFixed(2)}%
          </span>
        )}
      </div>

      {card.subtitle && (
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          {card.subtitle}
        </p>
      )}

      {/* Chart */}
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={card.sparklineData as Record<string, unknown>[]}
            margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="fecha"
              tickFormatter={(v) => formatShortDate(v as string)}
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
              formatter={(value: ValueType | undefined) => [
                valueFormatter(Number(value ?? 0)),
                "Valor",
              ]}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              strokeWidth={2}
              dot={{ r: 3, fill: strokeColor }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function sentimentColor(sentiment: InsightCard["sentiment"]): string {
  if (sentiment === "positive") return "var(--color-positive)";
  if (sentiment === "negative") return "var(--color-negative)";
  return "var(--color-neutral)";
}

function sentimentBg(sentiment: InsightCard["sentiment"]): string {
  if (sentiment === "positive") return "var(--color-positive-bg)";
  if (sentiment === "negative") return "var(--color-negative-bg)";
  return "var(--color-neutral-bg)";
}

function rankBackground(rank: 1 | 2 | 3): string {
  if (rank === 1) return "#f59e0b"; // gold
  if (rank === 2) return "#94a3b8"; // silver
  return "#b45309"; // bronze
}
