import type { CriptoYaQuote, DollarWithHistory, DollarRate, DollarCasa } from "../types";
import { CRIPTOYA_BASE, REVALIDATE_WALLETS } from "@/lib/constants";
import { isFiniteNumber, isRecord, readFiniteNumber } from "./guards";

const WALLETS_INFO: { key: string; nombre: string; casa: DollarCasa }[] = [
  { key: "astropay", nombre: "Dólar AstroPay", casa: "astropay" },
  { key: "cocoscrypto", nombre: "Dólar Cocos", casa: "cocos" },
  { key: "lemoncash", nombre: "Dólar Lemon", casa: "lemoncash" },
  { key: "belo", nombre: "Dólar Belo", casa: "belo" },
  { key: "buenbit", nombre: "Dólar Buenbit", casa: "buenbit" },
  { key: "ripio", nombre: "Dólar Ripio", casa: "ripio" },
  { key: "fiwind", nombre: "Dólar Fiwind", casa: "fiwind" },
  { key: "satoshitango", nombre: "Dólar SatoshiTango", casa: "satoshitango" },
  { key: "decrypto", nombre: "Dólar Decrypto", casa: "decrypto" },
  { key: "takenos", nombre: "Dólar Takenos", casa: "takenos" },
  { key: "wallbit", nombre: "Dólar Wallbit", casa: "wallbit" },
];

/** Validates a single CriptoYa exchange quote (`ask`/`bid` > 0, optional `time`). */
function parseCriptoYaQuote(value: unknown): CriptoYaQuote | null {
  if (!isRecord(value)) return null;
  const { ask, bid } = value;
  if (!isFiniteNumber(ask) || !isFiniteNumber(bid) || ask <= 0 || bid <= 0) return null;
  return { ask, bid, time: readFiniteNumber(value, "time") };
}

export async function fetchWalletDollars(): Promise<DollarWithHistory[]> {
  try {
    const res = await fetch(`${CRIPTOYA_BASE}/usdt/ars`, {
      next: { revalidate: REVALIDATE_WALLETS },
    });

    if (!res.ok) {
      console.error(`[fetchWalletDollars] HTTP ${res.status}`);
      return [];
    }

    const data: unknown = await res.json();
    if (!isRecord(data)) {
      console.error("[fetchWalletDollars] unexpected response shape");
      return [];
    }

    const fallbackFecha = new Date().toISOString();
    const results: DollarWithHistory[] = [];

    for (const info of WALLETS_INFO) {
      const quote = parseCriptoYaQuote(data[info.key]);
      if (!quote) continue;

      const rate: DollarRate = {
        moneda: "USD",
        casa: info.casa,
        nombre: info.nombre,
        // ask = exchange sells to user (venta)
        // bid = exchange buys from user (compra)
        compra: quote.bid,
        venta: quote.ask,
        // CriptoYa reports a per-exchange unix timestamp (seconds)
        fechaActualizacion:
          quote.time !== undefined && quote.time > 0
            ? new Date(quote.time * 1000).toISOString()
            : fallbackFecha,
      };

      results.push({
        rate,
        history: [],
        variacion: null, // No historical daily variation readily available
      });
    }

    return results;
  } catch (error) {
    console.error("[fetchWalletDollars] Network error:", error);
    return [];
  }
}
