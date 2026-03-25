# ArgyMetrics — Complete Project Context

> Generated 2026-03-17. Use this document to onboard any AI assistant or developer.

---

## 1. Project Overview

**ArgyMetrics** is a real-time financial dashboard for Argentina. It tracks USD exchange rates across multiple parallel markets, country-risk (Riesgo País), monthly inflation (IPC), BCRA crawling-band limits, and commodity prices (Gold & Brent Oil).

- **Purpose:** Provide a fast, minimal, professional single-page dashboard for Argentines who need to monitor the dollar gap, inflation, and country risk at a glance.
- **Target users:** Argentines saving in foreign currency, freelancers, SMEs, finance enthusiasts, and anyone affected by Argentina's multi-rate FX system.
- **Language:** Spanish (es-AR). The entire UI is in Spanish.
- **Live stack:** Deployed on **Vercel** with ISR (Incremental Static Regeneration).

---

## 2. Current Features Implemented

| Feature | Description |
|---|---|
| **Dollar Grid** | Cards for 9 exchange rates: Oficial, Blue, MEP, CCL, Cripto/USDT, Tarjeta, Euro Oficial, Euro Blue, Euro Tarjeta |
| **Buy/Sell/Spread** | Each card shows compra, venta, and the intra-rate spread |
| **Daily variation badges** | Color-coded ▲/▼ percentage change (green/red) |
| **7-day sparkline charts** | Tiny trend line on every dollar card |
| **Info modals** | Click ⓘ on any indicator for: definition, historical chart (7D/30D/90D/1Y), and metric cards (max, min, average, variation %) |
| **Blue–Oficial spread** | Brecha calculation inside Blue info modal (absolute + percentage) |
| **Indicators strip** | Riesgo País (EMBI), Inflación Mensual (IPC), Oro (Gold Futures), Petróleo Brent |
| **Commodity prices** | Gold (GC=F) and Brent Oil (BZ=F) with daily % change arrows |
| **Bandas Cambiarias** | Visual bar showing BCRA floor/ceiling and current official rate position |
| **Market ticker** | Bloomberg-style auto-scrolling strip at the top of the page with all rates, riesgo país, and commodities |
| **Currency converter** | Dedicated `/conversor` page for converting ARS ↔ any displayed dollar type |
| **Theme toggle** | Light / Dark / System — persisted to `localStorage`, with FOUC prevention script |
| **Navbar** | Sticky with frosted glass effect, branding, link to Conversor, and theme toggle |
| **Footer** | Attribution to DolarAPI & ArgentinaDatos, disclaimer, creator links |
| **Skeleton loading** | Shimmer placeholders for dollar grid and indicators while data loads |
| **SEO metadata** | Full OpenGraph, Twitter Card, keywords, robots, and semantic HTML |
| **ISR caching** | Server-side data refresh: dollars (60s), riesgo país (120s), inflation (1h), historical (1h), commodities (5min) |

---

## 3. Data Sources / APIs

### 3.1 DolarAPI (`https://dolarapi.com`)

| Endpoint | Data |
|---|---|
| `GET /v1/dolares` | All dollar exchange rates (oficial, blue, MEP, CCL, cripto, tarjeta, mayorista) |
| `GET /v1/dolares/{casa}` | Single dollar type rate |
| `GET /v1/cotizaciones/eur` | Euro oficial rate (used to compute Euro + Euro Tarjeta) |

### 3.2 ArgentinaDatos (`https://api.argentinadatos.com`)

| Endpoint | Data |
|---|---|
| `GET /v1/cotizaciones/dolares/{casa}` | Historical daily prices for a dollar type (full history) |
| `GET /v1/finanzas/indices/riesgo-pais/ultimo` | Latest EMBI country risk value |
| `GET /v1/finanzas/indices/riesgo-pais` | Full daily riesgo país history |
| `GET /v1/finanzas/indices/inflacion` | Full monthly inflation (IPC) history |

### 3.3 Yahoo Finance (`https://query1.finance.yahoo.com/v8/finance/chart`)

| Symbol | Data |
|---|---|
| `GC=F` | Gold Futures — current price + 1Y daily history |
| `BZ=F` | Brent Crude Oil — current price + 1Y daily history |

