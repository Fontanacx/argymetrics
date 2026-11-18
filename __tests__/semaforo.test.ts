import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeSemaforo } from "@/lib/utils/semaforo";
import { makeBriefing, makeStock } from "./support/fixtures";

function item(label: string, input = makeBriefing()) {
  const found = computeSemaforo(input).find((i) => i.label === label);
  assert.ok(found, `falta el ítem ${label}`);
  return found;
}

test("computeSemaforo devuelve los 5 ítems en orden", () => {
  assert.deepEqual(
    computeSemaforo(makeBriefing()).map((i) => i.label),
    ["Mercado Cambiario", "Riesgo País", "Cripto & Billeteras", "Inflación", "Acciones BYMA"],
  );
});

describe("Mercado Cambiario", () => {
  test("brecha < 5 es verde / TRANQUILO", () => {
    const r = item("Mercado Cambiario", makeBriefing({ brechaBlueOficial: 4.9 }));
    assert.equal(r.status, "verde");
    assert.equal(r.titulo, "TRANQUILO");
  });

  test("brecha entre 5 y 15 (inclusive) es amarillo / MODERADO", () => {
    for (const brecha of [5, 10, 15]) {
      const r = item("Mercado Cambiario", makeBriefing({ brechaBlueOficial: brecha }));
      assert.equal(r.status, "amarillo", `brecha ${brecha}`);
      assert.equal(r.titulo, "MODERADO");
    }
  });

  test("brecha > 15 es rojo / TENSIÓN", () => {
    const r = item("Mercado Cambiario", makeBriefing({ brechaBlueOficial: 15.1 }));
    assert.equal(r.status, "rojo");
    assert.equal(r.titulo, "TENSIÓN");
  });

  test("la dirección vs ayer usa una tolerancia de 0,1 puntos", () => {
    const desc = (brecha: number, ayer: number | null) =>
      item("Mercado Cambiario", makeBriefing({ brechaBlueOficial: brecha, brechaBlueYesterday: ayer })).descripcion;
    assert.match(desc(10, 9), /subió vs ayer/);
    assert.match(desc(10, 11), /bajó vs ayer/);
    assert.match(desc(10, 10.05), /sin cambios vs ayer/);
    assert.match(desc(10, null), /sin cambios vs ayer/);
  });

  test("la descripción incluye la brecha con 1 decimal", () => {
    assert.match(item("Mercado Cambiario", makeBriefing({ brechaBlueOficial: 7.74 })).descripcion, /^Brecha Blue-Oficial en 7\.7%/);
  });
});

describe("Riesgo País", () => {
  test("umbrales: <500 verde, 500-900 amarillo, >900 rojo", () => {
    const at = (value: number) => item("Riesgo País", makeBriefing({ riesgoPais: { value, weeklyChange: null } }));
    assert.equal(at(499).status, "verde");
    assert.equal(at(499).titulo, "BAJO");
    assert.equal(at(500).status, "amarillo");
    assert.equal(at(900).status, "amarillo");
    assert.equal(at(901).status, "rojo");
    assert.equal(at(901).titulo, "ALTO");
  });

  test("la tendencia semanal solo aparece si hay dato", () => {
    const sin = item("Riesgo País", makeBriefing({ riesgoPais: { value: 574.4, weeklyChange: null } }));
    assert.equal(sin.descripcion, "574 pts");
    const sube = item("Riesgo País", makeBriefing({ riesgoPais: { value: 600, weeklyChange: 2.34 } }));
    assert.equal(sube.descripcion, "600 pts · subió 2.3% esta semana");
    const baja = item("Riesgo País", makeBriefing({ riesgoPais: { value: 600, weeklyChange: -1.5 } }));
    assert.equal(baja.descripcion, "600 pts · bajó 1.5% esta semana");
  });
});

describe("Inflación", () => {
  test("umbrales: <3 verde, 3-6 amarillo, >6 rojo", () => {
    const at = (value: number) => item("Inflación", makeBriefing({ inflacion: { value, date: "enero 2026" } }));
    assert.equal(at(2.9).status, "verde");
    assert.equal(at(2.9).titulo, "CONTENIDA");
    assert.equal(at(3).status, "amarillo");
    assert.equal(at(6).status, "amarillo");
    assert.equal(at(6.1).status, "rojo");
    assert.equal(at(6.1).titulo, "ELEVADA");
  });

  test("la descripción incluye IPC y fecha del dato", () => {
    assert.equal(
      item("Inflación", makeBriefing({ inflacion: { value: 2.46, date: "febrero 2026" } })).descripcion,
      "IPC 2.5% mensual · dato de febrero 2026",
    );
  });
});

