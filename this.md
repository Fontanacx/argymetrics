# Task: Rebuild the "Resumen del Día" Page — ArgyMetrics

## Context
You are working on ArgyMetrics, a Next.js 15+ / TypeScript / Tailwind CSS 4 financial dashboard.
Read `PROJECT_CONTEXT.md` and `Claude.md` before making any change.
The current `/insights` page exists but is basic. This task rebuilds it into a premium "Briefing Diario" experience.

## Strict Architectural Rules (DO NOT VIOLATE)
1. Server-first: ALL data fetching in server components. No `useEffect` for fetching.
2. API layer isolation: only `lib/api/` functions call external APIs.
3. Client components ONLY for interactivity (tab switching, tooltips).
4. ISR caching on every `fetch` with `{ next: { revalidate: N } }`.
5. No `any`, no untyped responses, no unsafe casts.
6. All formatting through `lib/formatters/` — never inline.
7. CSS variables only — no hardcoded colors. Use `var(--color-positive)`, `var(--color-negative)`, `var(--color-accent)`, `var(--text-secondary)`, etc.
8. Design must match existing fintech aesthetic (Bloomberg-style, data-dense, professional).

## Goal
Replace the current `/insights` page content with a three-block "Briefing Diario Inteligente" built entirely from the data already available in the project — no external AI API, no additional cost, 100% deterministic.

The three blocks are:
1. **Semáforo de Contexto** — 5 qualitative status indicators with historical context
2. **Briefing Narrativo** — Auto-generated paragraph built from live data using string templates
3. **Conclusión por Perfil** — 3 tabs (Freelancer / Ahorrista / Inversor) with actionable takeaways

---

## Data Available (already fetched in the project)
The page has access to all data already used in the main dashboard:
- `dollars`: all exchange rates with daily variation (Blue, Oficial, MEP, CCL, Cripto, Tarjeta, etc.)
- `riesgoPais`: current value + history
- `inflacion`: latest monthly IPC value + history
- `commodities`: Gold, Brent Oil prices + daily variation
- `stocks`: Argentine stocks from BYMA (GGAL, YPFD, PAMP, etc.) with price + variation
- `blueHistory` / `oficialHistory`: 30-day history for 7-day average calculations

All fetched server-side in `app/insights/page.tsx` using existing functions from `lib/api/`.

---

## Step 1 — lib/types/index.ts (MODIFY)

Add these two interfaces:

```typescript
export interface BriefingInput {
  date: string;                        // today formatted as "lunes 24 de marzo de 2026"
  blue: { value: number; variation: number | null };
  oficial: { value: number; variation: number | null };
  mep: { value: number; variation: number | null };
  ccl: { value: number; variation: number | null };
  cripto: { value: number; variation: number | null };
  brechaBlueOficial: number;           // percentage
  brechaBlueYesterday: number | null;  // to compare direction
  riesgoPais: { value: number; weeklyChange: number | null };
  inflacion: { value: number; date: string };
  gold: { value: number; variation: number | null };
  brent: { value: number; variation: number | null };
  stocks: {
    symbol: string;
    name: string;
    variation: number | null;
  }[];
  stocksEnVerde: number;   // count of stocks with positive variation
  stocksEnRojo: number;    // count of stocks with negative variation
  mep7dAverage: number | null; // 7-day average of MEP for freelancer comparison
}

export interface SemaforoItem {
  label: string;
  status: "verde" | "amarillo" | "rojo";
  titulo: string;
  descripcion: string;
}
```

---

## Step 2 — lib/utils/semaforo.ts (NEW FILE)

Create `computeSemaforo(data: BriefingInput): SemaforoItem[]`.

Returns exactly 5 items in this order:

### 1. Mercado Cambiario
Based on `data.brechaBlueOficial`:
- `verde` → brecha < 5% · titulo: "TRANQUILO"
- `amarillo` → brecha 5%–15% · titulo: "MODERADO"
- `rojo` → brecha > 15% · titulo: "TENSIÓN"

descripcion: `"Brecha Blue–Oficial en X.X% · [subió/bajó/sin cambios] vs ayer"`
Compare with `brechaBlueYesterday` to determine direction.

### 2. Riesgo País
Based on `data.riesgoPais.value`:
- `verde` → < 500 pts · titulo: "BAJO"
- `amarillo` → 500–900 pts · titulo: "MODERADO"
- `rojo` → > 900 pts · titulo: "ALTO"

descripcion: `"X pts · [subió/bajó] X% esta semana"` (use `weeklyChange` if available, otherwise omit trend)

### 3. Criptomonedas
Based on absolute spread between `data.blue.value` and `data.cripto.value` as percentage:
- `verde` → diferencia < 1% · titulo: "ALINEADO"
- `amarillo` → diferencia 1%–3% · titulo: "DIVERGENCIA LEVE"
- `rojo` → diferencia > 3% · titulo: "DIVERGENCIA ALTA"

descripcion: `"Blue y Cripto con X.X% de diferencia"`