### 3.4 Synthetic / computed data

- **Euro Blue:** Dolar Blue × 1.086 (approximate EUR/USD cross rate)
- **Euro Tarjeta:** Euro Oficial × 1.6 (60% tax surcharge)
- **Daily variation %:** `((current.venta - previous.venta) / previous.venta) × 100` computed from history
- **Bandas Cambiarias:** Static BCRA-published values in constants (not fetched from an API)

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI library** | React 19 (Server Components by default) |
| **Styling** | Tailwind CSS 4 + CSS custom properties design system |
| **Charts** | Recharts 3.8 (AreaChart, LineChart) |
| **Icons** | Lucide React |
| **HTTP** | Native `fetch` with ISR `revalidate` (no Axios at runtime — Axios is a dependency but unused in final code) |
| **Font** | Inter (via `next/font/google`) |
| **Deployment** | Vercel |
| **Package manager** | pnpm |
| **Build tool** | Next.js built-in (Turbopack in dev) |
| **State management** | None. Server-first architecture with no global client state |

---

## 5. Project Architecture

```
argymetrics/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout: Inter font, SEO metadata, FOUC script
│   ├── page.tsx                # Main dashboard (server component, fetches all data)
│   ├── loading.tsx             # Suspense fallback with skeleton placeholders
│   ├── globals.css             # Full design system (CSS vars, dark mode, animations)
│   ├── conversor/
│   │   └── page.tsx            # Currency converter page
│   └── components/
│       ├── layout/
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   ├── MarketTicker.tsx
│       │   ├── SectionHeader.tsx
│       │   └── index.ts
│       ├── dashboard/
│       │   ├── DollarGrid.tsx
│       │   ├── DollarCard.tsx
│       │   ├── IndicatorsStrip.tsx
│       │   ├── BandasIndicator.tsx
│       │   ├── StockGrid.tsx
│       │   ├── StockCard.tsx
│       │   └── index.ts
│       ├── modals/
│       │   ├── Modal.tsx
│       │   ├── InfoButton.tsx
│       │   ├── IndicatorDetail.tsx
│       │   └── index.ts
│       ├── charts/
│       │   ├── SparklineChart.tsx
│       │   └── index.ts
│       ├── ui/
│       │   ├── VariationBadge.tsx
│       │   ├── DollarGridSkeleton.tsx
│       │   ├── IndicatorsStripSkeleton.tsx
│       │   ├── BandasIndicatorSkeleton.tsx
│       │   └── index.ts
│       └── conversor/
│           ├── CurrencyConverter.tsx
│           └── index.ts
├── lib/
│   ├── types/
│   │   └── index.ts             # All TypeScript interfaces & types
│   ├── api/
│   │   ├── dollars.ts           # Fetch current dollar rates from DolarAPI
│   │   ├── historical.ts        # Fetch historical data from ArgentinaDatos
│   │   ├── indicators.ts        # Fetch riesgo país, inflation, bandas
│   │   └── commodities.ts       # Fetch Gold & Brent from Yahoo Finance
│   ├── formatters/
│   │   ├── currency.ts          # formatARS, formatPercent, formatPoints, formatSpread
│   │   ├── date.ts              # formatRelativeTime, formatShortDate, formatMonthYear, formatDateOnly
│   │   └── metrics.ts           # computeMetrics (high, low, avg, change%)
│   └── constants/
│       ├── api.ts
│       ├── display.ts
│       ├── bandas.ts
│       ├── index.ts
│       └── definitions.ts       # Financial definitions for info modals
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── Claude.md                    # AI coding rules & architectural constraints
```

### Key architectural rules

1. **Server-first:** All data fetching is done in server components via `async` functions. No `useEffect` fetching.
2. **API layer isolation:** Components never call external APIs directly — they import typed functions from `lib/api/`.
3. **Client components only when necessary:** Only `ThemeToggle`, `InfoButton`, `Modal`, `IndicatorDetail`, `SparklineChart`, and `CurrencyConverter` are `"use client"`.
4. **ISR caching:** All fetches use `{ next: { revalidate: N } }` for automatic server-side caching.
5. **Type safety:** No `any`, no untyped responses, no unsafe casts.
6. **Formatters:** All number/date formatting goes through `lib/formatters/` — never inline in components.

