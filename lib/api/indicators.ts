import type { RiesgoPais, InflacionMensual, BandaCambiaria, BandaHistoryEntry, ReservasBCRA, ReservasHistoryEntry } from "../types";
import {
  AMBITO_BASE,
  ARGENTINADATOS_BASE,
  BCRA_BASE,
  REVALIDATE_RIESGO_PAIS,
  REVALIDATE_INFLACION,
  REVALIDATE_RESERVAS,
} from "@/lib/constants";
import { computeBandasAt, todayBuenosAiresISO } from "@/lib/utils/bandas";

// ---------------------------------------------------------------------------
// Riesgo Pais
// ---------------------------------------------------------------------------

/**
 * Obtiene el último valor del riesgo país (EMBI+ Argentina) desde Ámbito.
 *
 * Fuente: Ámbito `/riesgopais/variacion`, que devuelve el valor del mismo día
 * (intradía durante la rueda). ArgentinaDatos publica con ~3 días de atraso,
 * por eso Ámbito se usa como fuente primaria del valor actual.
 *
 * La respuesta es del tipo:
 *   `{ "ultimo": "408", "fecha": "06-07-2026", "variacion": "-1,69%", ... }`
 * con valores en formato español (coma decimal, fecha `DD-MM-YYYY`), por lo que
 * hay que normalizarlos antes de mapear al tipo `RiesgoPais`.
 *
 * Endpoint no oficial de un medio: puede cambiar o bloquearse sin aviso. Ante
 * cualquier falla se cae a ArgentinaDatos vía `fetchRiesgoPais`.
 *
 * @returns El último dato de RiesgoPais, o `null` si falla la consulta.
 */
async function fetchRiesgoPaisAmbito(): Promise<RiesgoPais | null> {
  try {
    const res = await fetch(`${AMBITO_BASE}/riesgopais/variacion`, {
      next: { revalidate: REVALIDATE_RIESGO_PAIS },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ArgyMetrics/1.0)" },
    });

    if (!res.ok) {
      console.error(`[fetchRiesgoPaisAmbito] HTTP ${res.status}`);
      return null;
    }

    const data: unknown = await res.json();

    if (
      data === null ||
      typeof data !== "object" ||
      !("ultimo" in data) ||
      !("fecha" in data) ||
      typeof (data as { ultimo: unknown }).ultimo !== "string" ||
      typeof (data as { fecha: unknown }).fecha !== "string"
    ) {
      console.error("[fetchRiesgoPaisAmbito] Formato inesperado:", data);
      return null;
    }

    const { ultimo, fecha } = data as { ultimo: string; fecha: string };

    // "408" / "1.234,5" (es-AR) → number. Quita separador de miles y usa punto decimal.
    const valor = Number(ultimo.replace(/\./g, "").replace(",", "."));

    // "DD-MM-YYYY" → "YYYY-MM-DD" (ISO)
    const parts = fecha.split("-");
    if (!Number.isFinite(valor) || valor <= 0 || parts.length !== 3) {
      console.error("[fetchRiesgoPaisAmbito] Valor o fecha inválidos:", data);
      return null;
    }
    const fechaISO = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;

    // Variación diaria opcional: "-1,69%" → -1.69 (null si falta o es inválida).
    let variacion: number | null = null;
    if ("variacion" in data && typeof (data as { variacion: unknown }).variacion === "string") {
      const parsed = Number(
        (data as { variacion: string }).variacion.replace("%", "").replace(",", ".").trim()
      );
      variacion = Number.isFinite(parsed) ? parsed : null;
    }

    return { valor, fecha: fechaISO, variacion };
  } catch (error) {
    console.error("[fetchRiesgoPaisAmbito] Error de red:", error);
    return null;
  }
}

/**
 * Obtiene el último valor del riesgo país (EMBI+ Argentina) desde ArgentinaDatos.
 *
 * Fuente: ArgentinaDatos `/v1/finanzas/indices/riesgo-pais/ultimo`.
 * Se usa como fallback de `fetchRiesgoPaisAmbito` porque, si bien es estable,
 * publica con varios días de atraso.
 *
 * @returns El último dato de RiesgoPais, o `null` si falla la consulta.
 */
