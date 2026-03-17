import type { RiesgoPais, InflacionMensual, BandaCambiaria, BandaHistoryEntry } from "../types";
import {
  ARGENTINADATOS_BASE,
  CRIPTOYA_RP,
  REVALIDATE_RIESGO_PAIS,
  REVALIDATE_INFLACION,
  BANDAS,
} from "../constants";

// ---------------------------------------------------------------------------
// CriptoYa raw response (internal — not exported)
// ---------------------------------------------------------------------------

interface CriptoYaRPResponse {
  valor: number;
  time: number; // Unix timestamp in seconds
}

// ---------------------------------------------------------------------------
// Riesgo Pais
// ---------------------------------------------------------------------------

/**
 * Fetches the latest country risk (EMBI) value.
 *
 * Primary: CriptoYa `/riesgo-pais` — updates every ~5 minutes.
 * Fallback: ArgentinaDatos `/v1/finanzas/indices/riesgo-pais/ultimo` — may be
 * 24-48 hours stale but is reliable as a fallback.
 *
 * @returns The latest RiesgoPais entry, or `null` on complete failure.
 */
export async function fetchRiesgoPais(): Promise<RiesgoPais | null> {
  // 1. Primary: CriptoYa (real-time, ~5 min cadence)
  try {
    const res = await fetch(CRIPTOYA_RP, {
      next: { revalidate: REVALIDATE_RIESGO_PAIS },
    });

    if (res.ok) {
      const data: unknown = await res.json();

      if (
        data !== null &&
        typeof data === "object" &&
        "valor" in data &&
        "time" in data &&
        typeof (data as CriptoYaRPResponse).valor === "number" &&
        typeof (data as CriptoYaRPResponse).time === "number"
      ) {
        const { valor, time } = data as CriptoYaRPResponse;
        return {
          valor,
          fecha: new Date(time * 1000).toISOString(),
          source: "criptoya",
        };
      }

      console.warn("[fetchRiesgoPais] CriptoYa response shape unexpected:", data);
    } else {
      console.warn(`[fetchRiesgoPais] CriptoYa HTTP ${res.status}, falling back to ArgentinaDatos`);
    }
  } catch (primaryError) {
    console.warn("[fetchRiesgoPais] CriptoYa fetch failed, falling back to ArgentinaDatos:", primaryError);
  }

  // 2. Fallback: ArgentinaDatos (may be stale by 24-48 h)
  try {
    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/finanzas/indices/riesgo-pais/ultimo`,
      { next: { revalidate: REVALIDATE_RIESGO_PAIS } }
    );

    if (!res.ok) {
      console.error(`[fetchRiesgoPais] ArgentinaDatos HTTP ${res.status}`);
      return null;
    }

    const data: unknown = await res.json();

    if (
      data !== null &&
      typeof data === "object" &&
      "valor" in data &&
      "fecha" in data &&
      typeof (data as RiesgoPais).valor === "number" &&
      typeof (data as RiesgoPais).fecha === "string"
    ) {
      return { ...(data as RiesgoPais), source: "argentinadatos" };
    }

    console.error("[fetchRiesgoPais] ArgentinaDatos unexpected shape:", data);
    return null;
  } catch (fallbackError) {
    console.error("[fetchRiesgoPais] ArgentinaDatos network error:", fallbackError);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Inflacion (latest monthly value)
// ---------------------------------------------------------------------------

/**
 * Fetches the monthly inflation (IPC) history from ArgentinaDatos and
 * returns only the most recent entry.
 *
 * The API returns the full history as an array sorted ascending by date.
 * Each entry has `{ fecha, valor }` where `valor` is the monthly
 * percentage (e.g. 2.9 means 2.9%) and `fecha` is the month-end date
 * (e.g. "2026-01-31" for January 2026).
 *
 * INDEC publishes with approximately a 6-week lag, so the latest entry
 * being 1-2 months behind the current date is expected behavior.
 *
 * Revalidates hourly since inflation data is published once per month.
 *
 * @returns The latest monthly inflation entry, or `null` on failure.
 */
export async function fetchInflacion(): Promise<InflacionMensual | null> {
  try {
    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/finanzas/indices/inflacion`,
      { next: { revalidate: REVALIDATE_INFLACION } }
    );

    if (!res.ok) {
      console.error(`[fetchInflacion] HTTP ${res.status}`);
      return null;
    }

    const data: InflacionMensual[] = await res.json();

    if (!Array.isArray(data) || data.length === 0) return null;

    const latest = data[data.length - 1];

    // Validate expected shape
    if (typeof latest?.valor !== "number") return null;

    return latest;
  } catch (error) {
    console.error("[fetchInflacion] Network error:", error);
    return null;
  }
}

