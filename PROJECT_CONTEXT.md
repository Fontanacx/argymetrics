# ArgyMetrics — Project Context

> Updated 2026-11-03. Canonical reference for AI agents working on this codebase.
> **UI language: Spanish (es-AR).** All user-facing strings, labels, dates, and currency formatting must use Argentine Spanish locale (`es-AR`, timezone `America/Argentina/Buenos_Aires`).

---

## 1. What It Is

Real-time Argentine financial dashboard. Tracks USD/EUR/BRL exchange rates across parallel markets, crypto (BTC/ETH), virtual wallet dollars, Argentine stocks (BYMA), country risk, inflation, BCRA crawling bands, commodities, and official INDEC real-economy data (real wages, activity, baskets, poverty and regional IPC).

- **Users:** Argentine savers, freelancers, SMEs, finance enthusiasts.
- **Stack:** Next.js 16 App Router · TypeScript 5 · React 19 Server Components · Tailwind CSS 4 + CSS custom properties · Recharts · Lucide React · Inter font · pnpm · Vercel (ISR).
- **Architecture:** Server-first. No client-side fetching. No global state. Minimal `"use client"` components.

---

## 2. Dashboard Sections (app/page.tsx)

| Section | Key component | Content |
|---|---|---|
| **Market Ticker** | `MarketTicker` | Bloomberg-style scrolling strip: all rates, riesgo país, commodities, crypto, stocks |
| **Divisas** | `DollarGrid` → `DollarCard` | 13 exchange rate cards: Oficial, Mayorista, Blue, MEP, CCL, Cripto/USDT, Tarjeta, Euro (Oficial/Blue/Tarjeta), Real (Oficial/Blue/Tarjeta). Each shows buy/sell/spread, `VariationBadge`, 7-day `SparklineChart`, `InfoButton` → `IndicatorDetail` modal |
| **Billeteras Virtuales** | `DollarGrid` (reused) | Wallet dollar cards: AstroPay, Cocos, Lemon Cash, Belo, Buenbit, Ripio, Fiwind, SatoshiTango, Decrypto, Takenos and Wallbit. Uses generic cripto history for sparklines |
| **Real en billeteras** | `BrlWalletsSection` → `BrlWalletCard` | BRL/ARS PIX quotes from Mercado Pago, Belo, Lemon, AstroPay, Fiwind, SatoshiTango, Prex, Decrypto, Cocos, ARQ and Personal Pay. Shows "para pagar" and "para cobrar" |
| **Otras monedas** | `LatamCurrenciesSection` → `LatamCurrencyCard` | MXN, COP, UYU, PEN, CLP and PYG cross-rates in ARS. Same universe as the converter |
| **Indicadores** | `IndicatorsStrip` + `BandasIndicator` | Riesgo País, Inflación oficial (IPC INDEC + interanual/acumulada), Oro, Petróleo Brent, Gas Natural + BCRA band position bar |
| **Economía Real** | `MacroSection` + `RegionalInflationGrid` | Salario real vs IPC, actividad (EMAE), canasta básica (CBA/CBT), pobreza e indigencia (EPH) y IPC por región estadística del INDEC |
| **Acciones Argentinas** | `StockGrid` → `StockCard` | Top 10 BYMA stocks (GGAL, YPF, PAMP, BMA, CEPU, TXAR, ALUA, CRES, TGSU2, LOMA) with sparklines |
| **Criptomonedas** | `CryptoStrip` | BTC and ETH cards with history charts |

### Additional Pages

| Route | Description |
|---|---|
| `/conversor` | ARS ↔ Dollar converter using live server-fetched rates |
| `/insights` | **"Resumen del Día"** — Daily intelligent briefing with deterministic narrative engine, Semáforo (traffic-light status grid), profile-based tabs, and **Time Travel** date picker for historical analysis |

---

## 3. Data Sources & API Layer

All fetchers live in `lib/api/`. Components never call external APIs directly.