---

## 6. Important Components

### `Navbar` (server)
Sticky top nav with frosted glass effect (`backdrop-blur-xl`). Contains branding ("ArgyMetrics"), link to `/conversor`, and `ThemeToggle`.

### `Footer` (server)
Attribution to DolarAPI and ArgentinaDatos, financial disclaimer, creator credits (FontanacDev), and social links.

### `MarketTicker` (server)
Bloomberg-style auto-scrolling horizontal strip showing all dollar rates, riesgo país, and commodities with ▲/▼ percentage indicators. Renders items twice for seamless infinite CSS animation. Pauses on hover.

### `DollarCard` (server)
Card for a single dollar type. Displays: label + `InfoButton`, `VariationBadge`, sell price (large), buy/sell/spread row, 7-day `SparklineChart`. Receives full history for the info modal.

### `DollarGrid` (server)
Responsive CSS grid (`1→2→4 cols`) rendering a `DollarCard` for each displayed dollar type. Computes Blue–Oficial spread and passes it to the Blue card. Shows a fallback message if no data.

### `IndicatorsStrip` (server)
4-card grid showing Riesgo País, Inflación Mensual, Oro, and Petróleo Brent. Each card has an icon, current value, date/variation, and an `InfoButton` opening `IndicatorDetail`.

### `IndicatorDetail` (client)
Rich modal content rendered inside `Modal` via `InfoButton`. Supports 4 indicator kinds: `"dollar"`, `"riesgo"`, `"inflacion"`, `"commodity"`. Features:
- Financial definition text
- Spread indicator (Blue only)
- Range selector (7D/30D/90D/1Y for dollars; 12M/24M/All for inflation)
- Recharts `AreaChart` with gradient fill
- Metric cards (max, min, average, variation %)

### `BandasIndicator` (server)
Displays BCRA crawling-band floor and ceiling with a horizontal progress bar showing where the current official rate sits relative to the band range.

### `Modal` (client)
Generic reusable modal overlay with backdrop blur, close button, Escape key support, and body scroll lock. Uses CSS `animate-fade-in`.

### `SparklineChart` (client)
Tiny 40px-tall Recharts `LineChart` with no axes. Color depends on whether the daily trend is positive (green) or negative (red).

### `ThemeToggle` (client)
Cycles through light → dark → system. Persists to `localStorage` under `argymetrics-theme`. Listens for system preference changes in "system" mode. Icons: Sun/Moon/Monitor.

### `VariationBadge` (server)
Inline styled badge showing `▲ +X.X%` / `▼ -X.X%` / `-- --` with semantic colors (green/red/gray) and matching background tints.

### `CurrencyConverter` (client)
ARS ↔ Dollar converter on the `/conversor` page. Uses live rates from the server-fetched data.

---

## 7. Current UX Design Philosophy

- **Fintech / Bloomberg aesthetic:** Professional, data-dense, information-first design.
- **Minimal UI:** No heavy frameworks, no decorative elements, no animations except subtle fade-ins and the ticker scroll.
- **CSS Custom Properties design system:** Full light/dark mode via `:root` and `.dark` CSS variables — not Tailwind dark mode classes.
- **Tailwind CSS 4:** Used for layout utilities (`flex`, `grid`, `gap`, `px-`, `rounded-`, etc.) alongside CSS variables for colors.
- **Lucide icons:** Consistent, clean icon set (`TrendingUp`, `AlertTriangle`, `Info`, `Sun`, `Moon`, etc.).
- **Inter font:** Clean, modern, web-optimized via `next/font/google`.
- **Dark mode by default:** Respects system preference, with manual override.
- **Glass morphism:** Navbar uses `backdrop-blur-xl` with semi-transparent backgrounds.
- **Color palette:** Muted greens/reds for semantic meaning; indigo accent (`#364fc7` light / `#748ffc` dark).

---

## 8. Pending Improvements

The following features are planned or would improve the project:

