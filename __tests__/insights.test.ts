import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  computeCryptoInsights,
  computeDollarInsights,
  computeIndicatorInsights,
  computeInsightOfTheDay,
  computeStockInsights,
  computeWalletInsights,
  generateNarrative,
  type InsightCard,
} from "@/lib/utils/insights";
import { CASA_LABELS } from "@/lib/constants";
import type { CommodityQuote, CryptoRate } from "@/lib/types";
import { makeDollar, makeStock } from "./support/fixtures";

const ids = (cards: InsightCard[]) => cards.map((c) => c.id);
const byId = (cards: InsightCard[], id: string) => {
  const card = cards.find((c) => c.id === id);
  assert.ok(card, `falta la card ${id}`);
  return card;
};

describe("computeDollarInsights", () => {
  test("lista vacía devuelve la card de fallback", () => {
    const cards = computeDollarInsights([]);
    assert.deepEqual(ids(cards), ["dollars-empty"]);
    assert.equal(cards[0].value, "—");
  });

  test("calcula la brecha Blue-Oficial como card destacada", () => {
    const cards = computeDollarInsights([
      makeDollar("oficial", 1290, 1300, 0.5),
      makeDollar("blue", 1390, 1430, 1),
    ]);
    const brecha = byId(cards, "dollar-brecha");
    assert.equal(brecha.value, "10.0%");
    assert.equal(brecha.size, "featured");
    assert.equal(brecha.sentiment, "positive");
    assert.equal(brecha.sparklineData?.length, 7);
  });

  test("sentimiento de la brecha: >15 neutral, >30 negativo", () => {
    const sentiment = (blueVenta: number) =>
      byId(
        computeDollarInsights([makeDollar("oficial", 1000, 1000, 0), makeDollar("blue", 1000, blueVenta, 0)]),
        "dollar-brecha",
      ).sentiment;
    assert.equal(sentiment(1100), "positive");
    assert.equal(sentiment(1200), "neutral");
    assert.equal(sentiment(1400), "negative");
  });

  test("sin oficial o con oficial en 0 no genera brecha", () => {
    assert.ok(!ids(computeDollarInsights([makeDollar("blue", 1, 1400, 1)])).includes("dollar-brecha"));
    assert.ok(
      !ids(computeDollarInsights([makeDollar("oficial", 0, 0, 1), makeDollar("blue", 1, 1400, 1)])).includes("dollar-brecha"),
    );
  });

  test("rankea hasta 3 subidas de mayor a menor y la mayor caída", () => {
    const cards = computeDollarInsights([
      makeDollar("oficial", 1290, 1300, 0.5),
      makeDollar("blue", 1390, 1430, 2),
      makeDollar("bolsa", 1340, 1350, 1),
      makeDollar("contadoconliqui", 1350, 1360, 3),
      makeDollar("cripto", 1370, 1380, 4),
      makeDollar("mayorista", 1280, 1290, -2),
    ]);
    const g1 = byId(cards, "dollar-gainer-1");
    assert.equal(g1.rank, 1);
    assert.equal(g1.changePercent, 4);
    assert.equal(g1.label, "Mayor Subida");
    assert.equal(byId(cards, "dollar-gainer-2").changePercent, 3);
    assert.equal(byId(cards, "dollar-gainer-3").changePercent, 2);
    assert.equal(byId(cards, "dollar-gainer-3").label, "Subida #3");
    assert.ok(!ids(cards).includes("dollar-gainer-4"));
    assert.equal(byId(cards, "dollar-loser").changePercent, -2);
  });

  test("ignora variaciones nulas o no finitas", () => {
    const cards = computeDollarInsights([
      makeDollar("oficial", 1290, 1300, null),
      makeDollar("blue", 1390, 1430, Number.NaN),
    ]);
    assert.ok(!ids(cards).some((id) => id.startsWith("dollar-gainer")));
    assert.ok(!ids(cards).includes("dollar-loser"));
    assert.ok(!ids(cards).includes("dollar-stable"));
  });

  test("marca el más estable, el más barato para comprar y el más caro para vender", () => {
    const cards = computeDollarInsights([
      makeDollar("oficial", 1290, 1300, 0.1),
      makeDollar("blue", 1390, 1430, 2),
    ]);
    assert.equal(byId(cards, "dollar-stable").value, CASA_LABELS.oficial);
    assert.equal(byId(cards, "dollar-cheapest").value, CASA_LABELS.oficial);
    assert.equal(byId(cards, "dollar-cheapest").subtitle, "Compra: $ 1.290,00");
    assert.equal(byId(cards, "dollar-expensive").value, CASA_LABELS.blue);
    assert.equal(byId(cards, "dollar-expensive").subtitle, "Venta: $ 1.430,00");
  });

  test("la sparkline se limita a los últimos 7 puntos", () => {
    const cards = computeDollarInsights([makeDollar("blue", 1390, 1430, 2, 30)]);
    assert.equal(byId(cards, "dollar-gainer-1").sparklineData?.length, 7);
  });
});

