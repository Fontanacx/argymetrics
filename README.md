# ArgyMetrics

**Dashboard financiero en tiempo real para Argentina y mercados globales.**

[![Deploy](https://img.shields.io/badge/live-argymetrics.vercel.app-blue)](https://argymetrics.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## Datos en vivo

| Categoria | Fuente | Revalidacion |
|---|---|---|
| Divisas (Blue, Oficial, MEP, CCL, Cripto, Tarjeta, Euro, Real) | DolarAPI | 0s (always fresh) |
| Riesgo Pais, Inflacion (IPC), Reservas BCRA | ArgentinaDatos / Ambito / BCRA | 2 min |
| Criptomonedas (BTC, ETH) | Yahoo Finance | 1 min |
| Commodities (Oro, Brent, Gas Natural) | Yahoo Finance | 5 min |
| Acciones Argentinas (11 empresas BYMA) | Yahoo Finance | 5 min |
| Acciones Internacionales (7 empresas NASDAQ/KRX) | Yahoo Finance | 5 min |
| Indices (Merval, S&P 500, Nasdaq, Dow Jones) | Yahoo Finance | 5 min |
| Billeteras Virtuales (AstroPay, Lemon, Belo, etc.) | CriptoYa | 1 min |
| Monedas LATAM (MXN, COP, UYU, PEN, CLP, PYG) | DolarAPI / ER-API | 1 min |

## Acciones

### Internacionales (NASDAQ / KRX)
`AAPL` Apple · `NVDA` Nvidia · `MSFT` Microsoft · `SAMSUNG` Samsung · `TSLA` Tesla · `SPCX` SpaceX · `MU` Micron

### Argentinas (BYMA)
`GGAL` Grupo Galicia · `YPFD` YPF · `PAMP` Pampa Energia · `BMA` Banco Macro · `CEPU` Central Puerto · `TXAR` Ternium · `ALUA` Aluar · `CRES` Cresud · `TGSU2` TGS · `LOMA` Loma Negra · `MELI` Mercado Libre

## Arquitectura

- **Server-first**: React Server Components, zero client-side fetching
- **Typescript estricto**: sin `any`, tipos unificados en `lib/types/index.ts`
- **API layer**: toda la logica de fetching en `lib/api/`, nunca en componentes
- **ISR caching**: `fetch({ next: { revalidate } })` por fuente de datos
- **Safe fallbacks**: API errors devuelven `null`, `[]`, `0` — nunca crashea SSR
- **Logos locales**: 18 logos corporativos servidos desde `/public/logos/` (SVG + PNG), sin dependencias externas

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 16 (App Router) | Framework, SSR, ISR |
| TypeScript 5 | Tipado estricto |
| Tailwind CSS v4 | Dark mode, responsive |
| Recharts 3 | Sparklines + graficos historicos |
| Lucide React | Iconos |
| DolarAPI / ArgentinaDatos / Yahoo Finance / CriptoYa | Fuentes de datos |

## Desarrollo local

```bash
git clone https://github.com/Fontanacx/argymetrics.git
cd argymetrics
pnpm install
pnpm approve-builds --all
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Regenerar logos corporativos

```bash
pwsh scripts/download-logos.ps1
```

## Estructura del proyecto

```
lib/
  types/index.ts          Tipos TypeScript unificados
  api/                    10 modulos de fetching (dollars, stocks, crypto, etc.)
  constants/              Configuracion, tickers, labels, revalidacion
  formatters/             currency.ts, date.ts, metrics.ts
  utils/                  insights.ts, semaforo.ts, briefing-generator.ts
app/
  components/dashboard/   Server Components (DollarCard, StockCard, IndexCard, etc.)
  components/charts/      SparklineChart (Recharts)
  components/layout/      Navbar, Footer, MarketTicker, SectionHeader
  components/ui/          VariationBadge, Skeletons
  components/modals/      InfoButton, IndicatorDetail, Modal
  components/insights/    Panel de insights diarios
  page.tsx                Dashboard principal
public/logos/             18 logos corporativos (SVG + PNG)
scripts/                  download-logos.ps1
```

## Licencia

MIT. Los datos provistos son de caracter informativo y no constituyen asesoramiento financiero.
