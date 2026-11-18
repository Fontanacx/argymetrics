// Fábricas de datos de prueba tipadas (sin red, sin `any`).
import type {
  BriefingInput,
  DollarCasa,
  DollarRate,
  DollarWithHistory,
  StockData,
} from "@/lib/types";

export function makeRate(
  casa: DollarCasa,
  compra: number,
  venta: number,
  fechaActualizacion = "2026-03-16T12:00:00.000Z",
): DollarRate {
  return { moneda: "USD", casa, nombre: casa, compra, venta, fechaActualizacion };
}

export function makeDollar(
  casa: DollarCasa,
  compra: number,
  venta: number,
  variacion: number | null,
  historyLength = 10,
): DollarWithHistory {
  return {
    rate: makeRate(casa, compra, venta),
    history: Array.from({ length: historyLength }, (_, i) => ({
      fecha: `2026-03-${String(i + 1).padStart(2, "0")}`,
      compra,
      venta: venta + i,
    })),
    variacion,
  };
}

export function makeStock(symbol: string, variation: number | null, price = 1000): StockData {
  return {
    symbol,
    name: symbol,
    price,
    variation,
    high: price,
    low: price,
    volume: 0,
    history: Array.from({ length: 10 }, (_, i) => ({
      fecha: `2026-03-${String(i + 1).padStart(2, "0")}`,
      valor: price + i,
    })),
    updatedAt: "2026-03-16T12:00:00.000Z",
  };
}

export function makeBriefing(overrides: Partial<BriefingInput> = {}): BriefingInput {
  return {
    date: "lunes 16 de marzo de 2026",
    blue: { value: 1400, variation: 0 },
    oficial: { value: 1300, variation: 0 },
    mep: { value: 1350, variation: 0 },
    ccl: { value: 1360, variation: 0 },
    cripto: { value: 1390, variation: 0 },
    brechaBlueOficial: 7.7,
    brechaBlueYesterday: 7.7,
    riesgoPais: { value: 600, weeklyChange: null },
    inflacion: { value: 2.5, date: "febrero 2026" },
    gold: { value: 3000, variation: 0 },
    brent: { value: 70, variation: 0 },
    stocks: [],
    stocksEnVerde: 5,
    stocksEnRojo: 5,
    mep7dAverage: null,
    btc: { value: 90000, variation: 0 },
    eth: { value: 3000, variation: 0 },
    wallets: [],
    ...overrides,
  };
}
