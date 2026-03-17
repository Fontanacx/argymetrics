import { TrendingUp, TrendingDown, Coins } from "lucide-react";
import type { CryptoRate, CryptoHistoryEntry } from "@/lib/types";
import { INDICATOR_DEFINITIONS } from "@/lib/constants/definitions";
import InfoButton from "./InfoButton";
import IndicatorDetail from "./IndicatorDetail";

interface CryptoStripProps {
  cryptos?: Record<string, CryptoRate | null>;
  btcHistory?: CryptoHistoryEntry[];
  ethHistory?: CryptoHistoryEntry[];
}

/**
 * Horizontal strip showing Crypto indicators.
 */
export default function CryptoStrip({ cryptos, btcHistory, ethHistory }: CryptoStripProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Bitcoin */}
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
          style={{ background: "rgba(247, 147, 26, 0.1)", color: "#F7931A" }}
        >
          {/* Using a generic Coins icon for crypto */}
          <Coins size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>
              Bitcoin (BTC)
            </p>
            {btcHistory && btcHistory.length > 0 && (
              <InfoButton title="Bitcoin (BTC)">
                <IndicatorDetail
                  kind="crypto"
                  data={btcHistory}
                  label="Bitcoin"
                  definition={INDICATOR_DEFINITIONS.btc}
                  updateTime={cryptos?.btc?.fecha}
                />
              </InfoButton>
            )}
          </div>
          {cryptos?.btc ? (
            <>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                US$ {cryptos.btc.valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-xs">
                {cryptos.btc.variacion > 0 ? (
                  <TrendingUp size={12} style={{ color: "var(--color-positive)" }} />
                ) : cryptos.btc.variacion < 0 ? (
                  <TrendingDown size={12} style={{ color: "var(--color-negative)" }} />
                ) : null}
                <span
                  style={{
                    color:
                      cryptos.btc.variacion > 0
                        ? "var(--color-positive)"
                        : cryptos.btc.variacion < 0
                          ? "var(--color-negative)"
                          : "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {cryptos.btc.variacion > 0 ? "+" : ""}
                  {cryptos.btc.variacion.toFixed(2)}%
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sin datos disponibles
            </p>
          )}
        </div>
      </div>

      {/* Ethereum */}
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
          style={{ background: "rgba(98, 126, 234, 0.1)", color: "#627EEA" }}
        >
          {/* Using a generic Coins icon with ETH color */}
          <Coins size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>
              Ethereum (ETH)
            </p>
            {ethHistory && ethHistory.length > 0 && (
              <InfoButton title="Ethereum (ETH)">
                <IndicatorDetail
                  kind="crypto"
                  data={ethHistory}
                  label="Ethereum"
                  definition={INDICATOR_DEFINITIONS.eth}
                  updateTime={cryptos?.eth?.fecha}
                />
              </InfoButton>
            )}
          </div>
          {cryptos?.eth ? (
            <>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                US$ {cryptos.eth.valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-xs">
                {cryptos.eth.variacion > 0 ? (
                  <TrendingUp size={12} style={{ color: "var(--color-positive)" }} />
                ) : cryptos.eth.variacion < 0 ? (
                  <TrendingDown size={12} style={{ color: "var(--color-negative)" }} />
                ) : null}
                <span
                  style={{
                    color:
                      cryptos.eth.variacion > 0
                        ? "var(--color-positive)"
                        : cryptos.eth.variacion < 0
                          ? "var(--color-negative)"
                          : "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {cryptos.eth.variacion > 0 ? "+" : ""}
                  {cryptos.eth.variacion.toFixed(2)}%
                </span>
              </div>
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
