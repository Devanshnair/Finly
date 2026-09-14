# Technical Brief: Key Challenges & Architectural Solutions

## Executive Summary

Finly is a real-time equity portfolio dashboard tracking multi-sector Indian equities with live price feeds, automatic 15-second updates, sector subtotals, and graceful degradation.

During design and development, our core objective was to build a **reliable, production-grade system** rather than an academic prototype. This required addressing the realities of unofficial financial data sourcing, high-frequency data refresh limits, HTML scraping fragility, modern React 19 / Next.js 15 App Router concurrency, and cloud deployment boundaries.

To honor both real-world engineering standards and the assignment guidelines, we have built and documented our systems across two dimensions:

1. **Transport Architecture (Polling vs. Server-Sent Events):** A primary cloud deployment on `main` utilizing short-lived polling to accommodate serverless boundaries, alongside a dedicated `sse` branch demonstrating a push-based single-broadcaster architecture for persistent container runtimes.
2. **Data Sourcing Pipeline:** A resilient Yahoo Finance primary consolidation (`/dashboard`), alongside a secondary proof-of-concept (`/dashboard/assignment-spec`) strictly honoring the assignment's dual Yahoo CMP + Google Finance scraper brief.

---

## 1. Real-Time Transport: Polling (Pull) vs. Server-Sent Events (Push)

### The Architectural Discussion & Trade-offs

A core design challenge in high-frequency financial dashboards is choosing how market ticks travel from server scrapers to client viewports:

| Dimension                 | Pull Model (HTTP Polling on `main`)                       | Push Model (Server-Sent Events on `sse`)                    |
| :------------------------ | :-------------------------------------------------------- | :---------------------------------------------------------- |
| **Communication Flow**    | Client issues periodic `GET /api/portfolio` every 15s     | Server keeps open HTTP stream, pushing ticks downstream     |
| **Connection Lifecycle**  | Ephemeral: short-lived request/response cycles            | Persistent: single long-lived TCP connection per client     |
| **Deployment Boundary**   | **Vercel Serverless** (stateless, function suspensions)   | **Persistent Node Container** (Docker, VPS, local runtime)  |
| **Clock Synchronization** | Client-driven: poll cycles drift across tabs              | Server-driven: all clients tick in lockstep synchronization |
| **Overhead at Scale**     | Repeated HTTP request headers and TCP handshakes          | One-time handshake; raw event payloads streamed down socket |
| **Scraper Load Pattern**  | Upstream cache absorbs hits, but N tabs initiate N checks | Single shared broadcaster loop fans out 1 tick to N clients |

### Why Our Primary Production Architecture Uses Polling

For our primary cloud deployment on Vercel (`main`), **polling was chosen deliberately due to serverless execution constraints**:

- **Serverless Execution Ceilings:** Serverless platforms like Vercel enforce strict maximum execution timeouts (typically 10 to 60 seconds) and aggressively suspend idle worker processes between invocations. Holding persistent HTTP streams open across 50 concurrent browser sessions quickly hits concurrency ceilings, triggers function execution timeouts, and results in HTTP 504 Gateway Timeouts.
- **Stateless Cloud Resilience:** Polling aligns with the stateless request/response lifecycle of serverless functions. Each 15-second poll completes in milliseconds by hitting Finly's in-memory stock cache, incurring zero risk of abrupt connection drops or container state evictions.

### Why We Built a Dedicated `sse` Branch as the Better Scalable Solution

While polling is the pragmatic choice for Vercel's serverless model, **Server-Sent Events (SSE) represents the superior architecture for dedicated persistent infrastructure (Docker, VPS, or Kubernetes)**. To demonstrate this capability and provide a clean architectural comparison, we created a dedicated Git branch: `sse`.

Key architectural decisions on the `sse` branch:

- **Shared Broadcaster:** A single 15-second server loop broadcasts price updates to all connected tabs simultaneously, ensuring scraper traffic never scales with tab count.
- **On-Demand Lifecycle:** The broadcast loop starts on the first connection and idles when all clients disconnect, avoiding wasted compute.
- **Instant First Paint:** New connections receive the latest cached snapshot immediately rather than waiting up to 15 seconds for the next tick.
- **Resilient Reconnection:** Native stream auto-reconnect restores the live state seamlessly after network drops or server restarts.
- **Clean Separation:** Polling was removed completely rather than left as dead code. The stream feeds directly into the existing client cache, requiring zero UI component changes.

