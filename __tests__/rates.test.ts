import { test } from "node:test";
import assert from "node:assert/strict";
import { getLatestUpdateTimestamp } from "@/lib/utils/rates";
import { makeRate } from "./support/fixtures";

test("getLatestUpdateTimestamp: lista vacía devuelve null", () => {
  assert.equal(getLatestUpdateTimestamp([]), null);
});

test("getLatestUpdateTimestamp: devuelve el timestamp más reciente", () => {
  const rates = [
    makeRate("blue", 1, 2, "2026-03-16T10:00:00.000Z"),
    makeRate("oficial", 1, 2, "2026-03-16T15:30:00.000Z"),
    makeRate("bolsa", 1, 2, "2026-03-15T23:00:00.000Z"),
  ];
  assert.equal(getLatestUpdateTimestamp(rates), "2026-03-16T15:30:00.000Z");
});

test("getLatestUpdateTimestamp: ignora timestamps vacíos", () => {
  const rates = [makeRate("blue", 1, 2, ""), makeRate("oficial", 1, 2, "2026-03-16T10:00:00.000Z")];
  assert.equal(getLatestUpdateTimestamp(rates), "2026-03-16T10:00:00.000Z");
  assert.equal(getLatestUpdateTimestamp([makeRate("blue", 1, 2, "")]), null);
});
