import { Activity } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SectionHeader from "@/app/components/SectionHeader";
import DailyInsights from "@/app/components/DailyInsights";
import { fetchDollarsWithHistory, fetchFullDollarHistory, fetchRiesgoPaisHistory } from "@/lib/api/historical";
import { fetchRiesgoPais } from "@/lib/api/indicators";
import { fetchCommodities, fetchCommodityHistory } from "@/lib/api/commodities";
import { fetchCryptos, fetchCryptoHistory } from "@/lib/api/crypto";
import { CASA_LABELS } from "@/lib/constants";

export const revalidate = 0;

export default async function InsightsPage() {
  const [
    dollars,
    riesgoPais,
    riesgoHistory,
    commodities,
    goldHistory,
    brentHistory,
    cryptos,
    btcHistory,
    ethHistory,
    blueHistory,
    oficialHistory,
    euroHistory,
    euroBlueHistory,
    euroTarjetaHistory,
  ] = await Promise.all([
    fetchDollarsWithHistory(),
    fetchRiesgoPais(),
    fetchRiesgoPaisHistory(),
    fetchCommodities(),
    fetchCommodityHistory("GC=F"), // Oro
    fetchCommodityHistory("BZ=F"), // Petróleo
    fetchCryptos(),
    fetchCryptoHistory("BTC-USD"),
    fetchCryptoHistory("ETH-USD"),
    fetchFullDollarHistory("blue"),
    fetchFullDollarHistory("oficial"),
    fetchFullDollarHistory("euro"),
    fetchFullDollarHistory("euroblue"),
    fetchFullDollarHistory("eurotarjeta"),
  ]);

  const histories: Record<string, typeof blueHistory> = {
    blue: blueHistory,
    oficial: oficialHistory,
    euro: euroHistory,
    euroblue: euroBlueHistory,
    eurotarjeta: euroTarjetaHistory,
  };

  const syncedRiesgoHistory = riesgoPais
    ? (() => {
        const history = [...riesgoHistory];
        const today = riesgoPais.fecha.split("T")[0];
        const lastEntry = history[history.length - 1];
        if (lastEntry?.fecha === today) {
          history[history.length - 1] = { fecha: today, valor: riesgoPais.valor };
        } else {
          history.push({ fecha: today, valor: riesgoPais.valor });
        }
        return history;
      })()
    : riesgoHistory;

  const normalizedAssets = [
    // Divisas
    ...dollars.map(d => ({
      name: CASA_LABELS[d.rate.casa] || d.rate.nombre,
      current: d.rate.venta,
      previous: histories[d.rate.casa]?.[histories[d.rate.casa].length - 2]?.venta || d.rate.venta,
      prefix: d.rate.casa.includes("euro") ? "€ " : "$ ",
      history: histories[d.rate.casa]?.slice(-7) || [],
      dataKey: "venta",
      formatType: "dollar" as const
    })),
    // Riesgo País
    ...(riesgoPais && syncedRiesgoHistory.length >= 2 ? [{
      name: "Riesgo País",
      current: riesgoPais.valor,
      previous: syncedRiesgoHistory[syncedRiesgoHistory.length - 2].valor,
      unit: " pts",
      history: syncedRiesgoHistory.slice(-7),
      dataKey: "valor",
      formatType: "riesgo" as const
    }] : []),
    // Commodities
    ...commodities.map(c => {
      const history = c.name === "ORO" ? goldHistory : brentHistory;
      return {
        name: c.name,
        current: c.price,
        previous: history?.[history.length - 2]?.valor || c.price,
        prefix: "US$ ",
        history: history.slice(-7),
        dataKey: "valor",
        formatType: "commodity" as const
      };
    }),
    // Criptomonedas
    ...(cryptos?.btc && btcHistory.length >= 2 ? [{
      name: "Bitcoin",
      current: cryptos.btc.valor,
      previous: btcHistory[btcHistory.length - 2].valor,
      prefix: "US$ ",
      history: btcHistory.slice(-7),
      dataKey: "valor",
      formatType: "crypto" as const
    }] : []),
    ...(cryptos?.eth && ethHistory.length >= 2 ? [{
      name: "Ethereum",
      current: cryptos.eth.valor,
      previous: ethHistory[ethHistory.length - 2].valor,
      prefix: "US$ ",
      history: ethHistory.slice(-7),
      dataKey: "valor",
      formatType: "crypto" as const
    }] : [])
  ];

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <section className="mb-8">
          <div className="mb-4">
            <SectionHeader title="Resumen del Día" icon={Activity} />
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Los activos argentinos operan en horario de mercado (de 11:00 a 17:00 hs), mientras que criptomonedas y otros activos internacionales operan de forma ininterrumpida (24/7).
            </p>
          </div>
          <DailyInsights assets={normalizedAssets} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
