/**
 * Ancla del esquema de bandas cambiarias del BCRA.
 *
 * El BCRA definió un crawling band determinístico: a partir de un valor base,
 * el piso baja y el techo sube `driftMensual` por mes. En lugar de fijar un
 * piso/techo estático (que queda desactualizado a los pocos días), guardamos el
 * último ancla publicado y proyectamos hacia la fecha actual con
 * `computeBandasAt()` (ver `lib/utils/bandas.ts`).
 *
 * Actualizá este ancla SOLO si el BCRA cambia el esquema: nuevo valor base,
 * nueva fecha de vigencia o nueva tasa de deriva.
 */
export const BANDAS = {
  /** Piso base del ancla, vigente en `fechaActualizacion`. */
  piso: 855.26,
  /** Techo base del ancla, vigente en `fechaActualizacion`. */
  techo: 1632.48,
  /** Fecha de vigencia del ancla (ISO `YYYY-MM-DD`). */
  fechaActualizacion: "2026-03-16",
  /** Deriva mensual del crawling band: piso −1% / techo +1% por mes. */
  driftMensual: 0.01,
} as const;
