/**
 * Ancla de RESPALDO para las bandas cambiarias del BCRA.
 *
 * La fuente primaria son las series oficiales del BCRA (límite inferior 1187 y
 * superior 1188, ver `BCRA_SERIES` y `fetchBandas()` en `lib/api/indicators.ts`).
 * Este ancla solo se usa si la API del BCRA no responde: se proyecta desde el
 * último valor oficial conocido con `computeBandasAt()` (`lib/utils/bandas.ts`).
 *
 * Esquema vigente (desde el 1/1/2026): cada mes las bandas se ajustan según el
 * último IPC mensual publicado por el INDEC (rezago t-2), aplicado en forma
 * diaria. El techo se multiplica y el piso se divide por el mismo factor.
 * `driftMensual` es entonces una aproximación (el IPC cambia mes a mes), por
 * eso conviene refrescar el ancla de vez en cuando con el último valor oficial.
 */
export const BANDAS = {
  /** Último límite inferior oficial conocido (serie BCRA 1187). */
  piso: 704.27,
  /** Último límite superior oficial conocido (serie BCRA 1188). */
  techo: 1972.96,
  /** Fecha de esos valores (ISO `YYYY-MM-DD`). */
  fechaActualizacion: "2026-11-17",
  /**
   * Ajuste mensual aproximado. Noviembre 2026 usa el IPC de septiembre; el
   * ritmo diario observado en la serie oficial equivale a ~1,9% mensual.
   */
  driftMensual: 0.019,
} as const;