async function fetchRiesgoPaisArgentinaDatos(): Promise<RiesgoPais | null> {
  try {
    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/finanzas/indices/riesgo-pais/ultimo`,
      { next: { revalidate: REVALIDATE_RIESGO_PAIS } }
    );

    if (!res.ok) {
      console.error(`[fetchRiesgoPaisArgentinaDatos] HTTP ${res.status}`);
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
      return data as RiesgoPais;
    }

    console.error("[fetchRiesgoPaisArgentinaDatos] Respuesta con formato inesperado:", data);
    return null;
  } catch (error) {
    console.error("[fetchRiesgoPaisArgentinaDatos] Error de red:", error);
    return null;
  }
}

/**
 * Obtiene el último valor del riesgo país (EMBI+ Argentina).
 *
 * Estrategia híbrida para maximizar frescura sin perder resiliencia:
 *   1. Ámbito (valor del mismo día / intradía).
 *   2. ArgentinaDatos como fallback (estable pero con ~3 días de atraso).
 *   3. `null` si ambas fuentes fallan.
 *
 * El histórico se sigue tomando de ArgentinaDatos vía `fetchRiesgoPaisHistory`,
 * ya que Ámbito bloquea su endpoint histórico.
 *
 * @returns El último dato de RiesgoPais, o `null` si todas las fuentes fallan.
 */
export async function fetchRiesgoPais(): Promise<RiesgoPais | null> {
  return (await fetchRiesgoPaisAmbito()) ?? (await fetchRiesgoPaisArgentinaDatos());
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
// Bandas cambiarias (crawling band proyectado desde el ancla del BCRA)
// ---------------------------------------------------------------------------

/**
 * Devuelve el piso y el techo de la banda cambiaria USD/ARS vigentes hoy.
 *
 * El BCRA definió un crawling band determinístico (piso −1% / techo +1% por
 * mes). En vez de devolver el valor estático del ancla —que queda obsoleto a
 * los pocos días— proyectamos el ancla (`BANDAS`) hasta la fecha actual de
 * Buenos Aires con `computeBandasAt()`. Así la banda se mantiene al día sola y
 * solo hay que tocar el ancla cuando el BCRA cambia el esquema.
 *
 * @returns El piso y techo proyectados a hoy, con la fecha (BRT) del cálculo.
 */
export function getBandas(): BandaCambiaria {
  const hoy = todayBuenosAiresISO();
  const { piso, techo } = computeBandasAt(hoy);
  return { piso, techo, fecha: hoy };
}

// ---------------------------------------------------------------------------
// Historical Bandas (proyección determinística)
// ---------------------------------------------------------------------------

/**
 * Genera un dataset histórico determinístico de 6 meses para las bandas.
 *
 * No hay un endpoint público robusto para el histórico de la banda, así que lo
 * proyectamos con la misma fórmula que la tarjeta (`computeBandasAt`), de modo
 * que el último punto del gráfico coincide siempre con el indicador. La línea
 * "oficial" se ubica de forma determinística al 15% del ancho de la banda desde
 * el piso, para que las respuestas cacheadas por ISR sean reproducibles.
 *
 * @returns Array de entradas históricas, ordenadas ascendente por fecha.
 */
export async function fetchBandasHistory(): Promise<BandaHistoryEntry[]> {
  const history: BandaHistoryEntry[] = [];
  const DAYS = 180; // 6 meses

  // Fecha actual en Buenos Aires, para que la entrada "hoy" coincida con el día argentino.
  const todayISO = todayBuenosAiresISO();
  const todayMs = Date.parse(`${todayISO}T00:00:00Z`);

  // Generamos hacia atrás, proyectando cada día con la misma fórmula del ancla.
  for (let i = 0; i < DAYS; i++) {
    const fecha = new Date(todayMs - i * 86_400_000).toISOString().split("T")[0];
    const { piso, techo } = computeBandasAt(fecha);

    // La oficial se ubica determinísticamente al 15% desde el piso.
    const oficial = piso + (techo - piso) * 0.15;

    history.unshift({
      fecha,
      piso,
      techo,
      oficial: Number(oficial.toFixed(2)),
    });
  }

  return history;
}

// ---------------------------------------------------------------------------
// Reservas Internacionales del BCRA
// ---------------------------------------------------------------------------

/**
 * Obtiene el último valor de las Reservas Internacionales del BCRA desde la
 * API oficial de Estadísticas Monetarias (v4.0).
 *
 * Endpoint: `/estadisticas/v4.0/monetarias/1`
 * - idVariable = 1 → "Reservas internacionales" en millones de USD.
 * - No requiere autenticación.
 * - `results[0].detalle` está ordenado del más reciente al más antiguo.
 * - `detalle[0]` es el último valor disponible; se calcula la variación
 *   diaria porcentual contra `detalle[1]`.
 *
 * @returns El último dato de ReservasBCRA, o `null` si falla la consulta.
 */
export async function fetchReservas(): Promise<ReservasBCRA | null> {
  try {
    const res = await fetch(`${BCRA_BASE}/estadisticas/v4.0/monetarias/1`, {
      next: { revalidate: REVALIDATE_RESERVAS },
    });

    if (!res.ok) {
      console.error(`[fetchReservas] HTTP ${res.status}`);
      return null;
    }

    const body: unknown = await res.json();

    if (
      body === null ||
      typeof body !== "object" ||
      !("status" in body) ||
      !("results" in body)
    ) {
      console.error("[fetchReservas] Formato inesperado:", body);
      return null;
    }

    const { status, results } = body as { status: number; results: unknown };

    if (status !== 200 || !Array.isArray(results) || results.length === 0) {
      console.error("[fetchReservas] status o results inválidos:", status);
      return null;
    }

    const first = results[0] as Record<string, unknown>;
    const detalle = first?.detalle;

    if (!Array.isArray(detalle) || detalle.length === 0) {
      console.error("[fetchReservas] detalle vacío o no es array");
      return null;
    }

    const latest = detalle[0] as { fecha?: unknown; valor?: unknown };

    if (
      typeof latest.fecha !== "string" ||
      typeof latest.valor !== "number"
    ) {
      console.error("[fetchReservas] entrada inválida:", latest);
      return null;
    }

    // Variación diaria % contra el día anterior
    let variacion: number | null = null;
    if (detalle.length >= 2) {
      const prev = detalle[1] as { valor?: unknown };
      if (typeof prev.valor === "number" && prev.valor !== 0) {
        variacion = ((latest.valor - prev.valor) / prev.valor) * 100;
      }
    }

    return { fecha: latest.fecha, valor: latest.valor, variacion };
  } catch (error) {
    console.error("[fetchReservas] Error de red:", error);
    return null;
  }
}

/**
 * Obtiene el histórico completo de las Reservas Internacionales del BCRA.
 *
 * Usa el mismo endpoint que `fetchReservas` y transforma `results[0].detalle`
 * a un array ascendente por fecha (la API lo devuelve descendente).
 *
 * @returns Array de entradas históricas ordenadas ascendentemente, o `[]` si falla.
 */
export async function fetchReservasHistory(): Promise<ReservasHistoryEntry[]> {
  try {
    const res = await fetch(`${BCRA_BASE}/estadisticas/v4.0/monetarias/1`, {
      next: { revalidate: REVALIDATE_RESERVAS },
    });

    if (!res.ok) {
      console.error(`[fetchReservasHistory] HTTP ${res.status}`);
      return [];
    }

    const body: unknown = await res.json();

    if (
      body === null ||
      typeof body !== "object" ||
      !("status" in body) ||
      !("results" in body)
    ) {
      console.error("[fetchReservasHistory] Formato inesperado:", body);
      return [];
    }

    const { status, results } = body as { status: number; results: unknown };

    if (status !== 200 || !Array.isArray(results) || results.length === 0) {
      return [];
    }

    const first = results[0] as Record<string, unknown>;
    const detalle = first?.detalle;

    if (!Array.isArray(detalle) || detalle.length === 0) return [];

    // La API devuelve descendente (más reciente primero). Invertir para ascendente.
    const entries: ReservasHistoryEntry[] = [];

    for (let i = detalle.length - 1; i >= 0; i--) {
      const item = detalle[i] as { fecha?: unknown; valor?: unknown };
      if (typeof item.fecha === "string" && typeof item.valor === "number") {
        entries.push({ fecha: item.fecha, valor: item.valor });
      }
    }

    return entries;
  } catch (error) {
    console.error("[fetchReservasHistory] Error de red:", error);
    return [];
  }
}