describe("computeCryptoInsights", () => {
  const rate = (valor: number, variacion: number): CryptoRate => ({ valor, variacion, fecha: "2026-03-16" });

  test("sin datos devuelve fallback", () => {
    assert.deepEqual(ids(computeCryptoInsights({})), ["crypto-empty"]);
    assert.deepEqual(ids(computeCryptoInsights({ btc: null, eth: null })), ["crypto-empty"]);
  });

  test("con BTC y ETH: top, worst, estable y sentimiento", () => {
    const cards = computeCryptoInsights({ btc: rate(90000, 3), eth: rate(3000, -1) });
    assert.deepEqual(ids(cards), ["crypto-top", "crypto-worst", "crypto-stable", "crypto-sentiment"]);
    assert.equal(byId(cards, "crypto-top").value, "Bitcoin (BTC)");
    assert.equal(byId(cards, "crypto-top").subtitle, "US$ 90.000,00 · +3.00% · últimas 24h");
    assert.equal(byId(cards, "crypto-worst").value, "Ethereum (ETH)");
    assert.equal(byId(cards, "crypto-stable").value, "Ethereum (ETH)");
    assert.equal(byId(cards, "crypto-sentiment").value, "Neutral");
    assert.equal(byId(cards, "crypto-sentiment").subtitle, "1 de 2 activos al alza");
  });

  test("un solo activo no genera card de peor desempeño", () => {
    const cards = computeCryptoInsights({ btc: rate(90000, 3) });
    assert.ok(!ids(cards).includes("crypto-worst"));
    assert.equal(byId(cards, "crypto-sentiment").value, "Alcista");
  });

  test("sentimiento bajista si menos del 40% sube", () => {
    const cards = computeCryptoInsights({ btc: rate(1, -1), eth: rate(1, -2), sol: rate(1, -3) });
    assert.equal(byId(cards, "crypto-sentiment").value, "Bajista");
    assert.equal(byId(cards, "crypto-sentiment").sentiment, "negative");
  });

  test("usa el nombre en mayúsculas para claves desconocidas", () => {
    assert.equal(byId(computeCryptoInsights({ sol: rate(150, 1) }), "crypto-top").value, "SOL");
  });

  test("adjunta la historia de cripto recortada a 7 puntos", () => {
    const history = Array.from({ length: 20 }, (_, i) => ({ fecha: `2026-03-${i + 1}`, valor: i }));
    const cards = computeCryptoInsights({ btc: rate(90000, 3) }, { btc: history });
    assert.equal(byId(cards, "crypto-top").sparklineData?.length, 7);
  });
});

