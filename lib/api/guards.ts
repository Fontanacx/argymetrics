import type {
  DollarCasa,
  DollarHistoryEntry,
  DollarQuote,
  DollarRate,
  InflacionMensual,
  RegionalQuote,
  RiesgoPaisHistoryEntry,
} from "../types";
import { CASA_LABELS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Shared runtime guards / parsers for untrusted JSON (`unknown`) payloads.
//
// Every `parse*` function builds a fresh, correctly-typed object (never a
// pass-through of the raw payload) and returns `null` / skips invalid items
// instead of throwing.
// ---------------------------------------------------------------------------

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Reads a finite number from `record[key]`, or `undefined` when absent/invalid. */
export function readFiniteNumber(
  record: Record<string, unknown>,
  key: string
): number | undefined {
  const value = record[key];
  return isFiniteNumber(value) ? value : undefined;
}

/** Narrows an arbitrary value to a known `DollarCasa`. */
export function isDollarCasa(value: unknown): value is DollarCasa {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(CASA_LABELS, value);
}

// ---------------------------------------------------------------------------
// DolarAPI
// ---------------------------------------------------------------------------

/** Parses a DolarAPI quote (`moneda`, `nombre`, `compra`, `venta`, `fechaActualizacion`). */
export function parseDollarQuote(value: unknown): DollarQuote | null {
  if (!isRecord(value)) return null;

  const { moneda, nombre, compra, venta, fechaActualizacion } = value;
  if (
    typeof moneda !== "string" ||
    typeof nombre !== "string" ||
    !isFiniteNumber(compra) ||
    !isFiniteNumber(venta) ||
    typeof fechaActualizacion !== "string"
  ) {
    return null;
  }

  return { moneda, nombre, compra, venta, fechaActualizacion };
}

/** Parses a DolarAPI dollar rate (a quote plus a known `casa`). */
export function parseDollarRate(value: unknown): DollarRate | null {
  const quote = parseDollarQuote(value);
  if (!quote || !isRecord(value) || !isDollarCasa(value.casa)) return null;
  return { ...quote, casa: value.casa };
}

/** Parses an array of DolarAPI rates, dropping invalid items. */
export function parseDollarRates(value: unknown): DollarRate[] {
  if (!Array.isArray(value)) return [];
  const rates: DollarRate[] = [];
  for (const item of value) {
    const rate = parseDollarRate(item);
    if (rate) rates.push(rate);
  }
  return rates;
}

/** Parses a regional DolarAPI quote (mx/co/cl), which has no `casa` field. */
export function parseRegionalQuote(value: unknown): RegionalQuote | null {
  if (!isRecord(value)) return null;

  const { moneda, nombre, compra, venta, fechaActualizacion } = value;
  if (typeof moneda !== "string" || !isFiniteNumber(compra) || !isFiniteNumber(venta)) {
    return null;
  }

  return {
    moneda,
    nombre: typeof nombre === "string" ? nombre : moneda,
    compra,
    venta,
    fechaActualizacion: typeof fechaActualizacion === "string" ? fechaActualizacion : "",
  };
}

export function parseRegionalQuotes(value: unknown): RegionalQuote[] {
  if (!Array.isArray(value)) return [];
  const quotes: RegionalQuote[] = [];
  for (const item of value) {
    const quote = parseRegionalQuote(item);
    if (quote) quotes.push(quote);
  }
  return quotes;
}

// ---------------------------------------------------------------------------
// ArgentinaDatos
// ---------------------------------------------------------------------------

/** Parses `{ fecha, compra, venta }` history entries, dropping invalid items. */
export function parseDollarHistory(value: unknown): DollarHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: DollarHistoryEntry[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const { fecha, compra, venta } = item;
    if (typeof fecha !== "string" || !isFiniteNumber(compra) || !isFiniteNumber(venta)) {
      continue;
    }
    entries.push({ fecha, compra, venta });
  }
  return entries;
}

/** Parses `{ fecha, valor }` entries (riesgo país history), dropping invalid items. */
export function parseRiesgoPaisHistory(value: unknown): RiesgoPaisHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: RiesgoPaisHistoryEntry[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const { fecha, valor } = item;
    if (typeof fecha !== "string" || !isFiniteNumber(valor)) continue;
    entries.push({ fecha, valor });
  }
  return entries;
}

/** Parses a single monthly inflation entry (`fecha`, `valor` + optional extras). */
export function parseInflacionMensual(value: unknown): InflacionMensual | null {
  if (!isRecord(value)) return null;
  const { fecha, valor } = value;
  if (typeof fecha !== "string" || !isFiniteNumber(valor)) return null;

  return {
    fecha,
    valor,
    interanual: readFiniteNumber(value, "interanual"),
    acumulada: readFiniteNumber(value, "acumulada"),
  };
}

export function parseInflacionHistory(value: unknown): InflacionMensual[] {
  if (!Array.isArray(value)) return [];
  const entries: InflacionMensual[] = [];
  for (const item of value) {
    const entry = parseInflacionMensual(item);
    if (entry) entries.push(entry);
  }
  return entries;
}
