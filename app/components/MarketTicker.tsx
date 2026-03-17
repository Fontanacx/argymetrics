import type { DollarRate, RiesgoPais, CryptoRate } from "@/lib/types";
import { formatARS, formatPoints } from "@/lib/formatters/currency";
import type { CommodityQuote } from "@/lib/api/commodities";

// ---------------------------------------------------------------------------
// Ticker item labels (short Bloomberg-style names)
// ---------------------------------------------------------------------------

const TICKER_LABELS: Record<string, string> = {
  oficial: "USD OFICIAL",
  blue: "USD BLUE",
  bolsa: "USD MEP",
  contadoconliqui: "USD CCL",
  mayorista: "USD MAYORISTA",
  cripto: "USD CRIPTO",
  tarjeta: "USD TARJETA",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TickerItem {
  label: string;
  value: string;
  change: number | null;
}

interface MarketTickerProps {
  rates: DollarRate[];
  riesgoPais: RiesgoPais | null;
  commodities: CommodityQuote[];
  cryptos?: Record<string, CryptoRate | null>;
  variations: Record<string, number | null>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Bloomberg-style scrolling ticker strip at the top of the page.
 * Uses inline styles to guarantee render fidelity (no CSS class dependency).
 * Renders APIs: Dollar rates, Riesgo Pais, and Yahoo Finance commodities (Gold/Brent).
 */
export default function MarketTicker({ rates, riesgoPais, commodities, cryptos, variations }: MarketTickerProps) {
  // 1. Add API dollar rates
  const items: TickerItem[] = rates.map((rate) => ({
    label: TICKER_LABELS[rate.casa] ?? rate.nombre.toUpperCase(),
    value: formatARS(rate.venta),
    change: variations[rate.casa] ?? null,
  }));

  // 2. Add API Riesgo Pais
  if (riesgoPais) {
    items.push({
      label: "RIESGO PAIS",
      value: `${formatPoints(riesgoPais.valor)} pts`,
      change: null,
    });
  }

  // 3. Add Commodities (Gold, Brent Crude)
  commodities.forEach((comm) => {
    items.push({
      label: comm.name,
      value: `US$ ${comm.price.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: comm.changePercent,
    });
  });

  // 4. Add Cryptos (BTC, ETH)
  if (cryptos) {
    if (cryptos.btc) {
      items.push({
        label: "BITCOIN",
        value: `US$ ${cryptos.btc.valor.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: cryptos.btc.variacion,
      });
    }
    if (cryptos.eth) {
      items.push({
        label: "ETHEREUM",
        value: `US$ ${cryptos.eth.valor.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: cryptos.eth.variacion,
      });
    }
  }

  // Render items twice for seamless infinite scroll
  const renderItems = (keyPrefix: string) =>
    items.map((item, i) => (
      <div
        key={`${keyPrefix}-${i}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 24px",
          whiteSpace: "nowrap",
          fontSize: "11px",
          fontVariantNumeric: "tabular-nums",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontWeight: 500,
            letterSpacing: "0.03em",
            color: "var(--ticker-label)",
          }}
        >
          {item.label}
        </span>
        <span
          style={{
            fontWeight: 600,
            color: "var(--ticker-text)",
          }}
        >
          {item.value}
        </span>
        {item.change !== null && (
          <span
            style={{
              fontWeight: 600,
              fontSize: "10px",
              color:
                item.change > 0
                  ? "var(--ticker-positive)"
                  : item.change < 0
                    ? "var(--ticker-negative)"
                    : "var(--ticker-neutral)",
            }}
          >
            {item.change > 0 ? "▲" : item.change < 0 ? "▼" : "–"}
            {Math.abs(item.change).toFixed(1)}%
          </span>
        )}
      </div>
    ));

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        background: "var(--ticker-bg)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div className="ticker-track" style={{ display: "flex", width: "max-content" }}>
        {renderItems("a")}
        {renderItems("b")}
      </div>
    </div>
  );
}
