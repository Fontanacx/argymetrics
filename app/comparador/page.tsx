import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowLeft, ChartLine } from "lucide-react";
import Link from "next/link";
import { Navbar, Footer } from "@/app/components/layout";
import {
  HistoricalComparisonPageSkeleton,
  HistoricalComparisonSection,
} from "@/app/components/dashboard";

export const metadata: Metadata = {
  title: "Comparador Histórico",
  description:
    "Compará la evolución del Dólar Blue, Dólar MEP, Riesgo País e Inflación en Argentina.",
  alternates: {
    canonical: "/comparador",
  },
};

export const revalidate = 60;

export default function ComparadorPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <header className="comparison-page-header">
          <div className="comparison-page-eyebrow">
            <ChartLine aria-hidden="true" size={15} strokeWidth={2.2} />
            <span>Análisis histórico</span>
          </div>
          <h1>Comparador Histórico</h1>
          <p>
            Leé cómo se movieron los principales indicadores del mercado argentino y compará sus
            variaciones en un mismo gráfico.
          </p>
          <Link href="/" className="comparison-page-backlink">
            <ArrowLeft aria-hidden="true" size={16} />
            Volver al dashboard
          </Link>
        </header>

        <Suspense fallback={<HistoricalComparisonPageSkeleton />}>
          <HistoricalComparisonSection withHeader={false} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
