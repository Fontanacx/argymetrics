import { BarChart3 } from "lucide-react";
import { Navbar, Footer, SectionHeader } from "@/app/components/layout";
import { fetchDollarsWithHistory, fetchRiesgoPaisHistory, fetchFullDollarHistory } from "@/lib/api/historical";
import { fetchRiesgoPais, fetchInflacion, fetchInflacionHistory } from "@/lib/api/indicators";
import { fetchCommodities, fetchCommodityHistory } from "@/lib/api/commodities";
import { fetchCryptos, fetchCryptoHistory } from "@/lib/api/crypto";
import { fetchWalletDollars } from "@/lib/api/wallets";
import { getArgentineStocks } from "@/lib/api/stocks";
import DailyInsights from "@/app/components/DailyInsights";
import { computeSemaforo } from "@/lib/utils/semaforo";
import { generateBriefingText } from "@/lib/utils/briefing-generator";
import type { BriefingInput } from "@/lib/types";

export const revalidate = 0;

export default async function InsightsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const dateParam = searchParams.date || null;

  const [
    dollars, 
    riesgoPais, 
    inflacion, 
    commodities, 
    cryptos, 
    riesgoHistory, 
    blueHistory,
    oficialHistory,
    mepHistory,
    stocks,
    btcHistory,
    ethHistory,
    inflacionHistory,
    goldHistory,
    brentHistory,
    walletDollars,
    criptoHistoryFull
  ] = await Promise.all([
    fetchDollarsWithHistory(),
    fetchRiesgoPais(),
    fetchInflacion(),
    fetchCommodities(),
    fetchCryptos(),
    fetchRiesgoPaisHistory(),
    fetchFullDollarHistory("blue"),
    fetchFullDollarHistory("oficial"),
    fetchFullDollarHistory("bolsa"),
    getArgentineStocks(),
    fetchCryptoHistory("BTC-USD"),
    fetchCryptoHistory("ETH-USD"),
    fetchInflacionHistory(),
    fetchCommodityHistory("GC=F"),
    fetchCommodityHistory("BZ=F"),
    fetchWalletDollars(),
    fetchFullDollarHistory("cripto")
  ]);

  // Safely extract the target currencies with guaranteed fallbacks
  const rawBlue = dollars.find(d => d.rate.casa === "blue") || { rate: { venta: 0 }, variacion: 0, history: [] };
  const rawOficial = dollars.find(d => d.rate.casa === "oficial") || { rate: { venta: 0 }, variacion: 0, history: [] };
  const rawMep = dollars.find(d => d.rate.casa === "bolsa") || { rate: { venta: 0 }, variacion: 0, history: [] };
  const rawCcl = dollars.find(d => d.rate.casa === "contadoconliqui") || { rate: { venta: 0 }, variacion: 0, history: [] };
  const rawCripto = dollars.find(d => d.rate.casa === "cripto") || { rate: { venta: 0 }, variacion: 0, history: [] };
  
  const rawGold = commodities.find(c => c.name === "ORO");
  const rawBrent = commodities.find(c => c.name === "PETROLEO BRENT");

  // --- TIME TRAVEL LOGIC ---
  const asOfDate = dateParam || new Date().toISOString().split("T")[0];
  const isTimeTravel = !!dateParam;

  function findHistMatch<T extends { fecha: string }>(history: T[], target: string, valKey: keyof T): { val: number, var: number | null } {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].fecha <= target) {
         const val = Number(history[i][valKey]) || 0;
         const prevVal = i > 0 ? Number(history[i-1][valKey]) : null;
         const variation = prevVal && prevVal > 0 ? ((val - prevVal) / prevVal) * 100 : null;
         return { val, var: variation };
      }
    }
    return { val: 0, var: null };
  }

  const blue = isTimeTravel ? findHistMatch(blueHistory, asOfDate, "venta") : { val: rawBlue.rate.venta, var: rawBlue.variacion };
  const oficial = isTimeTravel ? findHistMatch(oficialHistory, asOfDate, "venta") : { val: rawOficial.rate.venta, var: rawOficial.variacion };
  const mep = isTimeTravel ? findHistMatch(mepHistory, asOfDate, "venta") : { val: rawMep.rate.venta, var: rawMep.variacion };
  const ccl = isTimeTravel ? findHistMatch(rawCcl.history, asOfDate, "venta") : { val: rawCcl.rate.venta, var: rawCcl.variacion };
  const cripto = isTimeTravel ? findHistMatch(criptoHistoryFull, asOfDate, "venta") : { val: rawCripto.rate.venta, var: rawCripto.variacion };
  const gold = isTimeTravel ? findHistMatch(goldHistory, asOfDate, "valor") : { val: rawGold?.price || 0, var: rawGold?.changePercent || null };
  const brent = isTimeTravel ? findHistMatch(brentHistory, asOfDate, "valor") : { val: rawBrent?.price || 0, var: rawBrent?.changePercent || null };
  const rp = isTimeTravel ? findHistMatch(riesgoHistory, asOfDate, "valor") : { val: riesgoPais?.valor || 0, var: null }; // handled below for weekly

  // Inflacion is tricky as it's monthly
  let inflacionVal = inflacion?.valor || 0;
  let inflacionDate = inflacion?.fecha || "";
  if (isTimeTravel && asOfDate.length >= 7) {
    const targetMonth = asOfDate.substring(0, 7); // YYYY-MM
    for (let i = inflacionHistory.length - 1; i >= 0; i--) {
      if (inflacionHistory[i].fecha <= targetMonth + "-31") {
         inflacionVal = inflacionHistory[i].valor;
         inflacionDate = inflacionHistory[i].fecha;
         break;
      }
    }
  }

  // Calculations
  const brechaBlueOficial = oficial.val > 0 ? ((blue.val - oficial.val) / oficial.val) * 100 : 0;
  
  let brechaBlueYesterday: number | null = null;
  if (isTimeTravel) {
     const pB = findHistMatch(blueHistory, asOfDate, "venta");
     const pO = findHistMatch(oficialHistory, asOfDate, "venta");
     if (pB && pO && pO.val > 0) brechaBlueYesterday = ((pB.val - pO.val) / pO.val) * 100;
  } else if (blueHistory.length >= 2 && oficialHistory.length >= 2) {
    const prevBlue = blueHistory[blueHistory.length - 2].venta;
    const prevOficial = oficialHistory[oficialHistory.length - 2].venta;
    if (prevOficial > 0) brechaBlueYesterday = ((prevBlue - prevOficial) / prevOficial) * 100;
  }

  // RP weekly change
  let rpWeeklyChange: number | null = null;
  const filteredRpHist = isTimeTravel ? riesgoHistory.filter(r => r.fecha <= asOfDate) : riesgoHistory;
  if (filteredRpHist.length >= 7) {
    const prevRp = filteredRpHist[filteredRpHist.length - 7].valor;
    if (prevRp > 0) rpWeeklyChange = (rp.val - prevRp) / prevRp * 100;
  }

  // Stocks
  const currentStocks = stocks.map(s => {
    if (!isTimeTravel) return { symbol: s.symbol, name: s.name, variation: s.variation };
    const stockMatch = findHistMatch(s.history, asOfDate, "valor");
    return { symbol: s.symbol, name: s.name, variation: stockMatch.var };
  });

  const stocksEnVerde = currentStocks.filter(s => s.variation !== null && s.variation > 0).length;
  const stocksEnRojo = currentStocks.filter(s => s.variation !== null && s.variation < 0).length;

  // MEP 7d average
  let mep7dAverage: number | null = null;
  const filteredMepHist = isTimeTravel ? mepHistory.filter(h => h.fecha <= asOfDate) : mepHistory;
  if (filteredMepHist.length >= 7) {
    const last7 = filteredMepHist.slice(-7);
    const sum = last7.reduce((acc, curr) => acc + curr.venta, 0);
    mep7dAverage = sum / 7;
  }

  // Cripto and Wallets setup
  const criptoHistory = criptoHistoryFull.slice(-30);
  // Re-use current raw cryptos for wallet variations (TimeTravel doesn't affect tabs view)
  const rawCriptoVar = dollars.find(d => d.rate.casa === "cripto")?.variacion || 0;
  const enrichedWalletDollars = walletDollars?.map((w) => ({
    ...w,
    history: criptoHistory,
    variacion: rawCriptoVar,
  })) || [];

  // Formatting date for string template: e.g. "lunes 24 de marzo de 2026"
  // When back in time, we parse the raw YYYY-MM-DD
  const parseDate = new Date(asOfDate + "T12:00:00Z");
  const dateStr = parseDate.toLocaleDateString("es-AR", { 
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long", day: "numeric", month: "long", year: "numeric" 
  });

  const briefingInput: BriefingInput = {
    date: dateStr,
    blue: { value: blue.val, variation: blue.var },
    oficial: { value: oficial.val, variation: oficial.var },
    mep: { value: mep.val, variation: mep.var },
    ccl: { value: ccl.val, variation: ccl.var },
    cripto: { value: cripto.val, variation: cripto.var },
    brechaBlueOficial,
    brechaBlueYesterday,
    riesgoPais: { value: rp.val, weeklyChange: rpWeeklyChange },
    inflacion: { value: inflacionVal, date: inflacionDate },
    gold: { value: gold.val, variation: gold.var },
    brent: { value: brent.val, variation: brent.var },
    stocks: currentStocks,
    stocksEnVerde,
    stocksEnRojo,
    mep7dAverage
  };


  const semaforoItems = computeSemaforo(briefingInput);
  const briefingText = generateBriefingText(briefingInput);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader 
          title="Resumen del Día" 
          subtitle="Análisis inteligente del mercado argentino" 
          icon={BarChart3} 
        />
        
        <div className="mt-8">
           <DailyInsights 
             dollars={dollars}
             cryptos={cryptos}
             cryptoHistory={{ btc: btcHistory, eth: ethHistory }}
             riesgoPais={riesgoPais}
             inflacion={inflacion}
             commodities={commodities}
             indicatorHistory={{
               riesgoPais: riesgoHistory,
               inflacion: inflacionHistory,
               gold: goldHistory,
               brent: brentHistory,
             }}
             walletDollars={enrichedWalletDollars}
             stocks={stocks}
             briefing={{ input: briefingInput, text: briefingText, semaforo: semaforoItems }}
           />
        </div>
      </main>
      <Footer />
    </div>
  );
}