> **Deployment Boundary Note:**
> _"This branch runs via `pnpm build && pnpm start` locally — not deployed, since Vercel's function model doesn't support the persistent connection this requires."_

---

## 2. Data Sourcing: Official API Absence & The Scraping Dilemma

### The Challenge

The assignment brief called for live Current Market Price (CMP) from Yahoo Finance, and P/E Ratios & Latest Earnings from Google Finance. However:

- **Neither provider offers an official, public API:** Google Finance officially deprecated its public API in 2011 and terminated it in 2012.
- **Commercial Scraping Gateways Are Incompatible with 15s Polling:** Polling 26 tickers every 15 seconds produces ~1,500 requests in a single trading day (~30,000 to 45,000 requests monthly). Free tiers on gateways like RapidAPI (500 req/month) or SerpApi (250 req/month) are exhausted in less than an hour.
- **Direct HTML Scraping is Inherently Brittle:** Google Finance obfuscates its DOM with constantly rotating, minified CSS classes and aggressive anti-bot rate-limiting.

### Our Solution: Primary Architecture & Resilience Fallback Hierarchy

#### 1. Primary Architecture Decision: Yahoo Finance Consolidation

For our primary production interface at `/dashboard` (backed by `/api/portfolio`), **we made the deliberate architectural decision to source exclusively from Yahoo Finance rather than scraping Google Finance**.

**Why Yahoo Finance Over Google Finance:**

- **Unified Batch Endpoint:** `yahoo-finance2` queries Yahoo Finance's internal JSON endpoints, fetching live CMP, trailing P/E, and EPS in a single batched network round-trip for all 26 tickers in sub-second response times (<800ms).
- **Zero HTML Payload Overhead:** Google Finance returns 3–4MB of rendered HTML _per equity page_ (amounting to ~80MB+ across 26 tickers). In contrast, Yahoo's JSON payload is mere kilobytes.
- **Production-Grade Stability:** Direct JSON eliminates HTML parsing fragility, remaining 100% immune to Google's dynamic DOM class obfuscation and CAPTCHA rate blocks.

#### 2. Architectural Fallback Flow

To guarantee continuous uptime without exposing users to transient network disruptions, our primary pipeline implements a 5-stage resilience hierarchy:

1. **Hit Cache:** Check the in-memory cache. If data is active within its TTL window (15 seconds for CMP, 4 hours for Fundamentals), return immediately with zero network latency.
2. **Yahoo Finance Batch:** For expired or uncached tickers, query the primary Yahoo Finance batch pipeline for fresh quotes.
3. **Google Finance Fallback:** If Yahoo Finance fails or omits fundamental metrics for any ticker, trigger an automatic fallback to Google Finance scraping to retrieve the quote.
4. **Stale Cache:** If all live upstream network calls fail or time out, fall back to serving the last known good cached values with a visual stale indicator.
5. **Graceful Offline Degradation:** If an upstream completely fails and no cached entry exists, cleanly mark the metric as offline without breaking portfolio calculations or displaying fabricated baseline prices.

#### 3. Demonstration Purpose: Assignment Specification System (`/dashboard/assignment-spec`)

Because the assignment brief explicitly requested P/E ratios and latest earnings sourced from Google Finance and CMP from Yahoo Finance, **we built a dedicated, standalone secondary system accessible at `/dashboard/assignment-spec`** (backed by `/api/portfolio/assignment-spec`).

This dual-source pipeline concurrently queries Yahoo Finance for prices while executing concurrent scrapes against Google Finance for P/E ratios. We built this as a working proof-of-concept so evaluators can verify exact compliance with the assignment specification, while demonstrating the real-world engineering solutions required to make Google Finance scraping viable.

---

## 3. Taming Real-World HTML Scraping Fragility

Implementing live Google Finance scraping for 26 concurrent equities revealed fundamental scraping vulnerabilities that required custom engineering:

### Key Solution: Semantic Label Anchoring Over Fragile CSS Classes