- **Additional dollar types:** Dolar Mayorista card, more Euro variants.
- **Interannual inflation:** Show accumulated 12-month inflation and annual trend.
- **More commodities:** Soy, Corn, and other Argentina-relevant commodities.
- **MERVAL / Stock index:** Buenos Aires stock exchange index tracking.
- **Push notifications / alerts:** Configurable price alerts when Blue crosses a threshold.
- **PWA support:** Offline capability and "Add to Home Screen".
- **Error boundaries:** Component-level error handling with user-friendly fallback UI.
- **Automated tests:** Unit tests for formatters and API functions; E2E tests for key flows.
- **API rate-limit handling:** More robust retry logic with exponential backoff.
- **URL-based range selection:** Share a direct link to a specific chart range.
- **i18n:** Optional English localization.
- **Accessibility audit:** ARIA roles, keyboard navigation, screen reader optimization.
- **Historical analytics page:** Dedicated `/analytics` route with full-screen charts and data tables.

---

## 9. Known Issues or Limitations

| Issue | Details |
|---|---|
| **Euro history is synthetic** | ArgentinaDatos lacks Euro historical endpoints. Euro histories are synthesized by multiplying Dollar histories by a fixed 1.086 EUR/USD cross rate. This can drift from actual market rates. |
| **Euro Tarjeta is computed** | Calculated as Euro Oficial × 1.6 (60% tax). The actual tax rate may change. |
| **Bandas are static** | BCRA band values are manually stored in `constants.ts` and must be updated manually when the BCRA changes them. |
| **Yahoo Finance scraping** | Commodity prices rely on Yahoo Finance's semi-public chart API, which could block requests or change without notice. A custom User-Agent header is used to mitigate. |
| **Inflation publication lag** | INDEC publishes IPC data ~6 weeks after month-end. The latest inflation entry will always be 1-2 months behind. This is expected. |
| **Riesgo País weekends** | Country risk data only updates on business days. Weekend/holiday data shows the last trading day's value. |
| **No error boundaries** | If a server fetch fails, fallback values (`null`, `[]`) are used, but there are no dedicated error UI components. |
| **Single-locale** | The UI is only in Spanish (es-AR). |
| **No automated tests** | The project currently has no test suite. |

---

## 10. Short Code Examples

### 10.1 Fetching dollar rates (server-side with ISR)

```typescript
// lib/api/dollars.ts
export async function fetchAllDollars(): Promise<DollarRate[]> {
  const [dolaresRes, euroOficialRes] = await Promise.all([
    fetch(`${DOLARAPI_BASE}/v1/dolares`, { next: { revalidate: 60 } }),
    fetch(`${DOLARAPI_BASE}/v1/cotizaciones/eur`, { next: { revalidate: 60 } }),
  ]);

  if (!dolaresRes.ok) return [];
  const data: DollarRate[] = await dolaresRes.json();

  // Synthesize Euro Blue from Dolar Blue
  const dolarBlue = data.find((d) => d.casa === "blue");
  if (dolarBlue) {
    data.push({
      ...dolarBlue,
      casa: "euroblue",
      nombre: "Euro Blue",
      compra: Number((dolarBlue.compra * 1.086).toFixed(2)),
      venta: Number((dolarBlue.venta * 1.086).toFixed(2)),
    });
  }

  return data.filter((rate) => DISPLAYED_CASAS.includes(rate.casa));
}
```

### 10.2 Main page data orchestration

```typescript
// app/page.tsx — All data fetched server-side in parallel
export default async function Home() {
  const [dollars, riesgoPais, inflacion, blueHistory, ...rest] =
    await Promise.all([
      fetchDollarsWithHistory(),
      fetchRiesgoPais(),
      fetchInflacion(),
      fetchFullDollarHistory("blue"),
      fetchFullDollarHistory("oficial"),
      fetchRiesgoPaisHistory(),
      fetchInflacionHistory(),
      fetchAllDollars(),
      fetchCommodities(),
      // ...more
    ]);

  return (
    <div>
      <MarketTicker rates={allRates} riesgoPais={riesgoPais} commodities={commodities} />
      <Navbar />
      <DollarGrid dollars={dollars} histories={histories} />
      <IndicatorsStrip riesgoPais={riesgoPais} inflacion={inflacion} ... />
      <BandasIndicator bandas={bandas} cotizacionActual={oficialRate} />
      <Footer />
    </div>
  );
}
```

