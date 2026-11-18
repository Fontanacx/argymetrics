import { BANDAS } from "@/lib/constants";

const MS_PER_DAY = 86_400_000;
const DAYS_PER_MONTH = 30;

/**
 * Proyecta (estimación de RESPALDO) el piso y el techo de la banda cambiaria
 * para una fecha dada, a partir del ancla `BANDAS` y su ajuste mensual.
 *
 * Solo se usa cuando la API del BCRA no responde: los valores oficiales salen
 * de las series 1187/1188 (ver `fetchBandas()`). El esquema vigente multiplica
 * el techo y divide el piso por el mismo factor (IPC t-2 aplicado en forma
 * diaria), así que la proyección hace lo mismo con `driftMensual`.
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
  const factor = Math.pow(1 + BANDAS.driftMensual, months);
  const piso = BANDAS.piso / factor;
  const techo = BANDAS.techo * factor;

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