### 4. Inflación
Based on `data.inflacion.value` (monthly IPC %):
- `verde` → < 3% · titulo: "CONTENIDA"
- `amarillo` → 3%–6% · titulo: "MODERADA"
- `rojo` → > 6% · titulo: "ELEVADA"

descripcion: `"IPC X.X% mensual · dato de [mes año]"`

### 5. Acciones BYMA
Based on `data.stocksEnVerde` out of 10:
- `verde` → 7–10 en verde · titulo: "POSITIVO"
- `amarillo` → 4–6 · titulo: "MIXTO"
- `rojo` → 0–3 · titulo: "NEGATIVO"

Find the top gainer (highest positive variation) and top loser.
descripcion:
- If verde: `"X/10 acciones en verde · [TICKER] lidera (+X.X%)"`
- If amarillo: `"Mercado mixto · [TICKER] +X.X% · [TICKER] -X.X%"`
- If rojo: `"X/10 acciones en rojo · [TICKER] la mayor caída (-X.X%)"`

---

## Step 3 — lib/utils/briefing-generator.ts (NEW FILE)

Create `generateBriefingText(data: BriefingInput): string`.

This function builds a 3-sentence paragraph in Spanish using string interpolation from live data. No external API. No randomness. Pure deterministic logic.

### Structure of the paragraph (always 3 sentences):

**Sentence 1 — Mercado cambiario:**
Template logic:
- If brecha < 5%: `"El mercado cambiario opera tranquilo este [día], con una brecha Blue–Oficial del [X.X%], la más baja en lo que va de la semana."`
- If brecha 5–15%: `"El mercado cambiario muestra tensión moderada este [día], con una brecha Blue–Oficial del [X.X%] entre el dólar blue a $[X] y el oficial a $[X]."`
- If brecha > 15%: `"El mercado cambiario presenta tensión elevada este [día]: la brecha Blue–Oficial alcanza el [X.X%], con el blue a $[X] frente al oficial a $[X]."`

**Sentence 2 — Indicadores macro:**
Always: `"El Riesgo País se ubica en [X] puntos y la inflación mensual más reciente fue del [X.X%] ([mes])."`
If gold variation is notable (abs > 1%): append `" El oro [sube/baja] un [X.X%] en el mercado internacional."`

**Sentence 3 — BYMA:**
- If stocksEnVerde >= 7: `"En el mercado bursátil, [X] de 10 acciones cierran en verde, con [TICKER] liderando las subidas con un [+X.X%]."`
- If stocksEnVerde <= 3: `"En el mercado bursátil, la jornada es negativa: [X] de 10 acciones operan en rojo, con [TICKER] registrando la mayor caída ([X.X%])."`
- If mixed: `"En el mercado bursátil, la jornada es mixta: [TICKER] sube [+X.X%] mientras que [TICKER] retrocede [X.X%]."`

The `[día]` should use the day of week from `data.date` (e.g. "lunes", "martes", etc.).
Use `formatARS()` and `formatPercent()` from `lib/formatters/` for all number formatting.

---

## Step 4 — app/insights/page.tsx (MODIFY)

Fetch all data in parallel using `Promise.all`. Add `fetchFullDollarHistory("blue")` and `fetchFullDollarHistory("oficial")` if not already present.

Build the `BriefingInput` object server-side from the raw fetched data:
- Compute `brechaBlueOficial` as `((blue.venta - oficial.venta) / oficial.venta) * 100`
- Compute `brechaBlueYesterday` from the second-to-last entry in blueHistory vs oficialHistory
- Compute `mep7dAverage` as the average of the last 7 entries in MEP history
- Compute `stocksEnVerde` / `stocksEnRojo` by counting positive/negative variations in stocks array
- Format `date` using `new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })`

Call both utility functions server-side:
```typescript
const semaforoItems = computeSemaforo(briefingInput);
const briefingText = generateBriefingText(briefingInput);
```

Pass everything to `<InsightsDashboard>`.

Page layout:
```tsx
<main>
  <SectionHeader
    icon={BarChart2}
    title="Resumen del Día"
    subtitle="Análisis del mercado argentino"
  />
  <InsightsDashboard
    briefingInput={briefingInput}
    semaforoItems={semaforoItems}
    briefingText={briefingText}
  />
</main>
```

---

## Step 5 — app/components/insights/ (NEW FOLDER)

### `InsightsDashboard.tsx` ("use client")
Main container. Manages active profile tab with `useState`.
Props: `briefingInput: BriefingInput`, `semaforoItems: SemaforoItem[]`, `briefingText: string`.
Layout (vertical stack, full width, consistent gap with rest of dashboard):
1. `<SemaforoGrid items={semaforoItems} />`
2. `<BriefingCard text={briefingText} date={briefingInput.date} />`
3. `<ProfileTabs briefingInput={briefingInput} />`

