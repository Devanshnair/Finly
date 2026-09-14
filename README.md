# finly. — Dynamic Stock Portfolio Dashboard

A real-time equity portfolio dashboard that tracks multi-sector Indian stock holdings with live CMP feeds, pure financial calculations, sector-level subtotals, and automated data refresh with graceful degradation.

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
│   │   ├── api/portfolio/      # Route handlers (HTTP endpoints + SSE push stream)
│   │   │   └── sse/route.ts    # Node.js runtime SSE stream handler
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
│   │   ├── hooks/              # usePortfolioSse (real-time stream subscription)
│   │   ├── services/           # Pure portfolio math (portfolio-calculator.ts)
│   │   ├── utils/              # Price change diffing (price-changes.ts)
│   │   └── types/              # Comprehensive TypeScript interfaces
│   │
│   ├── server/                 # Server-only layer (never imported in client code)
│   │   ├── cache/              # In-memory TTL cache (stock-cache.ts)
│   │   ├── scrapers/           # Live scrapers (Yahoo Finance, Google Finance)
│   │   ├── services/           # Stock service orchestrating fetch + cache
│   │   └── sse/                # Shared singleton broadcaster (portfolio-broadcaster.ts)
│   │
│   └── lib/                    # Utilities, formatters (INR, percent), query client
```

### Core Architecture Principles

1. **Strict Server Isolation:** Code in `src/server/*` (scrapers, caches, seed data) is strictly server-only and is never imported into client components (`"use client"`). Data travels exclusively through Route Handlers and React Query.
2. **Pure Financial Math:** All calculations reside in pure functions in `portfolio-calculator.ts` with division-by-zero guards and deterministic rounding.
3. **No Database Requirement:** Holdings are seeded from `src/server/data/holdings.json` and computed dynamically against live or cached quotes.
4. **Resilient Degradation:** If live feeds encounter network latency or rate limits, the UI falls back to cached data marked with honest stale indicators.
5. **Transport Decoupling:** The UI presentation layer consumes portfolio data through TanStack Query's cache slot without knowing or caring whether it is populated via HTTP polling (`main` branch) or push-based Server-Sent Events (`sse` branch). See [`technicalbrief.md`](technicalbrief.md) for the full architectural comparison.

---

## Getting Started & Local Setup

### Prerequisites

- **Node.js** 18.18 or higher
- **pnpm** (Install via `npm install -g pnpm` if needed)

### 1. Installation

```bash
git clone https://github.com/Devanshnair/Finly.git
cd Finly
pnpm install
```

### 2. Running Locally Across Branches

Finly implements two distinct real-time transport architectures across branches to demonstrate real-world engineering trade-offs:

#### Option A: Running Polling Architecture (`main` branch)

The primary production build utilizing 15-second HTTP polling (deployed on Vercel):

```bash
git checkout main
pnpm dev
# or production build:
pnpm build && pnpm start
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the dashboard with polling updates.

#### Option B: Running Server-Sent Events (SSE) Push Architecture (`sse` branch)

The showcase push architecture powered by a single shared Node.js broadcaster:

```bash
git checkout sse
pnpm dev
# or production build:
pnpm build && pnpm start
```

> _Note: This branch runs via `pnpm build && pnpm start` locally — not deployed, since Vercel's function model doesn't support the persistent connection this requires._

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the dashboard with live SSE streaming (`Push stream (15s)`).

---

## Available Scripts

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Starts the development server at `localhost:3000` |
| `pnpm build`        | Compiles the production build                     |
| `pnpm start`        | Runs the compiled production application          |
| `pnpm lint`         | Runs ESLint checks                                |
| `pnpm tsc --noEmit` | Runs strict TypeScript type checking              |
| `pnpm format`       | Formats all code with Prettier                    |

---

## Financial Metrics Computed

- **Total Investment:** `Purchase Price × Quantity` (per holding & sector & portfolio)
- **Present Value:** `CMP × Quantity` (null-safe if live CMP is temporarily unavailable)
- **Total Gain / Loss:** `Present Value − Investment`
- **Gain / Loss Percentage:** `(Gain / Loss ÷ Investment) × 100`
- **Portfolio Weight (%):** `(Holding Investment ÷ Total Portfolio Investment) × 100`
- **Weighted Average P/E:** Sum of `(Weight × P/E)` for all holdings with positive earnings.

---

## Documentation

- **[Technical Brief (`technicalbrief.md`)](technicalbrief.md):** In-depth technical breakdown of Polling vs. Server-Sent Events, Yahoo vs. Google scraping, semantic DOM label anchoring, and architectural trade-offs.

---

## License

MIT License. Designed and developed for portfolio intelligence tracking.