/**
 * Fetches the full monthly inflation history from ArgentinaDatos.
 *
 * Returns all available entries sorted ascending by date. Each entry
 * has `{ fecha, valor }` where valor is the monthly percentage.
 *
 * @returns Array of inflation entries, or empty array on failure.
 */
export async function fetchInflacionHistory(): Promise<InflacionMensual[]> {
  try {
    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/finanzas/indices/inflacion`,
      { next: { revalidate: REVALIDATE_INFLACION } }
    );

    if (!res.ok) {
      console.error(`[fetchInflacionHistory] HTTP ${res.status}`);
      return [];
    }

    const data: InflacionMensual[] = await res.json();

    if (!Array.isArray(data)) return [];

    return data;
  } catch (error) {
    console.error("[fetchInflacionHistory] Network error:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Bandas cambiarias (static BCRA-published values)
// ---------------------------------------------------------------------------

/**
 * Returns the current crawling-band floor and ceiling for USD/ARS.
 *
 * These are static values sourced from the BCRA. The dynamic computation
 * was removed because the BCRA no longer follows a fixed interpolation
 * formula. Values in `BANDAS` constant should be updated when the BCRA
 * publishes new band parameters.
 *
 * @returns The current floor, ceiling, and last-update date.
 */
export function getBandas(): BandaCambiaria {
  return {
    piso: BANDAS.piso,
    techo: BANDAS.techo,
    fecha: BANDAS.fechaActualizacion,
  };
}

// ---------------------------------------------------------------------------
// Historical Bandas (Mock implementation)
// ---------------------------------------------------------------------------

/**
 * Generates a mock 6-month historical dataset for the Bandas Cambiarias.
 * Since there is no robust public API endpoint for historical band values,
 * we simulate the 1% monthly widening (crawling peg) going backwards from
 * the current BANDAS values.
 *
 * @returns Array of historical band entries.
 */
export async function fetchBandasHistory(): Promise<BandaHistoryEntry[]> {
  const history: BandaHistoryEntry[] = [];
  const DAYS = 180; // 6 months

  // Roughly 1% monthly growth = daily decay going backwards
  // (1.01)^(1/30) = ~1.00033 growth => backwards decay is 1/1.00033 ~ 0.99966
  const dailyDecay = Math.pow(1.01, -1 / 30);

  let currentPiso = BANDAS.piso;
  let currentTecho = BANDAS.techo;
  // Official rate typically sits closer to the floor in recent months
  let currentOficial = currentPiso + (currentTecho - currentPiso) * 0.15;

  const today = new Date();

  // Generate backwards
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    history.unshift({
      fecha: d.toISOString().split("T")[0],
      piso: Number(currentPiso.toFixed(2)),
      techo: Number(currentTecho.toFixed(2)),
      oficial: Number(currentOficial.toFixed(2)),
    });

    currentPiso *= dailyDecay;
    currentTecho *= dailyDecay;
    
    // Add small random walk to official, scaled to decay
    const noise = (Math.random() - 0.5) * 5; 
    currentOficial = (currentOficial + noise) * dailyDecay;
  }

  return history;
}
