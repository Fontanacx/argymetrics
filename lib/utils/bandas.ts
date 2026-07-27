import { BANDAS } from "@/lib/constants";

const MS_PER_DAY = 86_400_000;
const DAYS_PER_MONTH = 30; // Convención mensual del crawling band del BCRA.

/**
 * Proyecta el piso y el techo de la banda cambiaria para una fecha dada, a
 * partir del ancla del BCRA (`BANDAS`) y su deriva mensual.
 *
 * El esquema es determinístico y fue anunciado por el BCRA: desde el valor
 * base, el piso baja y el techo sube `driftMensual` por mes. Para fechas
 * anteriores al ancla la banda es más angosta; para fechas posteriores, más
 * ancha. Al proyectar siempre hacia la fecha objetivo, la tarjeta del indicador
 * y el gráfico histórico usan la MISMA fórmula y nunca quedan desincronizados.
 *
 * @param dateISO Fecha objetivo en formato `YYYY-MM-DD`.
 * @returns Piso y techo proyectados, redondeados a 2 decimales. Si la fecha es
 *          inválida, devuelve el ancla sin proyectar (fallback seguro).
 */
export function computeBandasAt(dateISO: string): { piso: number; techo: number } {
  const anchorMs = Date.parse(`${BANDAS.fechaActualizacion}T00:00:00Z`);
  const targetMs = Date.parse(`${dateISO}T00:00:00Z`);

  if (Number.isNaN(anchorMs) || Number.isNaN(targetMs)) {
    return { piso: BANDAS.piso, techo: BANDAS.techo };
  }

  const months = (targetMs - anchorMs) / MS_PER_DAY / DAYS_PER_MONTH;
  const piso = BANDAS.piso * Math.pow(1 - BANDAS.driftMensual, months);
  const techo = BANDAS.techo * Math.pow(1 + BANDAS.driftMensual, months);

  return {
    piso: Number(piso.toFixed(2)),
    techo: Number(techo.toFixed(2)),
  };
}

/**
 * Devuelve la fecha actual en horario de Buenos Aires como `YYYY-MM-DD`.
 * Se usa como fecha objetivo por defecto para proyectar las bandas "a hoy".
 */
export function todayBuenosAiresISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}