describe("Cripto & Billeteras", () => {
  test("billetera mucho más barata que el blue es OPORTUNIDAD", () => {
    const r = item(
      "Cripto & Billeteras",
      makeBriefing({
        blue: { value: 1400, variation: 0 },
        wallets: [
          { name: "Belo", compra: 1380, venta: 1385.9 },
          { name: "Lemon", compra: 1390, venta: 1395 },
        ],
      }),
    );
    assert.equal(r.status, "verde");
    assert.equal(r.titulo, "OPORTUNIDAD");
    assert.match(r.descripcion, /Belo ofrece la oportunidad más barata a \$1385\./);
  });

  test("rally de Bitcoin (>5%) es OPORTUNIDAD", () => {
    const r = item("Cripto & Billeteras", makeBriefing({ btc: { value: 90000, variation: 6 } }));
    assert.equal(r.titulo, "OPORTUNIDAD");
    assert.match(r.descripcion, /\+6\.0%/);
  });

  test("cripto con prima > 30 sobre el blue es SOBREPRECIO", () => {
    const r = item(
      "Cripto & Billeteras",
      makeBriefing({ blue: { value: 1400, variation: 0 }, cripto: { value: 1431, variation: 0 } }),
    );
    assert.equal(r.status, "rojo");
    assert.equal(r.titulo, "SOBREPRECIO");
  });

  test("Bitcoin cayendo más de 5% es SOBREPRECIO", () => {
    const r = item("Cripto & Billeteras", makeBriefing({ btc: { value: 90000, variation: -6 } }));
    assert.equal(r.status, "rojo");
    assert.match(r.descripcion, /Bitcoin -6\.0%/);
  });

  test("sin señales es ALINEADO / amarillo", () => {
    const r = item("Cripto & Billeteras", makeBriefing());
    assert.equal(r.status, "amarillo");
    assert.equal(r.titulo, "ALINEADO");
    assert.match(r.descripcion, /billeteras aprox\. \$1390/);
  });
});

describe("Acciones BYMA", () => {
  const stocks = [
    makeStock("GGAL.BA", 3.2),
    makeStock("YPFD.BA", -4.1),
    makeStock("PAMP.BA", 0.5),
  ];

  test("sin variaciones es SIN OPERACIONES / amarillo", () => {
    const r = item("Acciones BYMA", makeBriefing({ stocksEnVerde: 0, stocksEnRojo: 0, stocks }));
    assert.equal(r.status, "amarillo");
    assert.equal(r.titulo, "SIN OPERACIONES");
  });

  test(">= 7 en verde es POSITIVO e incluye al líder", () => {
    const r = item("Acciones BYMA", makeBriefing({ stocksEnVerde: 7, stocksEnRojo: 3, stocks }));
    assert.equal(r.status, "verde");
    assert.equal(r.titulo, "POSITIVO");
    assert.equal(r.descripcion, "7/10 acciones en verde · GGAL lidera (+3.2%)");
  });

  test("entre 4 y 6 en verde es MIXTO e incluye líder y rezagado", () => {
    const r = item("Acciones BYMA", makeBriefing({ stocksEnVerde: 5, stocksEnRojo: 5, stocks }));
    assert.equal(r.status, "amarillo");
    assert.equal(r.titulo, "MIXTO");
    assert.equal(r.descripcion, "Mercado mixto · GGAL +3.2% · YPFD -4.1%");
  });

  test("<= 3 en verde es NEGATIVO e incluye la mayor caída", () => {
    const r = item("Acciones BYMA", makeBriefing({ stocksEnVerde: 3, stocksEnRojo: 7, stocks }));
    assert.equal(r.status, "rojo");
    assert.equal(r.titulo, "NEGATIVO");
    assert.equal(r.descripcion, "7/10 acciones en rojo · YPFD la mayor caída (-4.1%)");
  });

  test("lista de acciones vacía no rompe", () => {
    const r = item("Acciones BYMA", makeBriefing({ stocksEnVerde: 8, stocksEnRojo: 2, stocks: [] }));
    assert.equal(r.status, "verde");
    assert.match(r.descripcion, /lidera \(\+0\.0%\)/);
  });
});
