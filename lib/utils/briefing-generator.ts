import { BriefingInput } from "@/lib/types";
import { formatARS, formatPercent } from "@/lib/formatters/currency";

export function generateBriefingText(data: BriefingInput): string {
  // 1. Mercado cambiario
  const brecha = data.brechaBlueOficial;
  const dayStr = data.date.split(" ")[0] || "día"; // e.g. "lunes"
  
  let s1 = "";
  if (brecha < 5) {
    s1 = `El mercado cambiario opera tranquilo este ${dayStr}, con una brecha Blue-Oficial del ${formatPercent(brecha)}, la más baja en lo que va de la semana.`;
  } else if (brecha <= 15) {
    s1 = `El mercado cambiario muestra tensión moderada este ${dayStr}, con una brecha Blue-Oficial del ${formatPercent(brecha)} entre el dólar blue a ${formatARS(data.blue.value)} y el oficial a ${formatARS(data.oficial.value)}.`;
  } else {
    s1 = `El mercado cambiario presenta tensión elevada este ${dayStr}: la brecha Blue-Oficial alcanza el ${formatPercent(brecha)}, con el blue a ${formatARS(data.blue.value)} frente al oficial a ${formatARS(data.oficial.value)}.`;
  }

  // 2. Indicadores macro
  let s2 = `El Riesgo País se ubica en ${Math.round(data.riesgoPais.value)} puntos y la inflación mensual más reciente fue del ${formatPercent(data.inflacion.value)} (${data.inflacion.date}).`;
  if (data.gold.variation !== null && Math.abs(data.gold.variation) > 1) {
    s2 += ` El oro ${data.gold.variation > 0 ? "sube" : "baja"} un ${formatPercent(Math.abs(data.gold.variation))} en el mercado internacional.`;
  }

  // 3. BYMA
  const verde = data.stocksEnVerde;
  const rojo = data.stocksEnRojo;
  const sortedStocks = [...data.stocks].sort((a, b) => (b.variation || 0) - (a.variation || 0));
  const topGainer = sortedStocks[0];
  const topLoser = sortedStocks[sortedStocks.length - 1];
  
  let s3 = "";
  if (verde === 0 && rojo === 0) {
    s3 = `En el mercado bursátil, la jornada finaliza sin variaciones, típicamente debido a un feriado o inactividad local.`;
  } else if (verde >= 7) {
    s3 = `En el mercado bursátil, ${verde} de 10 acciones cierran en verde, con ${topGainer?.symbol.replace(".BA", "")} liderando las subidas con un +${formatPercent(topGainer?.variation || 0)}.`;
  } else if (verde <= 3) {
    s3 = `En el mercado bursátil, la jornada es negativa: ${rojo} de 10 acciones operan en rojo, con ${topLoser?.symbol.replace(".BA", "")} registrando la mayor caída (${formatPercent(topLoser?.variation || 0)}).`;
  } else {
    const gainerVar = topGainer?.variation || 0;
    const gainerStr = gainerVar > 0 ? `+${formatPercent(gainerVar)}` : formatPercent(gainerVar);
    s3 = `En el mercado bursátil, la jornada es mixta: ${topGainer?.symbol.replace(".BA", "")} sube ${gainerStr} mientras que ${topLoser?.symbol.replace(".BA", "")} retrocede ${formatPercent(topLoser?.variation || 0)}.`;
  }

  return `${s1} ${s2} ${s3}`;
}
