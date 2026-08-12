import { BarChart3, Globe, TrendingUp } from "lucide-react";
import { getArgentineStocks } from "@/lib/api/stocks";
import { getInternationalStocks } from "@/lib/api/international-stocks";
import { getMarketIndices } from "@/lib/api/indices";
import { IndexGrid, SectionShell, StockGrid } from "@/app/components/dashboard";
import { IndexGridSkeleton, StockGridSkeleton } from "@/app/components/ui";

export function MarketsSectionSkeleton() {
  return (
    <>
      <SectionShell
        id="acciones"
        title="Acciones Argentinas"
        icon={TrendingUp}
        subtitle="BYMA · Mercado local · Precios en ARS"
      >
        <StockGridSkeleton />
      </SectionShell>
      <SectionShell
        id="acciones-internacionales"
        title="Acciones Internacionales"
        icon={Globe}
        subtitle="NASDAQ · KRX · Precios en USD"
      >
        <StockGridSkeleton />
      </SectionShell>
      <SectionShell
        id="indices"
        title="Índices Bursátiles"
        icon={BarChart3}
        subtitle="Merval · S&P 500 · Nasdaq · Dow Jones"
      >
        <IndexGridSkeleton />
      </SectionShell>
    </>
  );
}

/**
 * Markets section: Argentine stocks, international stocks and market
 * indices. All three grids come from Yahoo Finance and share one
 * Suspense boundary, so the whole section streams together.
 */
export default async function MarketsSection() {
  const [stocks, internationalStocks, indices] = await Promise.all([
    getArgentineStocks(),
    getInternationalStocks(),
    getMarketIndices(),
  ]);

  return (
    <>
      <SectionShell
        id="acciones"
        title="Acciones Argentinas"
        icon={TrendingUp}
        subtitle="BYMA · Mercado local · Precios en ARS"
      >
        <StockGrid stocks={stocks} />
      </SectionShell>

      <SectionShell
        id="acciones-internacionales"
        title="Acciones Internacionales"
        icon={Globe}
        subtitle="NASDAQ · KRX · Precios en USD"
      >
        <StockGrid stocks={internationalStocks} currency="USD" />
      </SectionShell>

      <SectionShell
        id="indices"
        title="Índices Bursátiles"
        icon={BarChart3}
        subtitle="Merval · S&P 500 · Nasdaq · Dow Jones"
      >
        <IndexGrid indices={indices} />
      </SectionShell>
    </>
  );
}
