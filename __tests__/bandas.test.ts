import { test } from "node:test";
import assert from "node:assert/strict";
import { BANDAS } from "@/lib/constants";
import { computeBandasAt, todayBuenosAiresISO } from "@/lib/utils/bandas";

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

test("computeBandasAt: en la fecha del ancla devuelve los valores del ancla", () => {
  const { piso, techo } = computeBandasAt(BANDAS.fechaActualizacion);
  assert.equal(piso, BANDAS.piso);
  assert.equal(techo, BANDAS.techo);
});

test("computeBandasAt: +30 días aplica un mes de ajuste (techo × factor, piso ÷ factor)", () => {
  const factor = 1 + BANDAS.driftMensual;
  const { piso, techo } = computeBandasAt(addDays(BANDAS.fechaActualizacion, 30));
  assert.equal(piso, Number((BANDAS.piso / factor).toFixed(2)));
  assert.equal(techo, Number((BANDAS.techo * factor).toFixed(2)));
});

test("computeBandasAt: +60 días compone dos meses de ajuste", () => {
  const factor = (1 + BANDAS.driftMensual) ** 2;
  const { piso, techo } = computeBandasAt(addDays(BANDAS.fechaActualizacion, 60));
  assert.equal(piso, Number((BANDAS.piso / factor).toFixed(2)));
  assert.equal(techo, Number((BANDAS.techo * factor).toFixed(2)));
});

test("computeBandasAt: antes del ancla la banda es más angosta", () => {
  const { piso, techo } = computeBandasAt(addDays(BANDAS.fechaActualizacion, -30));
  assert.ok(piso > BANDAS.piso);
  assert.ok(techo < BANDAS.techo);
});

test("computeBandasAt: fecha inválida devuelve el ancla sin proyectar", () => {
  assert.deepEqual(computeBandasAt("no-es-una-fecha"), { piso: BANDAS.piso, techo: BANDAS.techo });
  assert.deepEqual(computeBandasAt(""), { piso: BANDAS.piso, techo: BANDAS.techo });
});

test("computeBandasAt: el piso siempre queda por debajo del techo", () => {
  for (const days of [-365, -30, 0, 30, 365]) {
    const { piso, techo } = computeBandasAt(addDays(BANDAS.fechaActualizacion, days));
    assert.ok(piso < techo);
  }
});

test("todayBuenosAiresISO: devuelve formato YYYY-MM-DD", () => {
  assert.match(todayBuenosAiresISO(), /^\d{4}-\d{2}-\d{2}$/);
});