| Module | Source | Endpoints / Data |
|---|---|---|
| `dollars.ts` | DolarAPI (`dolarapi.com`) | `GET /v1/dolares` — all USD rates; `GET /v1/cotizaciones/eur` — Euro oficial. Synthesizes Euro Blue (×1.086), Euro Tarjeta (×1.6) |
| `wallets.ts` | CriptoYa | `GET /usdt/ars` filtered to wallet brokers (astropay, cocos, lemoncash, belo, buenbit) |
| `brl-wallets.ts` | ComparaPix (`api.comparapix.ar`) | `GET /quotes` — BRL/ARS PIX quotes from Mercado Pago, Belo, Lemon, AstroPay, Fiwind, SatoshiTango, Prex, Decrypto, Cocos, ARQ and Personal Pay |
| `historical.ts` | ArgentinaDatos (`api.argentinadatos.com`) | `GET /v1/cotizaciones/dolares/{casa}` — full daily price history per dollar type. Also: Real variants via Ámbito scraping |
| `indicators.ts` | INDEC / Ámbito / ArgentinaDatos / BCRA | Inflación (INDEC primary, ArgentinaDatos fallback), Riesgo País (Ámbito + ArgentinaDatos fallback), Reservas BCRA, Bandas (static constants + synthetic history) |
| `indec.ts` | INDEC API (`api.indec.gob.ar/v1`) | `ipc_nacional`, `indice_salarios`, `estimador-mensual-de-actividad-economica-nivel-general`, `valorizacion_canastas_cba_cbt`, `pobreza_eph`. **Requires server-side `INDEC_API_TOKEN` (JWT).** |
| `commodities.ts` | Yahoo Finance (`query1.finance.yahoo.com`) | GC=F (Gold), BZ=F (Brent), NG=F (Gas) — current price + 1Y daily history |
| `crypto.ts` | CriptoYa (`criptoya.com/api`) | BTC-USD, ETH-USD — current price + history |
| `stocks.ts` | Yahoo Finance | Top 10 BYMA tickers — price, variation, volume, 30-day history |
| `yahoo.ts` | Yahoo Finance | Shared helper for Yahoo chart API calls |

> **INDEC auth:** the API is in BETA and every data endpoint requires `Authorization: Bearer <JWT>`. The token lives only in `INDEC_API_TOKEN` (server-side). Never expose it with `NEXT_PUBLIC_`. If it is missing or the request fails, IPC falls back to ArgentinaDatos and the new macro cards degrade gracefully.

### Synthetic / Computed Data

- **Euro Blue:** Dolar Blue × 1.086 (EUR/USD cross approximation)
- **Euro Tarjeta:** Euro Oficial × 1.6 (60% tax surcharge)
- **Real variants:** Fetched from Ámbito (`mercados.ambito.com`)
- **Daily variation:** `((current.venta - previous.venta) / previous.venta) × 100`
- **Bandas Cambiarias:** Static BCRA values in `lib/constants/bandas.ts` (manually updated)

### ISR Revalidation

| Data | Seconds |
|---|---|
| Dollars | 0 (always fresh) |
| Crypto | 60 |
| Riesgo País | 120 |
| Stocks | 300 |
| Inflation / Historical | 3600 |
| INDEC monthly (IPC, salarios, EMAE, canastas) | 21600 (6 h) |
| INDEC poverty (EPH) | 86400 (24 h) |

---

## 4. Project Structure

```
argymetrics/
├── app/
│   ├── layout.tsx                    # Root: Inter font, SEO metadata, FOUC prevention
│   ├── page.tsx                      # Main dashboard (server component, parallel data fetching)
│   ├── loading.tsx                   # Suspense fallback with skeleton placeholders
│   ├── globals.css                   # Design system: CSS vars, dark/light mode, animations
│   ├── conversor/page.tsx            # Currency converter
│   ├── insights/page.tsx             # Daily briefing + Time Travel
│   └── components/
│       ├── layout/                   # Navbar, Footer, MarketTicker, SectionHeader
│       ├── dashboard/                # DollarGrid, DollarCard, BrlWalletsSection, BrlWalletCard, LatamCurrenciesSection, LatamCurrencyCard, IndicatorsStrip, BandasIndicator, MacroSection, RegionalInflationGrid, CardStylePicker, StockGrid, StockCard
│       ├── modals/                   # Modal, InfoButton, IndicatorDetail
│       ├── charts/                   # SparklineChart
│       ├── ui/                       # VariationBadge, skeletons (DollarGrid, IndicatorsStrip, Bandas)
│       ├── conversor/                # CurrencyConverter
│       ├── insights/                 # InsightsDashboard, BriefingCard, DatePicker, SemaforoCard/Grid, ProfileInsight, ProfileTabs
│       ├── CryptoStrip.tsx           # BTC/ETH section
│       ├── DailyInsights.tsx         # Orchestrator for insights page tabs
│       ├── HistorySection.tsx        # Historical data section
│       └── ThemeToggle.tsx           # Light/Dark/System theme cycler
├── lib/
│   ├── types/index.ts                # All TypeScript interfaces
│   ├── api/                          # dollars, historical, indicators, indec, brl-wallets, commodities, crypto, wallets, stocks, yahoo
│   ├── formatters/                   # currency.ts, date.ts, metrics.ts
│   ├── constants/                    # api.ts, display.ts, bandas.ts, definitions.ts
│   └── utils/                        # insights.ts, briefing-generator.ts, semaforo.ts
├── public/                           # Static assets
├── Claude.md                         # AI coding rules (architectural constraints)
└── PROJECT_CONTEXT.md                # This file
```

