import { DollarSign, Activity, Clock, Wallet, Coins, TrendingUp, BarChart3 } from "lucide-react";
import { fetchDollarsWithHistory, fetchFullDollarHistory, fetchRiesgoPaisHistory } from "@/lib/api/historical";
import { fetchAllDollars } from "@/lib/api/dollars";
import { fetchRiesgoPais, fetchInflacion, fetchInflacionHistory, getBandas, fetchBandasHistory } from "@/lib/api/indicators";
import { fetchCommodities, fetchCommodityHistory } from "@/lib/api/commodities";
import { fetchCryptos, fetchCryptoHistory } from "@/lib/api/crypto";
import { fetchWalletDollars } from "@/lib/api/wallets";
import { getArgentineStocks } from "@/lib/api/stocks";
import { getMarketIndices } from "@/lib/api/indices";
import { Navbar } from "@/app/components/layout";
import { Footer } from "@/app/components/layout";
import { SectionHeader } from "@/app/components/layout";
import { DollarGrid } from "@/app/components/dashboard";
import { IndicatorsStrip } from "@/app/components/dashboard";
import { BandasIndicator } from "@/app/components/dashboard";
import { MarketTicker } from "@/app/components/layout";
import CryptoStrip from "./components/CryptoStrip";
import { StockGrid } from "@/app/components/dashboard";
import { IndexGrid } from "@/app/components/dashboard";
import { DISPLAYED_CASAS } from "@/lib/constants";

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
    mayoristaHistory,
    bolsaHistory,
    cclHistory,
    riesgoHistory,
    inflacionHistory,
    allRates,
    commodities,
    euroHistory,
    euroBlueHistory,
    euroTarjetaHistory,
    criptoHistoryFull,
    goldHistory,
    brentHistory,
    gasHistory,
    bandasHistory,
    cryptos,
    btcHistory,
    ethHistory,
    walletDollars,
    realHistory,
    realBlueHistory,
    realTarjetaHistory,
    stocks,
    indices,
  ] = await Promise.all([
    fetchDollarsWithHistory(),
    fetchRiesgoPais(),
    fetchInflacion(),
    fetchFullDollarHistory("blue"),
    fetchFullDollarHistory("oficial"),
    fetchFullDollarHistory("mayorista"),
    fetchFullDollarHistory("bolsa"),
    fetchFullDollarHistory("contadoconliqui"),
    fetchRiesgoPaisHistory(),
    fetchInflacionHistory(),
    fetchAllDollars(),
    fetchCommodities(),
    fetchFullDollarHistory("euro"),
    fetchFullDollarHistory("euroblue"),
    fetchFullDollarHistory("eurotarjeta"),
    fetchFullDollarHistory("cripto"),
    fetchCommodityHistory("GC=F"), // Oro
    fetchCommodityHistory("BZ=F"), // Petróleo
    fetchCommodityHistory("NG=F"), // Gas
    fetchBandasHistory(),
    fetchCryptos(),
    fetchCryptoHistory("BTC-USD"),
    fetchCryptoHistory("ETH-USD"),
    fetchWalletDollars(),
    fetchFullDollarHistory("real"),
    fetchFullDollarHistory("realblue"),
    fetchFullDollarHistory("realtarjeta"),
    getArgentineStocks(),
    getMarketIndices(),
  ]);

  // ---------------------------------------------------------------------------
  // Sincronizar el valor más reciente con el historial de ArgentinaDatos,
  // para que el último punto del gráfico coincida siempre con la tarjeta del indicador.
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
    mayorista: mayoristaHistory,
    bolsa: bolsaHistory,
    contadoconliqui: cclHistory,
    euro: euroHistory,
    euroblue: euroBlueHistory,
    eurotarjeta: euroTarjetaHistory,
    cripto: criptoHistoryFull,
    real: realHistory,
    realblue: realBlueHistory,
    realtarjeta: realTarjetaHistory,
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

  // Inject generic 'cripto' history to wallet dollars for sparklines and modals
  const criptoDollar = dollars.find((d) => d.rate.casa === "cripto");
  const criptoHistory = criptoDollar?.history || [];
  const criptoVariacion = criptoDollar?.variacion ?? null;
  const fullCriptoHistory = histories["cripto"] || [];

  const enrichedWalletDollars = walletDollars?.map((w) => ({
    ...w,
    history: criptoHistory,
    variacion: criptoVariacion,
  })) || [];

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
        stocks={stocks}
        indices={indices}
      />
      <Navbar />

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Divisas section */}
        <section id="divisas" className="mb-8">
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

        {/* Billeteras Virtuales section */}
        {enrichedWalletDollars.length > 0 && (
          <section id="billeteras" className="mb-8">
            <div className="mb-4">
              <SectionHeader title="Dólares Billeteras Virtuales" icon={Wallet} />
            </div>
            <DollarGrid
              dollars={enrichedWalletDollars}
              histories={{
                astropay: fullCriptoHistory,
                cocos: fullCriptoHistory,
                lemoncash: fullCriptoHistory,
                belo: fullCriptoHistory,
                buenbit: fullCriptoHistory,
              }}
            />
          </section>
        )}

        {/* Indicadores section */}
        <section id="indicadores" className="mb-8">
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
                gasHistory={gasHistory}
              />
            </div>
            <div>
              <BandasIndicator bandas={bandas} cotizacionActual={cotizacionActual} history={bandasHistory} updateTime={latestUpdate} />
            </div>
          </div>
        </section>

        {/* Acciones Argentinas section */}
        <section id="acciones" className="mb-8">
          <div className="mb-4">
            <SectionHeader 
              title="Acciones Argentinas" 
              icon={TrendingUp} 
              subtitle="BYMA · Mercado local · Precios en ARS" 
            />
          </div>
          <StockGrid stocks={stocks} />
        </section>

        {/* Índices Bursátiles section */}
        <section id="indices" className="mb-8">
          <div className="mb-4">
            <SectionHeader
              title="Índices Bursátiles"
              icon={BarChart3}
              subtitle="Merval · S&P 500 · Nasdaq · Dow Jones"
            />
          </div>
          <IndexGrid indices={indices} />
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
