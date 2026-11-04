import { Globe } from "lucide-react";
import { fetchLatamCurrencies } from "@/lib/api/latam";
import LatamCurrencyCard from "./LatamCurrencyCard";
import SectionShell from "./SectionShell";

const DISPLAY_ORDER = ["MXN", "COP", "UYU", "PEN", "CLP", "PYG"];

function displayRank(code: string): number {
  const index = DISPLAY_ORDER.indexOf(code);
  return index === -1 ? DISPLAY_ORDER.length : index;
}

export function LatamCurrenciesSectionSkeleton() {
  return (
    <SectionShell
      id="otras-monedas"
      title="Otras monedas"
      icon={Globe}
      subtitle="MXN · COP · UYU · PEN · CLP · PYG · ARS por 1 unidad"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[150px] animate-pulse rounded-xl border"
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
 * LATAM cross-rates already used by the converter, now visible on the
 * dashboard so both surfaces show the same currency universe.
 */
export default async function LatamCurrenciesSection() {
  const rates = await fetchLatamCurrencies();

  if (rates.length === 0) return null;

  const sortedRates = [...rates].sort(
    (a, b) => displayRank(a.moneda) - displayRank(b.moneda)
  );

  return (
    <SectionShell
      id="otras-monedas"
      title="Otras monedas"
      icon={Globe}
      subtitle="MXN · COP · UYU · PEN · CLP · PYG · ARS por 1 unidad"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedRates.map((rate) => (
          <LatamCurrencyCard key={rate.moneda} rate={rate} />
        ))}
      </div>

      <p
        className="mt-3 text-[11px] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Conversión cruzada con dólar CCL y cotizaciones regionales. Los valores
        son referenciales y pueden incluir spreads de mercado.
      </p>
    </SectionShell>
  );
}
