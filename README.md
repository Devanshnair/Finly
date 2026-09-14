# finly. — Dynamic Stock Portfolio Dashboard

A real-time equity portfolio dashboard that tracks multi-sector Indian stock holdings with live CMP feeds, pure financial calculations, sector-level subtotals, and automated polling with graceful degradation.

---

## Tech Stack

| Layer                     | Technology                                         |
| ------------------------- | -------------------------------------------------- |
| **Framework**             | Next.js 15 (App Router)                            |
| **Language**              | TypeScript (Strict Mode)                           |
| **Styling**               | Tailwind CSS (Tailored HSL theme tokens)           |
| **Icons & UI**            | Lucide React, shadcn/ui primitives                 |
| **State & Data Fetching** | TanStack React Query v5 + Axios                    |
| **Charts**                | Recharts (ResponsiveContainer, PieChart, BarChart) |
| **Live Scrapers**         | `yahoo-finance2` + Google Finance fallback         |
| **Cache**                 | In-memory TTL Stock Cache                          |
| **Package Manager**       | `pnpm` exclusively                                 |

---

## Architecture & Code Organization

```
finly/
├── public/                     # Static assets & screenshots
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # High-conversion landing page with HeroPreview
│   │   ├── dashboard/          # Dashboard views
│   │   │   ├── page.tsx        # Overview dashboard (KPIs, Donut, Movers, Bar Chart)
│   │   │   ├── holdings/       # Detailed holdings table with filters and sorting
│   │   │   └── layout.tsx      # App frame with collapsible sidebar and header
│   │   ├── api/portfolio/      # Route handlers (merges live data with seed holdings)
│   │   └── globals.css         # CSS tokens, theme variables, and keyframe animations
│   │
│   ├── components/             # Generic & layout UI components
│   │   ├── landing/            # Landing page preview components (HeroPreview)
│   │   ├── layout/             # Dashboard sidebar and header
│   │   └── ui/                 # Reusable UI primitives (FinlyLogo, ThemeToggle, Select)
│   │
│   ├── features/portfolio/     # Core domain module
│   │   ├── components/         # Domain components (KPI cards, charts, table, badges)
│   │   ├── data/               # Seed holdings and mock test states
│   │   ├── hooks/              # usePortfolioQuery with automatic 15s refetch
│   │   ├── services/           # Pure portfolio math (portfolio-calculator.ts)
│   │   └── types/              # Comprehensive TypeScript interfaces
│   │
│   ├── server/                 # Server-only layer (never imported in client code)
│   │   ├── cache/              # In-memory TTL cache (stock-cache.ts)
│   │   ├── scrapers/           # Live scrapers (Yahoo Finance, Google Finance)
│   │   └── services/           # Stock service orchestrating fetch + cache
│   │
│   └── lib/                    # Utilities, formatters (INR, percent), query client
```

### Core Architecture Principles

1. **Strict Server Isolation:** Code in `src/server/*` (scrapers, caches, seed data) is strictly server-only and is never imported into client components (`"use client"`). Data travels exclusively through Route Handlers and React Query.
2. **Pure Financial Math:** All calculations reside in pure functions in `portfolio-calculator.ts` with division-by-zero guards and deterministic rounding.
3. **No Database Requirement:** Holdings are seeded from `src/server/data/holdings.json` and computed dynamically against live or cached quotes.
4. **Resilient Degradation:** If live feeds encounter network latency or rate limits, the UI falls back to cached data marked with honest stale indicators.

---

## Getting Started

### Prerequisites

- **Node.js** 18.18 or higher
- **pnpm** (Install via `npm install -g pnpm` if needed)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Devanshnair/Finly.git
   cd Finly
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Starts the development server at `localhost:3000` |
| `pnpm build`        | Compiles the production build                     |
| `pnpm start`        | Runs the compiled production application          |
| `pnpm lint`         | Runs ESLint checks                                |
| `pnpm tsc --noEmit` | Runs strict TypeScript type checking              |

---

## Financial Metrics Computed

- **Total Investment:** `Purchase Price × Quantity` (per holding & sector & portfolio)
- **Present Value:** `CMP × Quantity` (null-safe if live CMP is temporarily unavailable)
- **Total Gain / Loss:** `Present Value − Investment`
- **Gain / Loss Percentage:** `(Gain / Loss ÷ Investment) × 100`
- **Portfolio Weight (%):** `(Holding Investment ÷ Total Portfolio Investment) × 100`
- **Weighted Average P/E:** Sum of `(Weight × P/E)` for all holdings with positive earnings.

---

## License

MIT License. Designed and developed for portfolio intelligence tracking.
