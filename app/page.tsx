import { Suspense } from "react";
import { Navbar, Footer } from "@/app/components/layout";
import {
  TickerSection,
  DollarsSection,
  DollarsSectionSkeleton,
  IndicatorsSection,
  IndicatorsSectionSkeleton,
  MarketsSection,
  MarketsSectionSkeleton,
  CryptosSection,
  CryptosSectionSkeleton,
} from "@/app/components/dashboard";
import { TickerSkeleton } from "@/app/components/ui";

// ---------------------------------------------------------------------------
// ISR: the whole dashboard is statically generated and revalidated every
// 60s. External data fetches keep their own (longer or equal) revalidate
// windows, so regeneration only re-hits stale sources.
// ---------------------------------------------------------------------------
export const revalidate = 60;

/**
 * Main dashboard. Each section is a self-fetching server component wrapped
 * in its own <Suspense> boundary, so sections stream independently:
 * the shell renders instantly and each grid appears as soon as its data
 * is ready (skeleton fallbacks until then).
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)" }}>
      <Suspense fallback={<TickerSkeleton />}>
        <TickerSection />
      </Suspense>
      <Navbar />

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Suspense fallback={<DollarsSectionSkeleton />}>
          <DollarsSection />
        </Suspense>

        <Suspense fallback={<IndicatorsSectionSkeleton />}>
          <IndicatorsSection />
        </Suspense>

        <Suspense fallback={<MarketsSectionSkeleton />}>
          <MarketsSection />
        </Suspense>

        <Suspense fallback={<CryptosSectionSkeleton />}>
          <CryptosSection />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
