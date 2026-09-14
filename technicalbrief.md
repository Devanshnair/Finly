# Technical Brief: Key Challenges & Architectural Solutions

## Executive Summary

Finly is a real-time equity portfolio dashboard tracking multi-sector Indian equities with live price feeds, automatic 15-second polling, sector subtotals, and graceful degradation.

During design and development, our core objective was to build a **reliable, production-grade system** rather than an academic prototype. This required addressing the realities of unofficial financial data sourcing, high-frequency polling limits, HTML scraping fragility, and modern React 19 / Next.js 15 App Router concurrency.

To honor both real-world engineering standards and the assignment guidelines, we have built **two separate systems**:

1. **Primary Production System (`/dashboard`):** Our primary recommended architecture using Yahoo Finance data and Google Finance as fallback.
2. **Secondary Assignment-Spec Demo (`/dashboard/assignment-spec`):** Follows assignment brief strictly, scraping live P/E ratios and latest earnings directly from Google Finance and sourcing live CMP from Yahoo Finance.

---

## 1. Data Sourcing: Official API Absence & The Scraping Dilemma

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

## 2. Taming Real-World HTML Scraping Fragility

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

## 3. High-Frequency Polling & Multi-Tier Caching

### The Challenge

A 15-second refresh cycle demands sub-second dashboard updates without exposing end users to transient upstream glitches or temporary rate limits.

### The Solution: Multi-Tier TTL In-Memory Cache

We implemented an in-memory cache (`src/server/cache/stock-cache.ts`) with distinct TTLs reflecting the natural volatility of financial data:

- **CMP (Price):** 15-second TTL. Fresh market ticks update rapidly.
- **Fundamentals (P/E & Earnings):** 4-hour TTL. Financial statements and earnings reports do not change intraday; caching them prevents redundant HTML parsing.

---

## 4. Deterministic Financial Math & Architectural Decoupling

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
