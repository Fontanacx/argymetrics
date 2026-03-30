# Prompt: Add LATAM Currency Conversion to ArgyMetrics Converter

Copy everything below the line and paste it into Claude Sonnet 4.6 thinking.

---

## Context

You are working on **ArgyMetrics**, a Next.js 16 App Router + TypeScript 5 + React 19 financial dashboard for Argentina. UI language is **Spanish (es-AR)**. Architecture is **server-first** (no `useEffect` fetching, no client-side API calls). All data is fetched in server components via typed functions in `lib/api/`. All formatting goes through `lib/formatters/`. Types live in `lib/types/index.ts`. Constants in `lib/constants/`.

Read `PROJECT_CONTEXT.md` at the project root for the full architectural reference before making any changes.

## Objective

Add **4 LATAM currencies** to the existing `/conversor` page so users can convert ARS to/from:

| Currency | Code | Flag | Symbol | Locale |
|---|---|---|---|---|
| Peso Mexicano | MXN | 🇲🇽 | MX$ | es-MX |
| Peso Colombiano | COP | 🇨🇴 | COL$ | es-CO |
| Peso Uruguayo | UYU | 🇺🇾 | UY$ | es-UY |
| Sol Peruano | PEN | 🇵🇪 | S/ | es-PE |

**Style-wise: change NOTHING.** Keep the exact existing aesthetic, layout, card structure, `CustomSelect` dropdown, tabs, swap button, and all CSS. Only add the new currencies as selectable options in the converter.

## Data Source Strategy

DolarAPI Argentina (`dolarapi.com`) already provides UYU directly:

```
GET https://dolarapi.com/v1/cotizaciones/uyu
→ { moneda: "UYU", casa: "oficial", nombre: "Peso Uruguayo", compra: 34.22, venta: 34.22, fechaActualizacion: "..." }
```

For MXN, COP, and PEN there is **no direct Argentina endpoint**. Use **cross-rate calculation** via DolarAPI regional APIs:

```
GET https://mx.dolarapi.com/v1/cotizaciones → USD/MXN rate
GET https://co.dolarapi.com/v1/cotizaciones → USD/COP rate  
```

For PEN, the Colombia API has Sol Peruano:
```
GET https://co.dolarapi.com/v1/cotizaciones → includes PEN/COP rate
```

**Cross-rate formula:**
- ARS/MXN = (ARS/USD_oficial) / (MXN/USD) → compra and venta
- ARS/COP = (ARS/USD_oficial) / (COP/USD)
- ARS/PEN = (ARS/USD_oficial) / (PEN/USD) — derive USD/PEN from COP data: `USD/PEN = COP_per_USD / COP_per_PEN`

Alternatively, a simpler and more robust approach: use the **free Frankfurt Exchange Rate API** (`https://api.frankfurter.dev/v1/latest?from=ARS&to=MXN,COP,PEN,UYU`) which provides real-time ECB-sourced forex rates. This returns direct ARS→LATAM cross rates. **Choose whichever approach is cleaner**, but prefer DolarAPI if possible since the project already depends on it.

## Implementation Steps

### 1. Types (`lib/types/index.ts`)

Add a new interface for LATAM currency rates:

```typescript
export interface LatamCurrencyRate {
  moneda: string;       // "MXN", "COP", "UYU", "PEN"
  nombre: string;       // "Peso Mexicano", etc.
  compra: number;       // buy rate in ARS
  venta: number;        // sell rate in ARS
  fechaActualizacion: string;
}
```

### 2. API Layer (`lib/api/latam.ts`) — NEW FILE

Create `lib/api/latam.ts` with a `fetchLatamCurrencies()` function that:
- Fetches UYU from `dolarapi.com/v1/cotizaciones/uyu`
- Computes MXN, COP, PEN cross-rates (using whichever strategy you choose)
- Returns `LatamCurrencyRate[]`
- Uses `{ next: { revalidate: REVALIDATE_DOLLARS } }` for ISR caching
- Returns `[]` on failure (never crashes)
- Logs errors with `console.error("[fetchLatamCurrencies] ...")`

