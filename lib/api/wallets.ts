import type { DollarWithHistory, DollarRate, DollarCasa } from "../types";
import { CRIPTOYA_BASE } from "@/lib/constants";

export async function fetchWalletDollars(): Promise<DollarWithHistory[]> {
  try {
    const res = await fetch(`${CRIPTOYA_BASE}/usdt/ars`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`[fetchWalletDollars] HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    
    const walletsInfo: { key: string; nombre: string; casa: DollarCasa }[] = [
      { key: "astropay", nombre: "Dólar AstroPay", casa: "astropay" },
      { key: "cocoscrypto", nombre: "Dólar Cocos", casa: "cocos" },
      { key: "lemoncash", nombre: "Dólar Lemon", casa: "lemoncash" },
      { key: "belo", nombre: "Dólar Belo", casa: "belo" },
      { key: "buenbit", nombre: "Dólar Buenbit", casa: "buenbit" },
    ];

    const results: DollarWithHistory[] = [];
    const fecha = new Date().toISOString();

    for (const info of walletsInfo) {
      const brokerData = data[info.key];
      if (brokerData) {
        const rate: DollarRate = {
          moneda: "USD",
          casa: info.casa,
          nombre: info.nombre,
          // ask = exchange sells to user (venta)
          // bid = exchange buys from user (compra)
          compra: brokerData.bid,
          venta: brokerData.ask,
          fechaActualizacion: fecha,
        };

        results.push({
          rate,
          history: [],
          variacion: null, // No historical daily variation readily available
        });
      }
    }

    return results;
  } catch (error) {
    console.error("[fetchWalletDollars] Network error:", error);
    return [];
  }
}