describe("computeIndicatorInsights", () => {
  const gold: CommodityQuote = { name: "ORO", price: 3000.5, changePercent: 1.25, fecha: "2026-03-16" };
  const brent: CommodityQuote = { name: "PETROLEO BRENT", price: 70, changePercent: -0.5, fecha: "2026-03-16" };

  test("sin datos arma fallbacks de riesgo país e inflación", () => {
    assert.deepEqual(ids(computeIndicatorInsights(null, null, [])), [
      "indicator-riesgo-empty",
      "indicator-inflacion-empty",
    ]);
  });

  test("riesgo país: umbrales 400 y 700", () => {
    const at = (valor: number) => byId(computeIndicatorInsights({ fecha: "2026-03-16", valor }, null, []), "indicator-riesgo");
    assert.equal(at(399).sentiment, "positive");
    assert.equal(at(401).sentiment, "neutral");
    assert.equal(at(701).sentiment, "negative");
    assert.equal(at(574).value, "574 pts");
    assert.equal(at(574).size, "featured");
  });

  test("inflación: umbrales 3 y 6", () => {
    const at = (valor: number) =>
      byId(computeIndicatorInsights(null, { fecha: "2026-02-28", valor }, []), "indicator-inflacion");
    assert.equal(at(2.5).sentiment, "positive");
    assert.equal(at(4).sentiment, "neutral");
    assert.equal(at(6).sentiment, "negative");
    assert.equal(at(2.5).value, "+2,5%");
    assert.equal(at(2.5).context, "monthly");
  });

  test("agrega oro y Brent cuando están disponibles", () => {
    const cards = computeIndicatorInsights(null, null, [gold, brent]);
    const g = byId(cards, "indicator-gold");
    assert.equal(g.value, "US$ 3.000,50");
    assert.equal(g.subtitle, "+1.25% · últimas 24h");
    assert.equal(g.sentiment, "positive");
    const b = byId(cards, "indicator-brent");
    assert.equal(b.subtitle, "-0.50% · últimas 24h");
    assert.equal(b.sentiment, "negative");
  });

  test("no inventa oro ni Brent si no vienen en la lista", () => {
    const cards = computeIndicatorInsights(null, null, []);
    assert.ok(!ids(cards).includes("indicator-gold"));
    assert.ok(!ids(cards).includes("indicator-brent"));
  });
});