### 3. Constants (`lib/constants/display.ts`)

Add LATAM labels and symbols:

```typescript
export const LATAM_LABELS: Record<string, string> = {
  MXN: "Peso Mexicano",
  COP: "Peso Colombiano", 
  UYU: "Peso Uruguayo",
  PEN: "Sol Peruano",
};

export const LATAM_FLAGS: Record<string, string> = {
  MXN: "🇲🇽", COP: "🇨🇴", UYU: "🇺🇾", PEN: "🇵🇪",
};

export const LATAM_SYMBOLS: Record<string, string> = {
  MXN: "MX$", COP: "COL$", UYU: "UY$", PEN: "S/",
};
```

### 4. Conversor Page (`app/conversor/page.tsx`)

- Import `fetchLatamCurrencies` from `lib/api/latam`
- Add it to the `Promise.all` call
- Pass the LATAM data to `CurrencyConverter` as a new prop `latamCurrencies`

### 5. CurrencyConverter Component (`app/components/conversor/CurrencyConverter.tsx`)

This is the critical file. Modify minimally:

- Accept new prop `latamCurrencies: LatamCurrencyRate[]`
- In `selectOptions` `useMemo`, **append** LATAM currencies after the existing dollar options, with their respective flags and labels. Use a visual separator (e.g., a disabled option with "── Monedas LATAM ──" label, or a thin divider inside the `CustomSelect` dropdown)
- Update `getFlag()` to return the correct flag for LATAM codes
- Update the currency symbol logic (the `$` / `US$` / `€` / `R$` prefix on the input) to also handle MXN → `MX$`, COP → `COL$`, UYU → `UY$`, PEN → `S/`
- Update the output currency label (the `"USD"` / `"EUR"` / `"BRL"` / `"(ARS)"` text) to show `"MXN"`, `"COP"`, `"UYU"`, `"PEN"` accordingly
- The conversion math is identical: `isPesosTop ? amount / rate : amount * rate` — LATAM rates are already in ARS terms (ARS per 1 unit of foreign currency)
- **Do NOT change** any existing styles, layout, animations, or structure

### 6. CustomSelect Dropdown Enhancement

Add a **section divider** inside the dropdown to visually group currencies. Before the LATAM options, render a small non-clickable divider element like:

```tsx
<div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest" 
     style={{ color: "var(--text-muted)" }}>
  Monedas LATAM
</div>
```

This keeps the Wise.com-style grouped feel without changing the overall aesthetic.

## Constraints

- **DO NOT** modify any existing styles, colors, spacing, or layout
- **DO NOT** add any new npm dependencies
- **DO NOT** change any existing component's behavior for USD/EUR/BRL currencies
- **DO NOT** use `useEffect` for data fetching
- **DO NOT** use `any` types — everything must be strictly typed
- All user-facing text must be in **Spanish (es-AR)**
- Error handling: if LATAM fetch fails, converter still works with existing currencies (graceful degradation)
- Run `pnpm exec tsc --noEmit` after all changes to ensure zero TypeScript errors

## Files to Create/Modify

| Action | File |
|---|---|
| **NEW** | `lib/api/latam.ts` |
| MODIFY | `lib/types/index.ts` (add `LatamCurrencyRate`) |
| MODIFY | `lib/constants/display.ts` (add LATAM labels/flags/symbols) |
| MODIFY | `app/conversor/page.tsx` (fetch + pass LATAM data) |
| MODIFY | `app/components/conversor/CurrencyConverter.tsx` (accept LATAM prop, extend select options, update symbols/labels) |

## Verification

After implementation:
1. `pnpm exec tsc --noEmit` → 0 errors
2. `pnpm run dev` → no runtime errors
3. Open `/conversor` → dropdown should show existing currencies + "Monedas LATAM" divider + MXN, COP, UYU, PEN options
4. Select "Peso Mexicano" → enter 1000 ARS → shows conversion in MXN with `MX$` symbol
5. Swap button works correctly for LATAM currencies
6. If LATAM API is down, existing USD/EUR/BRL currencies still work