---

## 5. Architectural Rules

1. **Server-first:** All data fetching in async server components. No `useEffect` fetching. No client-side API calls.
2. **API layer isolation:** Components import typed functions from `lib/api/`. Never call external APIs directly.
3. **Client components only when necessary:** Only interactive UI needs `"use client"` (ThemeToggle, InfoButton, Modal, IndicatorDetail, SparklineChart, CurrencyConverter, DatePicker, DailyInsights, ProfileTabs, CryptoStrip).
4. **ISR caching:** All fetches use `{ next: { revalidate: N } }`.
5. **Type safety:** No `any`. No untyped responses. No unsafe casts. Types in `lib/types/index.ts`.
6. **Formatters:** All number/date/currency formatting through `lib/formatters/`. Never inline in components. Uses `Intl.NumberFormat("es-AR", ...)`.
7. **Error handling:** API functions never crash. Return `null`, `[]`, or `0` on failure. No unhandled exceptions that break SSR.
8. **Minimal dependencies:** Don't add packages if native JS or Next.js can do it.
9. **Development order:** Types → API layer → Formatters → Server component → UI component.

---

## 6. Design System

- **Aesthetic:** Fintech / Bloomberg. Professional, data-dense, information-first.
- **Theming:** CSS custom properties (`:root` / `.dark`). Not Tailwind dark mode classes. Dark mode default, respects system preference.
- **Tailwind CSS 4:** Layout utilities only (`flex`, `grid`, `gap`, `px-`, `rounded-`). Colors via CSS vars.
- **Color palette:** Muted semantic greens/reds. Accent: `#364fc7` (light) / `#748ffc` (dark).
- **Glass morphism:** Navbar uses `backdrop-blur-xl` with semi-transparent backgrounds.
- **Card presentation:** `CardStylePicker` lets users choose layout (`compact`, `classic`, `detailed`) and shape (`soft`, `round`, `square`). It persists in `localStorage` (`argymetrics-card-layout`, `argymetrics-card-shape`) and applies CSS variables through `data-card-layout` / `data-card-shape` on `<html>`. Dashboard cards opt in with the `.metric-card` class; compact mode hides `.metric-card-sparkline`, `.metric-card-extra` and `.metric-card-subtitle`.
- **Font:** Inter via `next/font/google`.
- **Icons:** Lucide React (consistent, clean).

---

## 7. Key Types

