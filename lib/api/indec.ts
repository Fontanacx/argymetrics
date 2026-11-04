import type {
  ActividadEconomica,
  ActividadEconomicaHistoryEntry,
  CanastaBasica,
  CanastaBasicaHistoryEntry,
  InflacionMensual,
  IpcRegional,
  Pobreza,
  PobrezaHistoryEntry,
  SalarioReal,
  SalarioRealHistoryEntry,
} from "../types";
import {
  INDEC_BASE,
  REVALIDATE_INDEC_MONTHLY,
  REVALIDATE_INDEC_SEMESTER,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// INDEC API client
// ---------------------------------------------------------------------------

type IndecRow = Record<string, unknown>;

interface IndecParams {
  [key: string]: string;
}

/**
 * Fetches a list of rows from the INDEC API.
 *
 * The API requires a server-side JWT (`INDEC_API_TOKEN`). It returns at most
 * 1000 rows per request, so every caller must use `select`/filters to keep the
 * payload small. On any failure the function returns `null` so callers can
 * gracefully degrade without breaking SSR.
 */
async function fetchIndecRows(
  path: string,
  params: IndecParams,
  revalidate: number
): Promise<IndecRow[] | null> {
  const token = process.env.INDEC_API_TOKEN;
  if (!token) {
    console.error("[indec] INDEC_API_TOKEN is not configured");
    return null;
  }

  try {
    const url = new URL(`${INDEC_BASE}${path}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[indec] ${path}: HTTP ${res.status}`);
      return null;
    }

    const data: unknown = await res.json();

    if (!Array.isArray(data)) {
      console.error(`[indec] ${path}: unexpected response shape`);
      return null;
    }

    return data.filter(
      (row): row is IndecRow => typeof row === "object" && row !== null
    );
  } catch (error) {
    console.error(`[indec] ${path}: network error`, error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Small parsing helpers
// ---------------------------------------------------------------------------

function readString(row: IndecRow, key: string): string | null {
  const value = row[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readNumber(row: IndecRow, key: string): number | null {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** "YYYYMM" → "YYYY-MM-01" (the first day of the reference month). */
function periodToDate(period: string): string | null {
  if (!/^\d{6}$/.test(period)) return null;
  const year = period.slice(0, 4);
  const month = period.slice(4, 6);
  const monthNumber = Number(month);
  if (monthNumber < 1 || monthNumber > 12) return null;
  return `${year}-${month}-01`;
}

/** "YYYY1S" / "YYYY2S" → last day of the reference semester. */
function semesterToDate(period: string): string | null {
  const match = /^(\d{4})([12])S$/.exec(period);
  if (!match) return null;
  const [, year, semester] = match;
  return semester === "1" ? `${year}-06-30` : `${year}-12-31`;
}

/** Adds (or subtracts) months to a "YYYYMM" period. */
function shiftPeriod(period: string, months: number): string {
  const year = Number(period.slice(0, 4));
  const month = Number(period.slice(4, 6));
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Percentage change between two positive values. */
function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return round2(((current - previous) / previous) * 100);
}

/** Real variation from a nominal variation and its inflation rate. */
function realVariation(nominal: number, inflation: number): number | null {
  const denominator = 1 + inflation / 100;
  if (denominator <= 0) return null;
  return round2(((1 + nominal / 100) / denominator - 1) * 100);
}

// ---------------------------------------------------------------------------
// IPC Nacional
// ---------------------------------------------------------------------------

const IPC_HISTORY_PARAMS: IndecParams = {
  select: "periodo,region,nivel,codigo,descripcion,tipo_de_indicador,valor",
  region: "eq.Nacional",
  nivel: "eq.Nivel General",
  codigo: "eq.0",
  tipo_de_indicador: "in.(v_m,v_ia,v_acum)",
  order: "periodo.asc",
  limit: "1000",
};

/**
 * Full monthly IPC history for the national level.
 *
 * The official INDEC series starts in December 2016. Each entry exposes the
 * monthly variation (`valor`), the interannual variation and the accumulated
 * variation since December of the previous year.
 */
export async function fetchIpcNacionalHistory(): Promise<InflacionMensual[]> {
  const rows = await fetchIndecRows(
    "/ipc_nacional",
    IPC_HISTORY_PARAMS,
    REVALIDATE_INDEC_MONTHLY
  );

  if (!rows) return [];

  const byPeriod = new Map<
    string,
    { valor?: number; interanual?: number; acumulada?: number }
  >();

  for (const row of rows) {
    const period = readString(row, "periodo");
    const type = readString(row, "tipo_de_indicador");
    const value = readNumber(row, "valor");
    if (!period || !type || value === null) continue;

    const entry = byPeriod.get(period) ?? {};
    if (type === "v_m") entry.valor = value;
    else if (type === "v_ia") entry.interanual = value;
    else if (type === "v_acum") entry.acumulada = value;
    byPeriod.set(period, entry);
  }

  const history: InflacionMensual[] = [];

  for (const [period, entry] of byPeriod) {
    if (entry.valor === undefined) continue;
    const fecha = periodToDate(period);
    if (!fecha) continue;

    history.push({
      fecha,
      valor: entry.valor,
      interanual: entry.interanual,
      acumulada: entry.acumulada,
    });
  }

  return history.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Latest national IPC entry. */
export async function fetchIpcNacional(): Promise<InflacionMensual | null> {
  const history = await fetchIpcNacionalHistory();
  return history.length > 0 ? history[history.length - 1] : null;
}

/**
 * Latest IPC by INDEC statistical region.
 *
 * INDEC publishes six regions (GBA, Pampeana, Noreste, Noroeste, Cuyo and
 * Patagonia), not one row per province. "Nacional" is excluded because the
 * headline already comes from `fetchIpcNacional`.
 */
export async function fetchIpcRegional(): Promise<IpcRegional[]> {
  const latestRows = await fetchIndecRows(
    "/ipc_nacional",
    { select: "periodo", order: "periodo.desc", limit: "1" },
    REVALIDATE_INDEC_MONTHLY
  );

  const period = latestRows?.[0] ? readString(latestRows[0], "periodo") : null;
  if (!period) return [];

  const rows = await fetchIndecRows(
    "/ipc_nacional",
    {
      select: "periodo,region,nivel,codigo,tipo_de_indicador,valor",
      periodo: `eq.${period}`,
      nivel: "eq.Nivel General",
      codigo: "eq.0",
      tipo_de_indicador: "in.(v_m,v_ia,v_acum)",
      order: "region.asc",
      limit: "100",
    },
    REVALIDATE_INDEC_MONTHLY
  );

  if (!rows) return [];

  const byRegion = new Map<
    string,
    { mensual?: number; interanual?: number; acumulada?: number }
  >();

  for (const row of rows) {
    const region = readString(row, "region");
    const type = readString(row, "tipo_de_indicador");
    const value = readNumber(row, "valor");
    if (!region || !type || value === null) continue;

    const entry = byRegion.get(region) ?? {};
    if (type === "v_m") entry.mensual = value;
    else if (type === "v_ia") entry.interanual = value;
    else if (type === "v_acum") entry.acumulada = value;
    byRegion.set(region, entry);
  }

  const fecha = periodToDate(period);
  if (!fecha) return [];

  const regions: IpcRegional[] = [];

  for (const [region, entry] of byRegion) {
    if (region === "Nacional") continue;
    if (entry.mensual === undefined || entry.interanual === undefined) continue;

    regions.push({
      region,
      fecha,
      mensual: entry.mensual,
      interanual: entry.interanual,
      acumulada: entry.acumulada ?? null,
    });
  }

  return regions.sort((a, b) => a.region.localeCompare(b.region));
}

// ---------------------------------------------------------------------------
// Salario real (índice de salarios vs IPC)
// ---------------------------------------------------------------------------

const SALARY_PARAMS: IndecParams = {
  select: "periodo,nivel,codigo,tipo_de_indicador,valor",
  nivel: "eq.0",
  codigo: "eq.0",
  tipo_de_indicador: "in.(v_m,v_ia)",
  order: "periodo.asc",
  limit: "1000",
};

/**
 * Builds the real-wage series by joining the INDEC salary index with the IPC
 * of the same period. Both series are monthly and use percentage variations,
 * so the real variation is `(1 + salario) / (1 + IPC) - 1`.
 */
async function getSalarioRealSeries(): Promise<SalarioReal[]> {
  const [salaryRows, ipcHistory] = await Promise.all([
    fetchIndecRows("/indice_salarios", SALARY_PARAMS, REVALIDATE_INDEC_MONTHLY),
    fetchIpcNacionalHistory(),
  ]);

  if (!salaryRows || ipcHistory.length === 0) return [];

  const ipcByPeriod = new Map<string, InflacionMensual>();
  for (const entry of ipcHistory) {
    ipcByPeriod.set(entry.fecha.slice(0, 7).replace("-", ""), entry);
  }

  const salaryByPeriod = new Map<
    string,
    { mensual?: number; interanual?: number }
  >();

  for (const row of salaryRows) {
    const period = readString(row, "periodo");
    const type = readString(row, "tipo_de_indicador");
    const value = readNumber(row, "valor");
    if (!period || !type || value === null) continue;

    const entry = salaryByPeriod.get(period) ?? {};
    if (type === "v_m") entry.mensual = value;
    else if (type === "v_ia") entry.interanual = value;
    salaryByPeriod.set(period, entry);
  }

  const series: SalarioReal[] = [];

  for (const [period, salary] of salaryByPeriod) {
    if (salary.mensual === undefined || salary.interanual === undefined) continue;

    const ipc = ipcByPeriod.get(period);
    if (!ipc || ipc.interanual === undefined) continue;

    const mensual = realVariation(salary.mensual, ipc.valor);
    const interanual = realVariation(salary.interanual, ipc.interanual);
    if (mensual === null || interanual === null) continue;

    const fecha = periodToDate(period);
    if (!fecha) continue;

    series.push({
      fecha,
      mensual,
      interanual,
      nominalMensual: salary.mensual,
      nominalInteranual: salary.interanual,
      inflacionMensual: ipc.valor,
      inflacionInteranual: ipc.interanual,
    });
  }

  return series.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Latest real-wage reading. */
export async function fetchSalarioReal(): Promise<SalarioReal | null> {
  const series = await getSalarioRealSeries();
  return series.length > 0 ? series[series.length - 1] : null;
}

/** Real-wage interannual history, used by the sparkline and detail modal. */
export async function fetchSalarioRealHistory(): Promise<SalarioRealHistoryEntry[]> {
  const series = await getSalarioRealSeries();
  return series.map((entry) => ({ fecha: entry.fecha, valor: entry.interanual }));
}

// ---------------------------------------------------------------------------
// Actividad económica (EMAE)
// ---------------------------------------------------------------------------

const EMAE_PARAMS: IndecParams = {
  select: "periodo,tipo_de_indicador_descripcion,valor",
  tipo_de_indicador_descripcion:
    'in.("Var % interanual serie original","Var % mensual serie desestacionalizada","Índice serie original")',
  order: "periodo.asc",
  limit: "1000",
};

async function getActividadEconomicaSeries(): Promise<ActividadEconomica[]> {
  const rows = await fetchIndecRows(
    "/estimador-mensual-de-actividad-economica-nivel-general",
    EMAE_PARAMS,
    REVALIDATE_INDEC_MONTHLY
  );

  if (!rows) return [];

  const byPeriod = new Map<
    string,
    { interanual?: number; mensual?: number; indice?: number }
  >();

  for (const row of rows) {
    const period = readString(row, "periodo");
    const description = readString(row, "tipo_de_indicador_descripcion");
    const value = readNumber(row, "valor");
    if (!period || !description || value === null) continue;

    const entry = byPeriod.get(period) ?? {};
    if (description === "Var % interanual serie original") entry.interanual = value;
    else if (description === "Var % mensual serie desestacionalizada") entry.mensual = value;
    else if (description === "Índice serie original") entry.indice = value;
    byPeriod.set(period, entry);
  }

  const series: ActividadEconomica[] = [];

  for (const [period, entry] of byPeriod) {
    if (
      entry.interanual === undefined ||
      entry.mensual === undefined ||
      entry.indice === undefined
    ) {
      continue;
    }

    const fecha = periodToDate(period);
    if (!fecha) continue;

    series.push({
      fecha,
      interanual: round2(entry.interanual),
      mensual: round2(entry.mensual),
      indice: round2(entry.indice),
    });
  }

  return series.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Latest EMAE reading. */
export async function fetchActividadEconomica(): Promise<ActividadEconomica | null> {
  const series = await getActividadEconomicaSeries();
  return series.length > 0 ? series[series.length - 1] : null;
}

/** EMAE interannual history. */
export async function fetchActividadEconomicaHistory(): Promise<
  ActividadEconomicaHistoryEntry[]
> {
  const series = await getActividadEconomicaSeries();
  return series.map((entry) => ({ fecha: entry.fecha, valor: entry.interanual }));
}

// ---------------------------------------------------------------------------
// Canasta básica (CBA y CBT, Hogar 2)
// ---------------------------------------------------------------------------

const CANASTA_PARAMS: IndecParams = {
  select: "periodo,codigo,valor",
  nivel: "eq.Hogar",
  codigo: "in.(CBA H2,CBT H2)",
  tipo_de_indicador: "eq.Hogar 2",
  order: "periodo.asc",
  limit: "1000",
};

function getCanastaSeries(): Promise<CanastaBasicaHistoryEntry[]> {
  return fetchIndecRows(
    "/valorizacion_canastas_cba_cbt",
    CANASTA_PARAMS,
    REVALIDATE_INDEC_MONTHLY
  ).then((rows) => {
    if (!rows) return [];

    const byPeriod = new Map<string, { cba?: number; cbt?: number }>();

    for (const row of rows) {
      const period = readString(row, "periodo");
      const code = readString(row, "codigo");
      const value = readNumber(row, "valor");
      if (!period || !code || value === null) continue;

      const entry = byPeriod.get(period) ?? {};
      if (code === "CBA H2") entry.cba = value;
      else if (code === "CBT H2") entry.cbt = value;
      byPeriod.set(period, entry);
    }

    const series: CanastaBasicaHistoryEntry[] = [];

    for (const [period, entry] of byPeriod) {
      if (entry.cba === undefined || entry.cbt === undefined) continue;
      const fecha = periodToDate(period);
      if (!fecha) continue;
      series.push({ fecha, cba: entry.cba, cbt: entry.cbt });
    }

    return series.sort((a, b) => a.fecha.localeCompare(b.fecha));
  });
}

/**
 * Latest CBA/CBT for the INDEC "Hogar 2" (four members, Gran Buenos Aires).
 *
 * Monthly and interannual variations are computed from the CBT series because
 * INDEC only publishes variations for the adult-equivalent basket.
 */
export async function fetchCanastaBasica(): Promise<CanastaBasica | null> {
  const series = await getCanastaSeries();
  if (series.length === 0) return null;

  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const period = latest.fecha.slice(0, 7).replace("-", "");
  const yearAgoPeriod = shiftPeriod(period, -12);
  const yearAgo = series.find(
    (entry) => entry.fecha.slice(0, 7).replace("-", "") === yearAgoPeriod
  );

  return {
    fecha: latest.fecha,
    cba: latest.cba,
    cbt: latest.cbt,
    variacionMensual: previous ? percentChange(latest.cbt, previous.cbt) : null,
    variacionInteranual: yearAgo ? percentChange(latest.cbt, yearAgo.cbt) : null,
  };
}

/** CBA/CBT history for the sparkline and detail modal. */
export async function fetchCanastaBasicaHistory(): Promise<
  CanastaBasicaHistoryEntry[]
> {
  return getCanastaSeries();
}

// ---------------------------------------------------------------------------
// Pobreza e indigencia (EPH)
// ---------------------------------------------------------------------------

const POVERTY_PARAMS: IndecParams = {
  select:
    "periodo,anio,semestre,tasa_pobreza_hogares,tasa_pobreza_personas,tasa_indigencia_hogares,tasa_indigencia_personas,observaciones",
  area_geografica_nom: "eq.T_31_A",
  order: "periodo.asc",
  limit: "100",
};

async function getPobrezaSeries(): Promise<Pobreza[]> {
  const rows = await fetchIndecRows(
    "/pobreza_eph",
    POVERTY_PARAMS,
    REVALIDATE_INDEC_SEMESTER
  );

  if (!rows) return [];

  const series: Pobreza[] = [];

  for (const row of rows) {
    const period = readString(row, "periodo");
    const povertyPeople = readNumber(row, "tasa_pobreza_personas");
    const povertyHouseholds = readNumber(row, "tasa_pobreza_hogares");
    const indigencePeople = readNumber(row, "tasa_indigencia_personas");
    const indigenceHouseholds = readNumber(row, "tasa_indigencia_hogares");
    if (
      !period ||
      povertyPeople === null ||
      povertyHouseholds === null ||
      indigencePeople === null ||
      indigenceHouseholds === null
    ) {
      continue;
    }

    const fecha = semesterToDate(period);
    if (!fecha) continue;

    const observations = readString(row, "observaciones")?.toLowerCase() ?? "";

    series.push({
      fecha,
      periodo: period,
      pobrezaPersonas: povertyPeople,
      pobrezaHogares: povertyHouseholds,
      indigenciaPersonas: indigencePeople,
      indigenciaHogares: indigenceHouseholds,
      provisorio: observations.includes("provisorio"),
    });
  }

  return series.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Latest poverty reading (31 urban agglomerations). */
export async function fetchPobreza(): Promise<Pobreza | null> {
  const series = await getPobrezaSeries();
  return series.length > 0 ? series[series.length - 1] : null;
}

/** Poverty history (people below the poverty line). */
export async function fetchPobrezaHistory(): Promise<PobrezaHistoryEntry[]> {
  const series = await getPobrezaSeries();
  return series.map((entry) => ({ fecha: entry.fecha, valor: entry.pobrezaPersonas }));
}