### 10.3 Computing daily variation

```typescript
// lib/api/historical.ts
function computeVariation(history: DollarHistoryEntry[]): number | null {
  if (history.length < 2) return null;
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  if (!current.venta || !previous.venta || previous.venta === 0) return null;
  const variation = ((current.venta - previous.venta) / previous.venta) * 100;
  return Number.isFinite(variation) ? Math.round(variation * 100) / 100 : null;
}
```

### 10.4 Formatting utilities

```typescript
// lib/formatters/currency.ts
export function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);
  // 1415.5 → "$ 1.415,50"
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("es-AR", {
    style: "decimal", signDisplay: "always",
    minimumFractionDigits: 1, maximumFractionDigits: 1,
  }).format(value)}%`;
  // 2.45 → "+2,5%"
}
```

### 10.5 Chart in IndicatorDetail modal

```tsx
// app/components/IndicatorDetail.tsx (client component)
<ResponsiveContainer width="100%" height={220}>
  <AreaChart data={chartData}>
    <defs>
      <linearGradient id="modal-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
        <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis dataKey="fecha" tickFormatter={formatLabel} />
    <YAxis domain={["auto", "auto"]} tickFormatter={(v) => getYAxisLabel(kind, v)} />
    <Tooltip formatter={(value) => [formatValue(Number(value)), label]} />
    <Area type="monotone" dataKey="value" stroke={strokeColor}
          fill="url(#modal-gradient)" dot={false} isAnimationActive={false} />
  </AreaChart>
</ResponsiveContainer>
```

### 10.6 CSS Design System (design tokens)

```css
/* app/globals.css — Light theme vars */
:root {
  --bg-primary: #f8f9fa;
  --bg-card: #ffffff;
  --text-primary: #212529;
  --color-positive: #2b8a3e;
  --color-negative: #c92a2a;
  --color-accent: #364fc7;
}

/* Dark theme overrides */
.dark {
  --bg-primary: #0c0d0f;
  --bg-card: #1a1b1e;
  --text-primary: #e9ecef;
  --color-positive: #51cf66;
  --color-negative: #ff6b6b;
  --color-accent: #748ffc;
}
```

---

## 11. Key Constants Reference

```typescript
// lib/constants.ts
DOLARAPI_BASE       = "https://dolarapi.com"
ARGENTINADATOS_BASE = "https://api.argentinadatos.com"

REVALIDATE_DOLLARS     = 60     // 1 min
REVALIDATE_RIESGO_PAIS = 120    // 2 min
REVALIDATE_INFLACION   = 3600   // 1 hour
REVALIDATE_HISTORICAL  = 3600   // 1 hour

DISPLAYED_CASAS = ["oficial","blue","bolsa","contadoconliqui","cripto","tarjeta","euro","euroblue","eurotarjeta"]

BANDAS = { piso: 855.26, techo: 1632.48, fechaActualizacion: "2026-03-16" }

HISTORY_DAYS = 7  // sparkline window
```

---

## 12. TypeScript Interfaces (key types)

```typescript
// lib/types/index.ts
interface DollarRate { moneda: string; casa: DollarCasa; nombre: string; compra: number; venta: number; fechaActualizacion: string; }
type DollarCasa = "oficial" | "blue" | "bolsa" | "contadoconliqui" | "cripto" | "mayorista" | "tarjeta" | "euro" | "euroblue" | "eurotarjeta";
interface DollarHistoryEntry { fecha: string; compra: number; venta: number; casa?: DollarCasa; }
interface DollarWithHistory { rate: DollarRate; history: DollarHistoryEntry[]; variacion: number | null; }
interface RiesgoPais { fecha: string; valor: number; }
interface InflacionMensual { fecha: string; valor: number; }
interface BandaCambiaria { piso: number; techo: number; fecha: string; }
interface HistoryMetrics { high: number; low: number; average: number; changePercent: number; }
type HistoryRange = "7d" | "30d" | "90d" | "1y";
```

---

*End of context document.*