```typescript
type DollarCasa = "oficial" | "blue" | "bolsa" | "contadoconliqui" | "cripto" | "mayorista" | "tarjeta" | "euro" | "euroblue" | "eurotarjeta" | "astropay" | "cocos" | "lemoncash" | "belo" | "buenbit" | "real" | "realblue" | "realtarjeta";

interface DollarRate { moneda: string; casa: DollarCasa; nombre: string; compra: number; venta: number; fechaActualizacion: string; }
interface DollarHistoryEntry { fecha: string; compra: number; venta: number; casa?: DollarCasa; }
interface DollarWithHistory { rate: DollarRate; history: DollarHistoryEntry[]; variacion: number | null; }
interface RiesgoPais { fecha: string; valor: number; }
interface InflacionMensual { fecha: string; valor: number; interanual?: number; acumulada?: number; }
interface IpcRegional { region: string; fecha: string; mensual: number; interanual: number; acumulada: number | null; }
interface SalarioReal { fecha: string; mensual: number; interanual: number; nominalMensual: number; nominalInteranual: number; inflacionMensual: number; inflacionInteranual: number; }
interface ActividadEconomica { fecha: string; interanual: number; mensual: number; indice: number; }
interface CanastaBasica { fecha: string; cba: number; cbt: number; variacionMensual: number | null; variacionInteranual: number | null; }
interface Pobreza { fecha: string; periodo: string; pobrezaPersonas: number; pobrezaHogares: number; indigenciaPersonas: number; indigenciaHogares: number; provisorio: boolean; }
interface BrlWalletRate { id: string; nombre: string; compra: number | null; venta: number; fechaActualizacion: string; logo?: string; url?: string; hasFees: boolean; }
interface BandaCambiaria { piso: number; techo: number; fecha: string; }
interface CryptoRate { valor: number; variacion: number; fecha: string; }
interface StockData { symbol: string; name: string; price: number; variation: number | null; high: number; low: number; volume: number; history: StockHistoryEntry[]; updatedAt: string; }
interface BriefingInput { date: string; blue/oficial/mep/ccl/cripto: { value: number; variation: number | null }; brechaBlueOficial: number; riesgoPais: { value: number; weeklyChange: number | null }; inflacion: { value: number; date: string }; gold/brent: { value: number; variation: number | null }; stocks: { symbol: string; name: string; variation: number | null }[]; btc/eth: { value: number; variation: number | null }; wallets: { name: string; compra: number; venta: number }[]; ... }
interface SemaforoItem { label: string; status: "verde" | "amarillo" | "rojo"; titulo: string; descripcion: string; }
type HistoryRange = "7d" | "30d" | "90d" | "1y";
```

---

## 8. Key Constants

```typescript
DOLARAPI_BASE       = "https://dolarapi.com"
ARGENTINADATOS_BASE = "https://api.argentinadatos.com"
AMBITO_BASE         = "https://mercados.ambito.com"
CRIPTOYA_BASE       = "https://criptoya.com/api"
INDEC_BASE          = "https://api.indec.gob.ar/v1"
COMPARAPIX_BASE     = "https://api.comparapix.ar"

DISPLAYED_CASAS = ["oficial","mayorista","blue","bolsa","contadoconliqui","cripto","tarjeta","euro","euroblue","eurotarjeta","real","realblue","realtarjeta"]

STOCK_TICKERS = ["GGAL.BA","YPFD.BA","PAMP.BA","BMA.BA","CEPU.BA","TXAR.BA","ALUA.BA","CRES.BA","TGSU2.BA","LOMA.BA"]

HISTORY_DAYS = 7
```

---

## 9. Known Limitations

| Issue | Detail |
|---|---|
| Euro history synthetic | Multiplies Dollar history by fixed 1.086 EUR/USD cross. Can drift from actual rates. |
| Euro Tarjeta computed | Euro Oficial × 1.6. Actual tax rate may change. |
| Bandas static | Manually stored in `constants/bandas.ts`. Must be updated when BCRA changes them. |
| Yahoo Finance semi-public | Commodity/stock prices rely on Yahoo's chart API. Could block or change without notice. |
| Inflation lag | INDEC publishes IPC ~6 weeks after month-end. Always 1-2 months behind. |
| INDEC API BETA + JWT | All INDEC data endpoints require a JWT (`INDEC_API_TOKEN`). The service is BETA and has no SLA; IPC falls back to ArgentinaDatos, the rest of the macro cards hide gracefully. |
| IPC regional, not provincial | INDEC publishes six statistical regions (GBA, Pampeana, Noreste, Noroeste, Cuyo, Patagonia). The API does not expose province-level IPC. |
| Poverty scope | EPH poverty covers 31 urban agglomerations, not the whole country, and is published semiannually. |
| BRL wallet source | ComparaPix aggregates third-party PIX quotes. Some providers only publish a "para pagar" rate, fees may apply, and rates change every few minutes. |
| Riesgo País weekends | Only updates on business days. Weekends show last trading day's value. |
| No error boundaries | Fallback values used, but no dedicated error UI components. |
| Single locale | UI only in Spanish (es-AR). |
| No automated tests | No test suite. |
| Wallet history synthetic | Virtual wallet dollars use generic cripto dollar history for sparklines (no native wallet history API). |

---

*End of context.*
