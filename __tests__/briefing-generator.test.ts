import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { generateBriefingText } from "@/lib/utils/briefing-generator";
import { makeBriefing, makeStock } from "./support/fixtures";

describe("mercado cambiario", () => {
  test("brecha < 5 es tranquilo y usa el día de la semana", () => {
    const text = generateBriefingText(makeBriefing({ brechaBlueOficial: 3 }));
    assert.match(text, /^El mercado cambiario opera tranquilo este lunes, con una brecha Blue-Oficial del \+3,0%/);
  });

  test("brecha < 5 no afirma que sea la más baja de la semana", () => {
    const text = generateBriefingText(makeBriefing({ brechaBlueOficial: 3 }));
    assert.doesNotMatch(text, /semana/);
    assert.doesNotMatch(text, /\+\+/);
  });

  test("brecha entre 5 y 15 es tensión moderada con precios", () => {
    const text = generateBriefingText(makeBriefing({ brechaBlueOficial: 10 }));
    assert.match(text, /tensión moderada/);
    assert.match(text, /dólar blue a \$ 1\.400,00 y el oficial a \$ 1\.300,00/);
  });

  test("brecha > 15 es tensión elevada", () => {
    const text = generateBriefingText(makeBriefing({ brechaBlueOficial: 20 }));
    assert.match(text, /tensión elevada/);
    assert.match(text, /la brecha Blue-Oficial alcanza el \+20,0%/);
  });

  test("fecha vacía usa el día genérico", () => {
    const text = generateBriefingText(makeBriefing({ date: "" }));
    assert.match(text, /este día,/);
  });
});

describe("indicadores macro", () => {
  test("incluye riesgo país redondeado e inflación con su fecha", () => {
    const text = generateBriefingText(
      makeBriefing({ riesgoPais: { value: 574.6, weeklyChange: null }, inflacion: { value: 2.5, date: "febrero 2026" } }),
    );
    assert.match(text, /Riesgo País se ubica en 575 puntos/);
    assert.match(text, /inflación mensual más reciente fue del \+2,5% \(febrero 2026\)/);
  });

  test("menciona el oro solo si varía más de 1%", () => {
    assert.doesNotMatch(generateBriefingText(makeBriefing({ gold: { value: 3000, variation: 0.5 } })), /oro/i);
    assert.match(generateBriefingText(makeBriefing({ gold: { value: 3000, variation: 2 } })), /El oro sube un \+2,0%/);
    assert.match(generateBriefingText(makeBriefing({ gold: { value: 3000, variation: -2 } })), /El oro baja un \+2,0%/);
  });
});

describe("BYMA", () => {
  const stocks = [
    makeStock("GGAL.BA", 3.2),
    makeStock("YPFD.BA", -4.1),
    makeStock("PAMP.BA", 0.5),
    ...Array.from({ length: 7 }, (_, i) => makeStock(`T${i}.BA`, 0.1)),
  ];

  test("sin operaciones", () => {
    const text = generateBriefingText(makeBriefing({ stocksEnVerde: 0, stocksEnRojo: 0, stocks }));
    assert.match(text, /sin variaciones, típicamente debido a un feriado/);
  });

  test(">= 7 en verde menciona al líder sin sufijo .BA", () => {
    const text = generateBriefingText(makeBriefing({ stocksEnVerde: 8, stocksEnRojo: 2, stocks }));
    assert.match(text, /8 de 10 acciones cierran en verde, con GGAL liderando las subidas con \+3,2%\./);
    assert.doesNotMatch(text, /\+\+/);
  });

  test("usa la cantidad real de acciones en lugar de 10 fijo", () => {
    const five = stocks.slice(0, 5);
    const up = generateBriefingText(makeBriefing({ stocksEnVerde: 7, stocksEnRojo: 1, stocks: five }));
    assert.match(up, /7 de 5 acciones cierran en verde/);
    const down = generateBriefingText(makeBriefing({ stocksEnVerde: 1, stocksEnRojo: 4, stocks: five }));
    assert.match(down, /4 de 5 acciones operan en rojo/);
  });

  test("<= 3 en verde menciona la mayor caída", () => {
    const text = generateBriefingText(makeBriefing({ stocksEnVerde: 2, stocksEnRojo: 8, stocks }));
    assert.match(text, /jornada es negativa: 8 de 10 acciones operan en rojo, con YPFD registrando la mayor caída \(-4,1%\)/);
  });

  test("4-6 en verde es mixta", () => {
    const text = generateBriefingText(makeBriefing({ stocksEnVerde: 5, stocksEnRojo: 5, stocks }));
    assert.match(text, /jornada es mixta: GGAL sube \+3,2% mientras/);
    assert.doesNotMatch(text, /\+\+/);
    assert.match(text, /YPFD retrocede -4,1%/);
  });

  test("sin acciones no rompe ni imprime undefined", () => {
    for (const [verde, rojo] of [[8, 2], [5, 5], [2, 8]]) {
      const text = generateBriefingText(makeBriefing({ stocksEnVerde: verde, stocksEnRojo: rojo, stocks: [] }));
      assert.doesNotMatch(text, /undefined|NaN|\+\+/);
      assert.match(text, /mercado bursátil/);
    }
  });
});

describe("wallets y cripto", () => {
  const wallets = [
    { name: "Belo", compra: 1380, venta: 1400 },
    { name: "Lemon", compra: 1395, venta: 1410 },
  ];

  test("Bitcoin volátil + billeteras: menciona la billetera con mejor compra", () => {
    const text = generateBriefingText(makeBriefing({ btc: { value: 90000, variation: 2.4 }, wallets }));
    assert.match(text, /Bitcoin opera con fuerte volatilidad avanzando un 2\.4%/);
    assert.match(text, /la ofrece Lemon comprando a \$ 1\.395,00/);
  });

  test("Bitcoin volátil a la baja", () => {
    const text = generateBriefingText(makeBriefing({ btc: { value: 90000, variation: -3 }, wallets }));
    assert.match(text, /retrocediendo un 3\.0%/);
  });

  test("solo billeteras", () => {
    const text = generateBriefingText(makeBriefing({ wallets }));
    assert.match(text, /billetera Lemon a \$ 1\.395,00/);
  });

  test("solo Bitcoin volátil", () => {
    const text = generateBriefingText(makeBriefing({ btc: { value: 90000, variation: 4 } }));
    assert.match(text, /avanzando un 4\.0% rondando los US\$ 90\.000/);
  });

  test("sin señales: mercado lateral", () => {
    assert.match(generateBriefingText(makeBriefing()), /operan de manera lateral/);
  });
});

test("devuelve un único párrafo no vacío", () => {
  const text = generateBriefingText(makeBriefing({ stocks: [makeStock("GGAL.BA", 1), makeStock("YPFD.BA", -1)] }));
  assert.ok(text.length > 100);
  assert.doesNotMatch(text, /undefined|NaN/);
});
