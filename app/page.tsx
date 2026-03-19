import { DollarSign, Activity, Clock, Coins } from "lucide-react";
import { fetchDollarsWithHistory, fetchFullDollarHistory, fetchRiesgoPaisHistory } from "@/lib/api/historical";
import { fetchAllDollars } from "@/lib/api/dollars";
import { fetchRiesgoPais, fetchInflacion, fetchInflacionHistory, getBandas, fetchBandasHistory } from "@/lib/api/indicators";
import { fetchCommodities, fetchCommodityHistory } from "@/lib/api/commodities";
import { fetchCryptos, fetchCryptoHistory } from "@/lib/api/crypto";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SectionHeader from "./components/SectionHeader";
import DollarGrid from "./components/DollarGrid";
import IndicatorsStrip from "./components/IndicatorsStrip";
import BandasIndicator from "./components/BandasIndicator";
import MarketTicker from "./components/MarketTicker";
import CryptoStrip from "./components/CryptoStrip";


export const revalidate = 0;

/**
 * Main dashboard page. All data is fetched server-side using ISR.
 * Historical data is passed to cards for on-demand modal access.
 */
export default async function Home() {
  const [
    dollars,
    riesgoPais,
    inflacion,
    blueHistory,
    oficialHistory,
    riesgoHistory,
    inflacionHistory,
    allRates,
    commodities,
    euroHistory,
    euroBlueHistory,
    euroTarjetaHistory,
    goldHistory,
    brentHistory,
    bandasHistory,
    cryptos,
    btcHistory,
    ethHistory,
  ] = await Promise.all([
    fetchDollarsWithHistory(),
    fetchRiesgoPais(),
    fetchInflacion(),
    fetchFullDollarHistory("blue"),
    fetchFullDollarHistory("oficial"),
    fetchRiesgoPaisHistory(),
    fetchInflacionHistory(),
    fetchAllDollars(),
    fetchCommodities(),
    fetchFullDollarHistory("euro"),
    fetchFullDollarHistory("euroblue"),
    fetchFullDollarHistory("eurotarjeta"),
    fetchCommodityHistory("GC=F"), // Oro
    fetchCommodityHistory("BZ=F"), // Petróleo
    fetchBandasHistory(),
    fetchCryptos(),
    fetchCryptoHistory("BTC-USD"),
    fetchCryptoHistory("ETH-USD"),
  ]);

  // ---------------------------------------------------------------------------
  // Hybrid sync: merge the live CriptoYa value into the ArgentinaDatos history
  // so the chart's most-recent point always matches the indicator card.
  // ---------------------------------------------------------------------------
  const syncedRiesgoHistory = riesgoPais
    ? (() => {
        const history = [...riesgoHistory];
        const today = riesgoPais.fecha.split("T")[0]; // "YYYY-MM-DD"
        const lastEntry = history[history.length - 1];
        if (lastEntry?.fecha === today) {
          // Update today's existing entry in place
          history[history.length - 1] = { fecha: today, valor: riesgoPais.valor };
        } else {
          // Append a new entry for today
          history.push({ fecha: today, valor: riesgoPais.valor });
        }
        return history;
      })()
    : riesgoHistory;


  const bandas = getBandas();

  // Use the official dollar sell rate for the bandas position marker
  const oficialRate = dollars.find((d) => d.rate.casa === "oficial");
  const cotizacionActual = oficialRate?.rate.venta;

  // Build histories map for DollarGrid info modals
  const histories: Record<string, typeof blueHistory> = {
    blue: blueHistory,
    oficial: oficialHistory,
    euro: euroHistory,
    euroblue: euroBlueHistory,
    eurotarjeta: euroTarjetaHistory,
  };

  // Compute the most recent update timestamp from dollar data
  const latestUpdate = dollars.reduce((latest, d) => {
    const ts = d.rate.fechaActualizacion;
    if (!ts) return latest;
    
    // Fallback if latest is empty
    if (!latest) return ts;
    
    // Safely compare using Date.parse to ignore ISO format differences
    const currentDate = new Date(ts).getTime();
    const latestDate = new Date(latest).getTime();
    
    return currentDate > latestDate ? ts : latest;
  }, "");

  // Format update time (HH:mm)
  const updateTime = latestUpdate
    ? new Intl.DateTimeFormat("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Argentina/Buenos_Aires",
      }).format(new Date(latestUpdate))
    : null;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)" }}>
      <MarketTicker
        rates={allRates}
        riesgoPais={riesgoPais}
        commodities={commodities}
        cryptos={cryptos}
        variations={Object.fromEntries(
          dollars.map((d) => [d.rate.casa, d.variacion])
        )}
      />
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Divisas section */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeader title="Divisas" icon={DollarSign} />
            {updateTime && (
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <Clock size={12} />
                <span>Actualizado: {updateTime}</span>
              </div>
            )}
          </div>
          <DollarGrid dollars={dollars} histories={histories} />
        </section>

        {/* Indicadores section */}
        <section className="mb-8">
          <div className="mb-4">
            <SectionHeader title="Indicadores" icon={Activity} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <IndicatorsStrip
                riesgoPais={riesgoPais}
                inflacion={inflacion}
                riesgoHistory={syncedRiesgoHistory}
                inflacionHistory={inflacionHistory}
                commodities={commodities}
                goldHistory={goldHistory}
                brentHistory={brentHistory}
              />
            </div>
            <div>
              <BandasIndicator bandas={bandas} cotizacionActual={cotizacionActual} history={bandasHistory} updateTime={latestUpdate} />
            </div>
          </div>
        </section>

        {/* Criptomonedas section */}
        <section className="mb-8">
          <div className="mb-4">
            <SectionHeader title="Criptomonedas" icon={Coins} />
          </div>
          <CryptoStrip cryptos={cryptos} btcHistory={btcHistory} ethHistory={ethHistory} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
