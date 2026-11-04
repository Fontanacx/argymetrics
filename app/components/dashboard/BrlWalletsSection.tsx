import { Banknote } from "lucide-react";
import { fetchBrlWalletRates } from "@/lib/api/brl-wallets";
import BrlWalletCard from "./BrlWalletCard";
import SectionShell from "./SectionShell";

export function BrlWalletsSectionSkeleton() {
  return (
    <SectionShell
      id="reales"
      title="Real en billeteras"
      icon={Banknote}
      subtitle="ARS por 1 BRL · Mercado Pago y billeteras"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-[132px] animate-pulse rounded-xl border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border-primary)",
            }}
          />
        ))}
      </div>
    </SectionShell>
  );
}

/**
 * Real (BRL) quotes from Mercado Pago and other wallets, sourced from the
 * public ComparaPix PIX rate aggregator.
 */
export default async function BrlWalletsSection() {
  const wallets = await fetchBrlWalletRates();

  if (wallets.length === 0) return null;

  // Keep the main panel in sync with the converter: show every curated
  // provider, sorted by the best "para pagar" rate.
  const displayed = wallets;
  const bestId =
    displayed.find((wallet) => !wallet.hasFees)?.id ?? displayed[0]?.id;

  return (
    <SectionShell
      id="reales"
      title="Real en billeteras"
      icon={Banknote}
      subtitle="ARS por 1 BRL · Mercado Pago y billeteras"
      right={
        <a
          href="https://comparapix.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold hover:underline"
          style={{ color: "var(--color-accent)" }}
        >
          ComparaPix ↗
        </a>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {displayed.map((wallet) => (
          <BrlWalletCard
            key={wallet.id}
            wallet={wallet}
            isBest={wallet.id === bestId}
          />
        ))}
      </div>

      <p
        className="mt-3 text-[11px] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Cotizaciones PIX de{" "}
        <a
          href="https://comparapix.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline"
          style={{ color: "var(--color-accent)" }}
        >
          ComparaPix
        </a>
        . “Para pagar” es el costo de comprar 1 BRL; “para cobrar”, lo que
        recibís al vender 1 BRL. Pueden aplicar comisiones y la tasa cambia
        cada pocos minutos.
      </p>
    </SectionShell>
  );
}
