import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  formatARS,
  formatCompact,
  formatPercent,
  formatPercentUnsigned,
  formatPoints,
  formatSpread,
  formatUSD,
} from "@/lib/formatters/currency";
import {
  formatDateOnly,
  formatDateTime,
  formatMonthYear,
  formatShortDate,
  formatRelativeTime,
  formatSemesterPeriod,
  formatTime,
} from "@/lib/formatters/date";
import { RANGE_DAYS, computeMetrics } from "@/lib/formatters/metrics";

describe("currency", () => {
  test("formatARS usa separadores es-AR y 2 decimales", () => {
    assert.equal(formatARS(1415.5), "$ 1.415,50");
    assert.equal(formatARS(0), "$ 0,00");
    assert.equal(formatARS(1234567.891), "$ 1.234.567,89");
  });

  test("formatARS no deja espacios no separables", () => {
    assert.doesNotMatch(formatARS(1415.5), /[  ]/);
  });

  test("formatCompact no muestra decimales", () => {
    assert.equal(formatCompact(1415.5), "$ 1.416");
    assert.equal(formatCompact(1000), "$ 1.000");
  });

  test("formatPercent siempre incluye el signo y 1 decimal", () => {
    assert.equal(formatPercent(2.45), "+2,5%");
    assert.equal(formatPercent(-1.1), "-1,1%");
  });

  test("formatPercentUnsigned no incluye signo +", () => {
    assert.equal(formatPercentUnsigned(32.3), "32,3%");
    assert.equal(formatPercentUnsigned(-1.5), "-1,5%");
  });

  test("formatPoints redondea a entero", () => {
    assert.equal(formatPoints(574), "574");
    assert.equal(formatPoints(574.6), "575");
    assert.equal(formatPoints(1234), "1.234");
  });

  test("formatSpread usa el valor absoluto de la diferencia", () => {
    assert.equal(formatSpread(1405, 1425), "$ 20,00");
    assert.equal(formatSpread(1425, 1405), "$ 20,00");
  });

  test("formatUSD antepone US$ y usa formato es-AR", () => {
    assert.equal(formatUSD(3250.75), "US$ 3.250,75");
    assert.equal(formatUSD(0), "US$ 0,00");
  });
});

describe("date", () => {
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

  test("formatRelativeTime: menos de un minuto", () => {
    assert.equal(formatRelativeTime(ago(5_000)), "hace un momento");
  });

  test("formatRelativeTime: minutos", () => {
    assert.equal(formatRelativeTime(ago(5 * MIN + 1_000)), "hace 5 min");
  });

  test("formatRelativeTime: horas con singular y plural", () => {
    assert.equal(formatRelativeTime(ago(HOUR + 1_000)), "hace 1 hora");
    assert.equal(formatRelativeTime(ago(3 * HOUR + 1_000)), "hace 3 horas");
  });

  test("formatRelativeTime: días", () => {
    assert.equal(formatRelativeTime(ago(DAY + 1_000)), "hace 1 día");
    assert.equal(formatRelativeTime(ago(4 * DAY + 1_000)), "hace 4 días");
  });

  test("formatDateOnly convierte YYYY-MM-DD a DD/MM/YYYY sin correr el día", () => {
    assert.equal(formatDateOnly("2026-03-13"), "13/03/2026");
    assert.equal(formatDateOnly("2026-01-01"), "01/01/2026");
  });

  test("formatDateTime con fecha sin hora devuelve solo la fecha", () => {
    assert.equal(formatDateTime("2026-03-16"), "16/03/2026");
  });

  test("formatDateTime con timestamp usa la hora de Buenos Aires (UTC-3)", () => {
    assert.match(formatDateTime("2026-03-16T18:42:00.000Z"), /^16\/03\/2026,? 15:42$/);
  });

  test("formatTime usa HH:MM en hora de Buenos Aires", () => {
    assert.equal(formatTime("2026-03-26T17:30:00.000Z"), "14:30");
  });

  test("formatShortDate con fecha sin hora no retrocede un día en Buenos Aires", () => {
    assert.equal(formatShortDate("2026-03-16"), "16/3");
    assert.equal(formatShortDate("2026-01-01"), "1/1");
  });

  test("formatShortDate con timestamp usa el día de Buenos Aires", () => {
    assert.equal(formatShortDate("2026-03-16T01:00:00.000Z"), "15/3");
    assert.equal(formatShortDate("2026-03-16T15:00:00.000Z"), "16/3");
  });

  test("formatMonthYear capitaliza el mes en español", () => {
    assert.equal(formatMonthYear("2026-01-31"), "Enero de 2026");
    assert.equal(formatMonthYear("2025-12-31"), "Diciembre de 2025");
  });

  test("formatSemesterPeriod", () => {
    assert.equal(formatSemesterPeriod("20261S"), "1er semestre 2026");
    assert.equal(formatSemesterPeriod("20252S"), "2do semestre 2025");
    assert.equal(formatSemesterPeriod("invalido"), "invalido");
  });
});

describe("metrics", () => {
  test("RANGE_DAYS mapea cada rango a su cantidad de días", () => {
    assert.deepEqual(RANGE_DAYS, { "7d": 7, "30d": 30, "90d": 90, "1y": 365 });
  });

  test("computeMetrics: serie vacía devuelve null", () => {
    assert.equal(computeMetrics([]), null);
  });

  test("computeMetrics calcula máximo, mínimo, promedio y variación", () => {
    assert.deepEqual(computeMetrics([100, 120, 90, 110]), {
      high: 120,
      low: 90,
      average: 105,
      changePercent: 10,
    });
  });

  test("computeMetrics: un solo valor no tiene variación", () => {
    assert.deepEqual(computeMetrics([50]), { high: 50, low: 50, average: 50, changePercent: 0 });
  });

  test("computeMetrics: primer valor 0 evita división por cero", () => {
    assert.equal(computeMetrics([0, 10])?.changePercent, 0);
  });

  test("computeMetrics redondea a 2 decimales", () => {
    const m = computeMetrics([3, 4, 4]);
    assert.equal(m?.average, 3.67);
    assert.equal(m?.changePercent, 33.33);
  });
});
