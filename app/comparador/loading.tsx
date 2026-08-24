import { Navbar, Footer } from "@/app/components/layout";
import { HistoricalComparisonPageSkeleton } from "@/app/components/dashboard";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <header className="comparison-page-header">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton mt-4 h-12 w-80 max-w-full" />
          <div className="skeleton mt-4 h-5 w-full max-w-2xl" />
          <div className="skeleton mt-5 h-5 w-40" />
        </header>
        <HistoricalComparisonPageSkeleton />
      </main>
      <Footer />
    </div>
  );
}