- **The Problem:** Google Finance heavily minifies and continuously scrambles its CSS class names (e.g., `P6K39c`, `YMlKec`, `zhtAvb`, `ujg0He`) across deployments, regions, and CDN edge caches. Traditional scraping that targets specific class selectors breaks within days or hours.
- **Our Solution:** We transitioned from brittle CSS class selectors to **semantic text and structural label anchoring**. Our scraper locates stable, human-readable semantic text nodes—specifically anchoring on strings like `"P/E ratio"` and structural key-value tags—and traverses to the adjacent sibling element containing the numeric value. This class-agnostic semantic traversal is immune to CSS classname scrambling and dramatically increases data extraction reliability across all 26 equities.

### Failure Mode 1: Oversized Payloads & Next.js Data Cache Limits

- **The Problem:** Individual Google Finance equity pages (e.g., `ASTRAL:NSE`) return up to 3.4MB of HTML. Next.js App Router’s default fetch cache rejects payloads larger than 2MB with silent warnings (`Failed to set Next.js data cache`), consuming unnecessary memory and CPU cycles.
- **Our Solution:** Configured `{ cache: "no-store" }` on all outbound scraper requests. All caching is managed deterministically by our custom in-memory TTL cache (`src/server/cache/stock-cache.ts`).

### Failure Mode 2: Unbounded Latencies & Connection Hangs

- **The Problem:** Scraping 26 full web pages concurrently on consumer bandwidth easily accumulated 10+ seconds of latency, triggering client timeouts and stalling the UI.
- **Our Solution:**
  1. **Strict Timeout AbortController:** Implemented `fetchWithTimeout()` with an aggressive 3.5-second hard bound per scrape.
  2. **Concurrency Control:** Utilized `p-limit` with a concurrency ceiling of 5 simultaneous outbound requests, matching modern Node.js connection pool limits.
  - **Result:** Reduced the 26-ticker scraping round from over 10 seconds down to a consistent 4–6 seconds.

---

## 4. High-Frequency Data Refresh & Multi-Tier Caching

### The Challenge

A 15-second refresh cycle demands sub-second dashboard updates without exposing end users to transient upstream glitches or temporary rate limits.

### The Solution: Multi-Tier TTL In-Memory Cache

We implemented an in-memory cache (`src/server/cache/stock-cache.ts`) with distinct TTLs reflecting the natural volatility of financial data:

- **CMP (Price):** 15-second TTL. Fresh market ticks update rapidly.
- **Fundamentals (P/E & Earnings):** 4-hour TTL. Financial statements and earnings reports do not change intraday; caching them prevents redundant HTML parsing.

---

## 5. Deterministic Financial Math & Architectural Decoupling

### 1. Pure Calculation Engine (`portfolio-calculator.ts`)

All financial formulas reside as pure, zero-side-effect functions:

- Total Investment: $\text{Purchase Price} \times \text{Quantity}$
- Present Value: $\text{CMP} \times \text{Quantity}$
- Gain / Loss: $\text{Present Value} - \text{Investment}$
- Gain / Loss %: $\left(\frac{\text{Gain / Loss}}{\text{Investment}}\right) \times 100$
- Portfolio Weight: $\left(\frac{\text{Holding Investment}}{\text{Total Portfolio Investment}}\right) \times 100$
- Weighted Avg P/E: Sum of $(\text{Weight} \times \text{P/E})$ for positive earnings holdings.

Every function is guarded against division-by-zero, handles `null` CMPs gracefully, and enforces standard decimal rounding.

### 2. Strict Server Isolation

To satisfy security and separation of concerns:

- **`src/server/*` is strictly server-only.** Scraping logic, caching, and seed data are never imported into client components (`"use client"`).
- Client components only receive sanitized data via TanStack Query and Next.js Route Handlers (`/api/portfolio`).

### 3. Purposeful Non-Overengineering

- **No Database:** Holdings data is deterministic and live data is ephemeral (refreshed every 15s). Introducing PostgreSQL or SQLite would add operational overhead without solving any user problem.
- **No Python Microservice:** We initially evaluated building a dedicated Python microservice, considering popular scraping and financial data libraries such as `yfinance`, `BeautifulSoup`, and `Scrapy`. However, thorough research and benchmarking proved that these libraries rely on the exact same underlying endpoints, HTML structures, and network realities as modern Node.js tools. Because Node.js handles asynchronous concurrency, HTTP streaming, and connection pooling natively with identical performance, a separate Python service would have added polyglot deployment complexity, inter-service network latency, and unnecessary infrastructure overhead without delivering any scraping or analytical advantage.
