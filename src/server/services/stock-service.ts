import holdingsData from "../data/holdings.json";
import {
  HoldingSeed,
  StockQuote,
  PortfolioSummary,
} from "@/features/portfolio/types/portfolio.types";
import { stockCache } from "../cache/stock-cache";
import { fetchYahooFinanceQuotes } from "../scrapers/yahoo-finance";
import { scrapeGoogleFinance } from "../scrapers/google-finance";
import { calculatePortfolio } from "@/features/portfolio/services/portfolio-calculator";

const holdings: HoldingSeed[] = holdingsData as HoldingSeed[];

export class StockService {
  /**
   * Retrieves and calculates the entire portfolio summary with live quotes and resilient fallback hierarchy:
   * 1. Check in-memory cache (fresh price, 15s TTL) -> status: "live"
   * 2. Batch fetch via yahoo-finance2 (primary) -> status: "live"
   * 3. Google Finance scraper (secondary) -> status: "live"
   * 4. Last-known stale cache entry (tertiary) -> status: "stale", isStale: true
   * 5. Explicit offline / error state -> cmp: null, status: "error" (never fake CMP with baseline data)
   */
  public async getPortfolio(): Promise<PortfolioSummary> {
    const quotesMap: Record<string, StockQuote> = {};
    const tickersToFetch: string[] = [];

    // 1. Check cache for each holding
    for (const h of holdings) {
      const cached = stockCache.get(h.ticker);
      if (cached && !cached.isStale) {
        quotesMap[h.ticker] = cached;
      } else {
        tickersToFetch.push(h.ticker);
        if (cached) {
          quotesMap[h.ticker] = cached; // Temporary stale placeholder in case live fetch fails
        }
      }
    }

    // 2. Fetch missing / expired from primary Yahoo Finance API
    if (tickersToFetch.length > 0) {
      const liveQuotes = await fetchYahooFinanceQuotes(tickersToFetch);
      for (const [ticker, quote] of liveQuotes.entries()) {
        stockCache.set(quote);
        quotesMap[ticker] = quote;
      }
    }

    // 3. Fallback resolution for any missing tickers via Google Finance
    for (const h of holdings) {
      if (!quotesMap[h.ticker]) {
        // Attempt Google Finance scraper
        const scraped = await scrapeGoogleFinance(h.ticker);
        if (scraped) {
          stockCache.set(scraped);
          quotesMap[h.ticker] = scraped;
        } else {
          // Check if there was an existing cached value
          const staleCached = stockCache.get(h.ticker);
          if (staleCached) {
            quotesMap[h.ticker] = {
              ...staleCached,
              isStale: true,
              status: "stale",
            };
          } else {
            // 4. Explicit Offline / Error State (No fake prices!)
            quotesMap[h.ticker] = {
              ticker: h.ticker,
              cmp: null,
              pe: null,
              latestEarnings: null,
              fetchedAt: Date.now(),
              isStale: true,
              source: "error",
              status: "error",
            };
          }
        }
      }
    }

    // 4. Calculate deterministic financial metrics
    return calculatePortfolio(holdings, quotesMap);
  }

  public getHoldings(): HoldingSeed[] {
    return holdings;
  }

  /**
   * Retrieves portfolio using the exact Assignment Specification (Dual Source):
   * - CMP is actively sourced from Yahoo Finance
   * - P/E Ratio is scraped directly from Google Finance quote pages
   */
  public async getAssignmentSpecPortfolio(): Promise<PortfolioSummary> {
    const quotesMap: Record<string, StockQuote> = {};
    const allTickers = holdings.map((h) => h.ticker);

    // 1. Fetch live CMPs from Yahoo Finance (primary for CMP)
    const yahooQuotes = await fetchYahooFinanceQuotes(allTickers);

    // 2. Concurrently scrape Google Finance for P/E ratios.
    //    Concurrency is capped inside scrapeGoogleFinance via p-limit(5) — matching
    //    yahoo-finance2's internal ceiling. Each ticker's failure is independent:
    //    a timed-out ASTRAL:NSE falls back without blocking the other 25.
    const googleQuotes = new Map<string, StockQuote>();
    const googleResults = await Promise.allSettled(allTickers.map((t) => scrapeGoogleFinance(t)));
    googleResults.forEach((res, idx) => {
      if (res.status === "fulfilled" && res.value) {
        googleQuotes.set(allTickers[idx], res.value);
      }
    });

    // 3. Assemble dual-source quotes
    for (const h of holdings) {
      const yQuote = yahooQuotes.get(h.ticker);
      const gQuote = googleQuotes.get(h.ticker);

      const cmp = yQuote?.cmp ?? gQuote?.cmp ?? null;
      // Assignment spec prioritizes Google Finance for P/E ratio
      const pe = gQuote?.pe ?? yQuote?.pe ?? null;
      const latestEarnings = yQuote?.latestEarnings ?? gQuote?.latestEarnings ?? null;

      quotesMap[h.ticker] = {
        ticker: h.ticker,
        cmp,
        pe,
        latestEarnings,
        fetchedAt: Date.now(),
        isStale: false,
        source: "assignment-spec",
        status: cmp !== null ? "live" : "error",
      };
    }

    // 4. Calculate deterministic metrics
    return calculatePortfolio(holdings, quotesMap);
  }
}

// Singleton for stock service
export const stockService = new StockService();
