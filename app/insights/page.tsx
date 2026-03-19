import { BarChart3 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SectionHeader from "@/app/components/SectionHeader";
import DailyInsights from "@/app/components/DailyInsights";
import { fetchDollarsWithHistory } from "@/lib/api/historical";
import { fetchRiesgoPais, fetchInflacion } from "@/lib/api/indicators";
import { fetchCommodities } from "@/lib/api/commodities";
import { fetchCryptos } from "@/lib/api/crypto";

export const revalidate = 0;

/**
 * Dedicated insights page — identical data flow as the dashboard section.
 * All data fetched server-side, passed to the client DailyInsights component.
 */
export default async function InsightsPage() {
  const [dollars, riesgoPais, inflacion, commodities, cryptos] =
    await Promise.all([
      fetchDollarsWithHistory(),
      fetchRiesgoPais(),
      fetchInflacion(),
      fetchCommodities(),
      fetchCryptos(),
    ]);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <section className="mb-8">
          <div className="mb-4">
            <SectionHeader title="Resumen del Día" icon={BarChart3} />
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Los activos argentinos operan en horario de mercado (de 11:00 a
              17:00 hs), mientras que criptomonedas y otros activos
              internacionales operan de forma ininterrumpida (24/7).
            </p>
          </div>
          <DailyInsights
            dollars={dollars}
            cryptos={cryptos}
            riesgoPais={riesgoPais}
            inflacion={inflacion}
            commodities={commodities}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
