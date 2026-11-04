import type { BrlWalletRate } from "@/lib/types";
import { formatARS } from "@/lib/formatters/currency";
import { formatTime } from "@/lib/formatters/date";

interface BrlWalletCardProps {
  wallet: BrlWalletRate;
  isBest: boolean;
}

/**
 * Real (BRL) quote from a wallet or fintech, expressed in ARS per 1 BRL.
 *
 * "Para pagar" is the rate you pay to buy BRL (ComparaPix `buy`).
 * "Para cobrar" is the rate you receive to sell BRL (ComparaPix `sell`).
 */
export default function BrlWalletCard({ wallet, isBest }: BrlWalletCardProps) {
  const initial = wallet.nombre.charAt(0).toUpperCase();

  return (
    <article
      className="metric-card flex flex-col gap-3 rounded-xl border p-4 transition-shadow"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="metric-card-avatar flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md"
            style={{
              background: "var(--bg-primary)",
              backgroundImage: wallet.logo ? `url(${wallet.logo})` : undefined,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
            }}
            aria-hidden="true"
          >
            {!wallet.logo && (
              <span
                className="text-sm font-bold"
                style={{ color: "var(--color-accent)" }}
              >
                {initial}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3
              className="truncate text-sm font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
              title={wallet.nombre}
            >
              {wallet.url ? (
                <a
                  href={wallet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {wallet.nombre}
                </a>
              ) : (
                wallet.nombre
              )}
            </h3>
            <p
              className="metric-card-subtitle text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              ARS por 1 BRL
            </p>
          </div>
        </div>

        {isBest && (
          <span
            className="metric-badge inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-bold"
            style={{
              background: "var(--color-positive-bg)",
              color: "var(--color-positive)",
            }}
          >
            Mejor
          </span>
        )}
      </div>

      <div className="mt-auto pt-1">
        <p
          className="text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          Para pagar
        </p>
        <p
          className="metric-card-value text-xl font-bold tabular-nums tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {formatARS(wallet.venta)}
        </p>

        <div
          className="metric-card-extra mt-1 space-y-0.5 text-[11px]"
          style={{ color: "var(--text-muted)" }}
        >
          <p>
            Para cobrar:{" "}
            {wallet.compra !== null ? formatARS(wallet.compra) : "—"}
          </p>
          <p>Actualizado {formatTime(wallet.fechaActualizacion)}</p>
          {wallet.hasFees && <p>Puede incluir comisiones</p>}
        </div>
      </div>
    </article>
  );
}