### `SemaforoGrid.tsx`
Responsive grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`.
Maps `items` to `<SemaforoCard>`.

### `SemaforoCard.tsx`
Props: `item: SemaforoItem`.

Layout:
- Top row: colored status dot + `item.titulo` in bold uppercase
- Middle: `item.label` in muted text (`var(--text-secondary)`)
- Bottom: `item.descripcion` in small text

Status colors using CSS variables:
```
verde   → var(--color-positive)
amarillo → #f59e0b  (use as CSS variable if available, otherwise inline only for this color)
rojo    → var(--color-negative)
```

Background tint: apply the status color at 8% opacity as card background.
Use `var(--bg-card)` as base with a subtle colored overlay — implement via Tailwind `bg-opacity` or inline style, do not hardcode hex backgrounds.

### `BriefingCard.tsx`
Props: `text: string`, `date: string`.

Layout:
- Header row: `BarChart2` icon + "Análisis del Día" title + `date` on the right in muted text
- Body: `text` paragraph, `text-base`, comfortable `leading-relaxed`
- Footer: "Generado automáticamente con los datos del día" in `var(--text-secondary)` small text
- Card background: `var(--bg-card)` with subtle left border using `var(--color-accent)`

### `ProfileTabs.tsx` ("use client")
Props: `briefingInput: BriefingInput`.
Three tabs: `💼 Freelancer` · `🏦 Ahorrista` · `📈 Inversor`
Active tab managed with `useState<"freelancer" | "ahorrista" | "inversor">`.
Tab bar styling: consistent with existing UI — use `var(--color-accent)` for active indicator.
Renders `<ProfileInsight profile={activeTab} data={briefingInput} />`.

### `ProfileInsight.tsx`
Props: `profile: "freelancer" | "ahorrista" | "inversor"`, `data: BriefingInput`.

**💼 Freelancer**
Show: MEP, CCL, Blue current values formatted with `formatARS()`.
Compare `data.mep.value` vs `data.mep7dAverage`:
- If MEP > 7d average by > 1%: conclusion `"✅ Buen momento para cobrar — el MEP está [X.X%] por encima del promedio de los últimos 7 días."` in `var(--color-positive)`
- If within 1%: conclusion `"⚠️ El MEP está en línea con el promedio semanal. Podés cobrar sin apuro."` in neutral color
- If MEP < 7d average by > 1%: conclusion `"⏳ El MEP está por debajo del promedio semanal. Conviene esperar si podés."` in `var(--color-negative)`

**🏦 Ahorrista**
Show: brecha Blue–Oficial, Riesgo País value, last inflation value.
Conclusion logic:
- If brecha < 5% AND riesgoPais < 700: `"✅ Momento tranquilo. La brecha está calma y el riesgo país controlado."`
- If riesgoPais > 900 OR brecha > 15%: `"⚠️ Señales de tensión. Mejor mantener posiciones y no tomar decisiones apresuradas."`
- Otherwise: `"📊 Mercado estable pero con variables a monitorear. Seguí de cerca el riesgo país."`

**📈 Inversor**
Show: top 3 BYMA movers (by absolute variation), Gold and Brent variations.
Find best performer and worst performer across all stocks.
Conclusion:
- If stocksEnVerde >= 7: `"✅ Jornada positiva en BYMA. [TICKER] lidera con +[X.X%]. Buen clima para revisar posiciones."`
- If stocksEnVerde <= 3: `"⚠️ Jornada negativa en BYMA. [TICKER] la mayor caída con [X.X%]. Cautela recomendada."`
- Otherwise: `"📊 Jornada mixta. Selectividad clave: [TICKER] sube [X.X%] mientras [TICKER] retrocede [X.X%]."`

---

## Step 6 — app/components/insights/index.ts (NEW FILE)

```typescript
export { InsightsDashboard } from './InsightsDashboard';
export { SemaforoGrid } from './SemaforoGrid';
export { SemaforoCard } from './SemaforoCard';
export { BriefingCard } from './BriefingCard';
export { ProfileTabs } from './ProfileTabs';
export { ProfileInsight } from './ProfileInsight';
```

---

## Verification Checklist (run in order)

1. `pnpm run build` — 0 TypeScript errors, 0 missing modules.
2. `pnpm run dev` → open `http://localhost:3000/insights`:
   - [ ] Semáforo de 5 indicadores renderiza con colores correctos (verde/amarillo/rojo).
   - [ ] El estado de BYMA refleja el conteo real de acciones en verde/rojo del día.
   - [ ] BriefingCard muestra el párrafo de 3 oraciones con datos reales (no placeholders).
   - [ ] Los valores en el párrafo están formateados en español ($ 1.425,00 no $1425).
   - [ ] Los 3 tabs switchean sin errores.
   - [ ] Freelancer tab muestra comparación vs promedio 7 días del MEP.
   - [ ] Ahorrista tab muestra brecha + riesgo país + inflación con conclusión.
   - [ ] Inversor tab muestra top movers de BYMA + commodities con conclusión.
   - [ ] Dark mode respetado en todos los componentes nuevos.
   - [ ] Mobile: semáforo en 2 columnas, tabs apilados correctamente.
   - [ ] Cero colores hardcodeados — solo CSS variables.
   - [ ] No hay ninguna llamada a API externa de IA — todo es lógica local.
