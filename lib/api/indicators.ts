import type {
  RiesgoPais,
  InflacionMensual,
  BandaCambiaria,
  BandaHistoryEntry,
  BcraSeriesPoint,
  ReservasBCRA,
  ReservasHistoryEntry,
} from "../types";
import {
  AMBITO_BASE,
  ARGENTINADATOS_BASE,
  BCRA_BASE,
  BCRA_SERIES,
  REVALIDATE_BANDAS,
  REVALIDATE_RIESGO_PAIS,
  REVALIDATE_INFLACION,
  REVALIDATE_RESERVAS,
} from "@/lib/constants";
import { computeBandasAt, todayBuenosAiresISO } from "@/lib/utils/bandas";
import { fetchIpcNacional, fetchIpcNacionalHistory } from "./indec";
import {
  isFiniteNumber,
  isRecord,
  parseInflacionHistory,
  parseInflacionMensual,
} from "./guards";

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

    if (!isRecord(data) || typeof data.ultimo !== "string" || typeof data.fecha !== "string") {
      console.error("[fetchRiesgoPaisAmbito] Formato inesperado:", data);
      return null;
    }

    const { ultimo, fecha } = data;

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
    if (typeof data.variacion === "string") {
      const parsed = Number(data.variacion.replace("%", "").replace(",", ".").trim());
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

    if (isRecord(data) && isFiniteNumber(data.valor) && typeof data.fecha === "string") {
      return { valor: data.valor, fecha: data.fecha };
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
 * Fallback: fetches the monthly inflation (IPC) history from ArgentinaDatos.
 *
 * Used only when the official INDEC API is unavailable or the token is not
 * configured. ArgentinaDatos returns the full history as an array sorted
 * ascending by date, with `{ fecha, valor }` entries.
 *
 * @returns The latest monthly inflation entry, or `null` on failure.
 */
async function fetchInflacionArgentinaDatos(): Promise<InflacionMensual | null> {
  try {
    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/finanzas/indices/inflacion`,
      { next: { revalidate: REVALIDATE_INFLACION } }
    );

    if (!res.ok) {
      console.error(`[fetchInflacionArgentinaDatos] HTTP ${res.status}`);
      return null;
    }

    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    // Validate the latest entry's shape
    return parseInflacionMensual(data[data.length - 1]);
  } catch (error) {
    console.error("[fetchInflacionArgentinaDatos] Network error:", error);
    return null;
  }
}

/**
 * Fallback: fetches the full monthly inflation history from ArgentinaDatos.
 *
 * @returns Array of inflation entries, or empty array on failure.
 */
async function fetchInflacionHistoryArgentinaDatos(): Promise<InflacionMensual[]> {
  try {
    const res = await fetch(
      `${ARGENTINADATOS_BASE}/v1/finanzas/indices/inflacion`,
      { next: { revalidate: REVALIDATE_INFLACION } }
    );

    if (!res.ok) {
      console.error(`[fetchInflacionHistoryArgentinaDatos] HTTP ${res.status}`);
      return [];
    }

    const data: unknown = await res.json();

    return parseInflacionHistory(data);
  } catch (error) {
    console.error("[fetchInflacionHistoryArgentinaDatos] Network error:", error);
    return [];
  }
}

/**
 * Fetches the latest monthly inflation (IPC) entry.
 *
 * Primary source: official INDEC API (`ipc_nacional`), which also exposes
 * interannual and accumulated variations. Falls back to ArgentinaDatos when
 * INDEC fails or `INDEC_API_TOKEN` is missing.
 *
 * INDEC publishes with approximately a 6-week lag, so the latest entry being
 * 1-2 months behind the current date is expected behavior.
 *
 * @returns The latest monthly inflation entry, or `null` on failure.
 */
export async function fetchInflacion(): Promise<InflacionMensual | null> {
  const indec = await fetchIpcNacional();
  if (indec) return indec;
  return fetchInflacionArgentinaDatos();
}

/**
 * Fetches the full monthly inflation history.
 *
 * Primary source: official INDEC API. Falls back to ArgentinaDatos when INDEC
 * fails or `INDEC_API_TOKEN` is missing.
 *
 * @returns Array of inflation entries sorted ascending by date, or `[]`.
 */
export async function fetchInflacionHistory(): Promise<InflacionMensual[]> {
  const indec = await fetchIpcNacionalHistory();
  if (indec.length > 0) return indec;
  return fetchInflacionHistoryArgentinaDatos();
}

// ---------------------------------------------------------------------------
// Bandas cambiarias (series oficiales del BCRA, con proyección de respaldo)
// ---------------------------------------------------------------------------

const BANDAS_HISTORY_DAYS = 180; // 6 meses

/** Resta `days` días a una fecha ISO `YYYY-MM-DD`. */
function isoDaysAgo(fromISO: string, days: number): string {
  const ms = Date.parse(`${fromISO}T00:00:00Z`) - days * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Descarga una serie diaria de la API de Estadísticas Monetarias v4.0 del BCRA
 * entre `desde` y `hasta` (inclusive).
 *
 * @returns Puntos válidos ordenados ascendente por fecha, o `[]` si falla.
 */
async function fetchBcraSeries(
  id: number,
  desde: string,
  hasta: string,
  revalidate: number
): Promise<BcraSeriesPoint[]> {
  try {
    const url = `${BCRA_BASE}/estadisticas/v4.0/monetarias/${id}?desde=${desde}&hasta=${hasta}&limit=1000`;
    const res = await fetch(url, { next: { revalidate } });

    if (!res.ok) {
      console.error(`[fetchBcraSeries] HTTP ${res.status} (serie ${id})`);
      return [];
    }

    const body: unknown = await res.json();
    if (!isRecord(body) || body.status !== 200 || !Array.isArray(body.results)) return [];

    const first: unknown = body.results[0];
    const detalle = isRecord(first) ? first.detalle : undefined;
    if (!Array.isArray(detalle)) return [];

    const points: BcraSeriesPoint[] = [];
    for (const item of detalle) {
      if (isRecord(item) && typeof item.fecha === "string" && isFiniteNumber(item.valor) && item.valor > 0) {
        points.push({ fecha: item.fecha, valor: item.valor });
      }
    }

    // La API devuelve descendente (más reciente primero).
    return points.sort((a, b) => a.fecha.localeCompare(b.fecha));
  } catch (error) {
    console.error(`[fetchBcraSeries] Error de red (serie ${id}):`, error);
    return [];
  }
}

/** Indexa una serie por fecha. */
function toDateMap(points: BcraSeriesPoint[]): Map<string, number> {
  return new Map(points.map((p) => [p.fecha, p.valor]));
}

/** Banda proyectada a hoy desde el ancla local (respaldo si el BCRA no responde). */
function projectedBandas(): BandaCambiaria {
  const hoy = todayBuenosAiresISO();
  const { piso, techo } = computeBandasAt(hoy);
  return { piso, techo, fecha: hoy, fuente: "proyeccion" };
}

/**
 * Devuelve el piso y el techo vigentes de la banda cambiaria USD/ARS.
 *
 * Fuente primaria: series oficiales del BCRA (límite inferior 1187 y superior
 * 1188). Desde 2026 las bandas se ajustan por el IPC mensual (t-2), así que no
 * se pueden calcular con una fórmula fija; si la API falla se usa la
 * proyección desde el ancla `BANDAS`, marcada con `fuente: "proyeccion"`.
 */
export async function fetchBandas(): Promise<BandaCambiaria> {
  const hasta = todayBuenosAiresISO();
  const desde = isoDaysAgo(hasta, 14); // margen por fines de semana y feriados

  const [pisos, techos] = await Promise.all([
    fetchBcraSeries(BCRA_SERIES.bandaPiso, desde, hasta, REVALIDATE_BANDAS),
    fetchBcraSeries(BCRA_SERIES.bandaTecho, desde, hasta, REVALIDATE_BANDAS),
  ]);

  const techoByDate = toDateMap(techos);

  // Última fecha presente en ambas series.
  for (let i = pisos.length - 1; i >= 0; i--) {
    const { fecha, valor: piso } = pisos[i];
    const techo = techoByDate.get(fecha);
    if (techo !== undefined && piso < techo) {
      return { piso, techo, fecha, fuente: "bcra" };
    }
  }

  console.error("[fetchBandas] Series del BCRA no disponibles; usando proyección de respaldo");
  return projectedBandas();
}

/**
 * Histórico de 6 meses de la banda cambiaria con el tipo de cambio mayorista
 * de referencia (Com. A 3500), todo desde las series oficiales del BCRA.
 *
 * Si las series de la banda no están disponibles, se proyecta desde el ancla
 * local y se omite la línea del mayorista (no se inventa un valor).
 *
 * @returns Entradas ordenadas ascendente por fecha.
 */
export async function fetchBandasHistory(): Promise<BandaHistoryEntry[]> {
  const hasta = todayBuenosAiresISO();
  const desde = isoDaysAgo(hasta, BANDAS_HISTORY_DAYS);

  const [pisos, techos, mayorista] = await Promise.all([
    fetchBcraSeries(BCRA_SERIES.bandaPiso, desde, hasta, REVALIDATE_BANDAS),
    fetchBcraSeries(BCRA_SERIES.bandaTecho, desde, hasta, REVALIDATE_BANDAS),
    fetchBcraSeries(BCRA_SERIES.mayorista, desde, hasta, REVALIDATE_BANDAS),
  ]);

  const techoByDate = toDateMap(techos);
  const mayoristaByDate = toDateMap(mayorista);

  const history: BandaHistoryEntry[] = [];
  for (const { fecha, valor: piso } of pisos) {
    const techo = techoByDate.get(fecha);
    if (techo === undefined || piso >= techo) continue;
    const oficial = mayoristaByDate.get(fecha);
    history.push(oficial === undefined ? { fecha, piso, techo } : { fecha, piso, techo, oficial });
  }

  if (history.length > 0) return history;

  // Respaldo: proyección diaria desde el ancla, sin línea de cotización.
  for (let i = BANDAS_HISTORY_DAYS - 1; i >= 0; i--) {
    const fecha = isoDaysAgo(hasta, i);
    history.push({ fecha, ...computeBandasAt(fecha) });
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

    if (!isRecord(body)) {
      console.error("[fetchReservas] Formato inesperado:", body);
      return null;
    }

    const { status, results } = body;

    if (status !== 200 || !Array.isArray(results) || results.length === 0) {
      console.error("[fetchReservas] status o results inválidos:", status);
      return null;
    }

    const first: unknown = results[0];
    const detalle = isRecord(first) ? first.detalle : undefined;

    if (!Array.isArray(detalle) || detalle.length === 0) {
      console.error("[fetchReservas] detalle vacío o no es array");
      return null;
    }

    const latest: unknown = detalle[0];

    if (!isRecord(latest) || typeof latest.fecha !== "string" || !isFiniteNumber(latest.valor)) {
      console.error("[fetchReservas] entrada inválida:", latest);
      return null;
    }

    // Variación diaria % contra el día anterior
    let variacion: number | null = null;
    if (detalle.length >= 2) {
      const prev: unknown = detalle[1];
      if (isRecord(prev) && isFiniteNumber(prev.valor) && prev.valor !== 0) {
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

    if (!isRecord(body)) {
      console.error("[fetchReservasHistory] Formato inesperado:", body);
      return [];
    }

    const { status, results } = body;

    if (status !== 200 || !Array.isArray(results) || results.length === 0) {
      return [];
    }

    const first: unknown = results[0];
    const detalle = isRecord(first) ? first.detalle : undefined;

    if (!Array.isArray(detalle) || detalle.length === 0) return [];

    // La API devuelve descendente (más reciente primero). Invertir para ascendente.
    const entries: ReservasHistoryEntry[] = [];

    for (let i = detalle.length - 1; i >= 0; i--) {
      const item: unknown = detalle[i];
      if (isRecord(item) && typeof item.fecha === "string" && isFiniteNumber(item.valor)) {
        entries.push({ fecha: item.fecha, valor: item.valor });
      }
    }

    return entries;
  } catch (error) {
    console.error("[fetchReservasHistory] Error de red:", error);
    return [];
  }
}
