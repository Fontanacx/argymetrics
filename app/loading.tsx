import { DollarSign, Activity } from "lucide-react";
import { Navbar } from "@/app/components/layout";
import { Footer } from "@/app/components/layout";
import { SectionHeader } from "@/app/components/layout";
import { DollarGridSkeleton } from "@/app/components/ui";
import { IndicatorsStripSkeleton } from "@/app/components/ui";
import { BandasIndicatorSkeleton } from "@/app/components/ui";

/**
 * Next.js loading UI. Automatically shown by the framework inside a
 * Suspense boundary while `page.tsx` awaits its async data.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Divisas section skeleton */}
        <section className="mb-8">
          <div className="mb-4">
            <SectionHeader title="Divisas" icon={DollarSign} />
          </div>
          <DollarGridSkeleton />
        </section>

        {/* Indicadores section skeleton */}
        <section className="mb-8">
          <div className="mb-4">
            <SectionHeader title="Indicadores" icon={Activity} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <IndicatorsStripSkeleton />
            </div>
            <div>
              <BandasIndicatorSkeleton />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
