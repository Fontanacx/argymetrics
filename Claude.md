# CLAUDE.md

Strict AI development rules and project context for **ArgyMetrics**.

This file defines the architecture, constraints, and standards that **all AI agents must follow when generating or modifying code in this repository**.

---

# 1. Project Overview

**Project Name:** ArgyMetrics

ArgyMetrics is a financial dashboard for Argentina that tracks:

* USD exchange rates (multiple markets)
* Country risk (Riesgo País)
* Inflation
* FX band indicators (Bandas Cambiarias)

The goal is to provide a **fast, minimal, professional financial data dashboard**.

---

# 2. Tech Stack

The project uses the following technologies:

* Next.js 14
* App Router
* TypeScript
* React Server Components
* ISR (Incremental Static Regeneration)

Primary data sources:

* https://dolarapi.com
* https://api.argentinadatos.com

---

# 3. Core Architecture (CRITICAL)

ArgyMetrics follows a **SERVER-FIRST architecture**.

Always prioritize:

* Server Components
* Server-side data fetching
* ISR caching via `fetch({ next: { revalidate } })`

Avoid:

* Client components unless absolutely required
* Client-side fetching
* Heavy React hooks

Correct pattern:

Data fetching must occur inside the API layer.

Example:

```
const dollars = await fetchDollarsWithHistory()
```

Incorrect pattern:

```
useEffect(() => {
  fetch(...)
})
```

---

# 4. Project Structure

The project follows this structure:

```
lib/
  types/
    index.ts

  api/
    dollars.ts
    historical.ts
    indicators.ts

  formatters/
    currency.ts
    date.ts

components/
  DollarCard.tsx
  DollarGrid.tsx
  IndicatorsStrip.tsx
  VariationBadge.tsx
  BandasIndicator.tsx
```

Rules:

* API logic must stay in `lib/api`
* Formatting utilities must stay in `lib/formatters`
* Types must stay in `lib/types`
* UI components must stay in `components`

---

# 5. Data Layer Rules

All API calls must be implemented inside:

```
lib/api/
```

Never fetch external APIs directly inside components.

Components must call typed API functions.

Example:

```
fetchAllDollars()
fetchDollarHistory()
fetchRiesgoPais()
fetchInflacion()
```

Never call raw endpoints inside UI code.

---

# 6. Type Safety Rules

All API responses must use TypeScript types defined in:

```
lib/types/index.ts
```

Strict requirements:

* No `any`
* No untyped API responses
* No unsafe casts

If an API response changes:

1. Update the type definition first
2. Then update the API implementation

---

# 7. Error Handling Rules

API functions must **never crash the app**.

Instead return safe fallback values.

Allowed fallbacks:

```
null
[]
0
```

Example:

```
if (!Array.isArray(data)) return []
```

Never throw unhandled exceptions that break SSR.

---

# 8. Formatting Rules

All formatting must use utilities inside:

```
lib/formatters/
```

Examples:

```
formatARS()
formatPercent()
formatPoints()
formatSpread()
formatRelativeTime()
```

Never format numbers or currency directly inside components.

---

# 9. UI Philosophy

ArgyMetrics is a **financial data dashboard**.

Design principles:

* Minimal
* Fast
* Data-first
* Professional
* Highly readable

Avoid:

* unnecessary animations
* heavy UI frameworks
* visual clutter

Preferred layout:

```
Indicators Strip

↓

Dollar Grid

↓

Historical charts
```

---

# 10. Component Design Rules

Components must be:

* small
* reusable
* predictable
* mostly server components

Expected component structure:

```
components/

DollarCard.tsx
DollarGrid.tsx
IndicatorsStrip.tsx
VariationBadge.tsx
BandasIndicator.tsx
```

Client components should only be used if strictly necessary.

---

# 11. Performance Rules

Performance is a core requirement.

Rules:

* Prefer server rendering
* Avoid unnecessary client JavaScript
* Avoid large dependencies
* Avoid global state managers

Caching must be handled via:

```
fetch(..., { next: { revalidate } })
```

---

# 12. Dependency Policy

Do not add dependencies unless absolutely necessary.

Before installing a package ask:

1. Can this be implemented with native JavaScript?
2. Can Next.js already do this?

If yes, do not add a dependency.

---

# 13. Code Quality Rules

TypeScript must compile without errors.

Always run:

```
pnpm exec tsc --noEmit
```

No TypeScript errors are allowed in commits.

---

# 14. Development Workflow

When implementing new features follow this order:

1. Define TypeScript types
2. Implement API layer
3. Implement formatters
4. Implement server component
5. Implement UI component

Never skip steps.

---

# 15. Git and Change Documentation

When making significant changes, always explain:

* what changed
* why it changed
* which files were modified

Keep commits clear and minimal.

---

# 16. Absolute Prohibitions

Never do the following:

❌ Fetch APIs directly inside components
❌ Use `any` types
❌ Break the TypeScript build
❌ Introduce heavy UI frameworks
❌ Bypass the API layer

---

# 17. Absolute Requirements

Always ensure:

✅ Server-first architecture
✅ Typed API functions
✅ Clean TypeScript build
✅ Minimal dependencies
✅ Consistent architecture

---

# 18. When the AI is Unsure

If uncertain about a design decision, prefer:

* simplicity
* server-side logic
* strong typing
* minimal dependencies
* performance over convenience

---

# 19. Goal of the Project

ArgyMetrics should remain:

* extremely fast
* cleanly architected
* easy