describe("computeWalletInsights", () => {
  test("lista vacía devuelve fallback", () => {
    assert.deepEqual(ids(computeWalletInsights([])), ["wallets-empty"]);
  });

  test("elige la más barata para comprar y la más alta para vender", () => {
    const cards = computeWalletInsights([
      makeDollar("belo", 1380, 1400, null),
      makeDollar("lemoncash", 1395, 1410, null),
    ]);
    assert.equal(byId(cards, "wallet-cheapest").value, CASA_LABELS.belo);
    assert.equal(byId(cards, "wallet-cheapest").subtitle, "Cotización: $ 1.380,00");
    assert.equal(byId(cards, "wallet-expensive").value, CASA_LABELS.lemoncash);
    assert.equal(byId(cards, "wallet-expensive").subtitle, "Cotización: $ 1.410,00");
  });

  test("genera la card de spread cuando hay compra y venta", () => {
    const cards = computeWalletInsights([makeDollar("belo", 1380, 1400, null)]);
    assert.ok(ids(cards).includes("wallet-spread"));
  });

  test("spread: elige el menor (venta - compra) y lo muestra positivo", () => {
    const cards = computeWalletInsights([
      makeDollar("belo", 1380, 1400, null), // spread 20
      makeDollar("lemoncash", 1395, 1410, null), // spread 15
    ]);
    const spread = byId(cards, "wallet-spread");
    assert.equal(spread.value, CASA_LABELS.lemoncash);
    assert.equal(spread.subtitle, "Dif. Compra-Venta: $ 15,00 (1,1%)");
    assert.doesNotMatch(spread.subtitle ?? "", /[-−]\d|\$ [-−]|\(-/);
  });

  test("billeteras sin cotización devuelven fallback", () => {
    assert.deepEqual(ids(computeWalletInsights([makeDollar("belo", 0, 0, null)])), ["wallets-empty"]);
  });
});

describe("computeStockInsights", () => {
  test("sin acciones o sin variaciones devuelve fallback", () => {
    assert.deepEqual(ids(computeStockInsights([])), ["stocks-empty"]);
    assert.deepEqual(ids(computeStockInsights([makeStock("GGAL.BA", null)])), ["stocks-none"]);
  });

  test("identifica la mejor, la peor y el sentimiento del panel", () => {
    const cards = computeStockInsights([
      makeStock("GGAL.BA", 3.2, 5000),
      makeStock("YPFD.BA", -4.1),
      makeStock("PAMP.BA", 1.1),
    ]);
    const top = byId(cards, "stock-top");
    assert.equal(top.value, "GGAL");
    assert.equal(top.changePercent, 3.2);
    assert.equal(top.rank, 1);
    assert.equal(top.size, "featured");
    assert.equal(byId(cards, "stock-worst").value, "YPFD");
    assert.equal(byId(cards, "stock-sentiment").value, "Alcista");
    assert.equal(byId(cards, "stock-sentiment").subtitle, "2 de 3 acciones al alza");
  });

  test("sin subas no hay card de mejor rendimiento y el panel es bajista", () => {
    const cards = computeStockInsights([makeStock("GGAL.BA", -1), makeStock("YPFD.BA", -2)]);
    assert.ok(!ids(cards).includes("stock-top"));
    assert.equal(byId(cards, "stock-sentiment").value, "Bajista");
  });

  test("ignora acciones con variación nula en el conteo", () => {
    const cards = computeStockInsights([makeStock("GGAL.BA", 1), makeStock("YPFD.BA", null)]);
    assert.equal(byId(cards, "stock-sentiment").subtitle, "1 de 1 acciones al alza");
  });
});

describe("generateNarrative", () => {
  test("sin cards o con fallback devuelve el mensaje genérico", () => {
    const msg = "No hay suficientes datos para generar un resumen.";
    assert.equal(generateNarrative("dollars", []), msg);
    assert.equal(generateNarrative("dollars", computeDollarInsights([])), msg);
    assert.equal(generateNarrative("crypto", computeCryptoInsights({})), msg);
  });

  test("dólares: menciona brecha, suba y caída", () => {
    const cards = computeDollarInsights([
      makeDollar("oficial", 1290, 1300, -1),
      makeDollar("blue", 1390, 1430, 2),
    ]);
    assert.equal(
      generateNarrative("dollars", cards),
      `La brecha Blue–Oficial se ubica en 10.0%. ${CASA_LABELS.blue} lidera las subidas. ${CASA_LABELS.oficial} registra la mayor caída.`,
    );
  });

  test("cripto: dirección según el sentimiento", () => {
    const rate = (variacion: number): CryptoRate => ({ valor: 100, variacion, fecha: "2026-03-16" });
    assert.equal(
      generateNarrative("crypto", computeCryptoInsights({ btc: rate(3), eth: rate(1) })),
      "Mercado crypto con tendencia alcista. Bitcoin (BTC) es el mejor activo del día.",
    );
  });

  test("acciones: menciona tendencia y líder", () => {
    const cards = computeStockInsights([makeStock("GGAL.BA", 3), makeStock("YPFD.BA", 1)]);
    assert.equal(
      generateNarrative("stocks", cards),
      "Panel de acciones con tendencia alcista. GGAL lidera las subidas del día.",
    );
  });

  test("indicadores: menciona riesgo país e inflación", () => {
    const cards = computeIndicatorInsights({ fecha: "2026-03-16", valor: 574 }, { fecha: "2026-02-28", valor: 2.5 }, []);
    assert.equal(generateNarrative("indicators", cards), "Riesgo País en 574 pts, inflación mensual en +2,5%.");
  });
});

describe("computeInsightOfTheDay", () => {
  const card = (id: string, changePercent?: number): InsightCard => ({
    id,
    label: id,
    value: "v",
    sentiment: "neutral",
    size: "normal",
    changePercent,
  });

  test("sin cards devuelve null", () => {
    assert.equal(computeInsightOfTheDay([]), null);
    assert.equal(computeInsightOfTheDay([card("x-empty")]), null);
  });

  test("elige la card con mayor variación absoluta y la reetiqueta", () => {
    const result = computeInsightOfTheDay([card("a", 1), card("b", -5), card("c", 3)]);
    assert.ok(result);
    assert.equal(result.id, "insight-of-the-day");
    assert.equal(result.label, "Insight del Día");
    assert.equal(result.originalLabel, "b");
    assert.equal(result.size, "featured");
    assert.equal(result.changePercent, -5);
  });

  test("excluye la inflación mensual aunque tenga el mayor valor", () => {
    const result = computeInsightOfTheDay([card("indicator-inflacion", 50), card("a", 1)]);
    assert.equal(result?.originalLabel, "a");
  });

  test("sin variaciones usa la primera card válida", () => {
    const result = computeInsightOfTheDay([card("a"), card("b")]);
    assert.equal(result?.originalLabel, "a");
  });

  test("ignora variaciones no finitas", () => {
    const result = computeInsightOfTheDay([card("a", Number.NaN), card("b", 2)]);
    assert.equal(result?.originalLabel, "b");
  });

  test("no muta la card original", () => {
    const original = card("a", 1);
    computeInsightOfTheDay([original]);
    assert.equal(original.id, "a");
  });
});
