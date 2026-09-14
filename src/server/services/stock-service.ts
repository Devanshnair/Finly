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
  public async getPortfolio(): Promise<PortfolioSummary> {
    const quotesMap: Record<string, StockQuote> = {};
    const tickersToFetch: string[] = [];

    // check cache first
    for (const h of holdings) {
      const cached = stockCache.get(h.ticker);
      if (cached && !cached.isStale) {
        quotesMap[h.ticker] = cached;
      } else {
        tickersToFetch.push(h.ticker);
        if (cached) {
          quotesMap[h.ticker] = cached; // keep stale in case live fetch fails
        }
      }
    }

    // fetch expired or missing from yahoo
    if (tickersToFetch.length > 0) {
      const liveQuotes = await fetchYahooFinanceQuotes(tickersToFetch);
      for (const [ticker, quote] of liveQuotes.entries()) {
        stockCache.set(quote);
        quotesMap[ticker] = quote;
      }
    }

    // yahoo missed some, try google scraper fallback
    for (const h of holdings) {
      if (!quotesMap[h.ticker]) {
        const scraped = await scrapeGoogleFinance(h.ticker);
        if (scraped) {
          stockCache.set(scraped);
          quotesMap[h.ticker] = scraped;
        } else {
          const staleCached = stockCache.get(h.ticker);
          if (staleCached) {
            quotesMap[h.ticker] = {
              ...staleCached,
              isStale: true,
              status: "stale",
            };
          } else {
            // no data anywhere, mark offline - don't fake prices
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

    return calculatePortfolio(holdings, quotesMap);
  }

  public getHoldings(): HoldingSeed[] {
    return holdings;
  }

  public async getAssignmentSpecPortfolio(): Promise<PortfolioSummary> {
    const quotesMap: Record<string, StockQuote> = {};
    const allTickers = holdings.map((h) => h.ticker);

    const yahooQuotes = await fetchYahooFinanceQuotes(allTickers);

    const googleQuotes = new Map<string, StockQuote>();
    const googleResults = await Promise.allSettled(allTickers.map((t) => scrapeGoogleFinance(t)));
    googleResults.forEach((res, idx) => {
      if (res.status === "fulfilled" && res.value) {
        googleQuotes.set(allTickers[idx], res.value);
      }
    });

    for (const h of holdings) {
      const yQuote = yahooQuotes.get(h.ticker);
      const gQuote = googleQuotes.get(h.ticker);

      const cmp = yQuote?.cmp ?? gQuote?.cmp ?? null;
      // spec asks for google pe first
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

    return calculatePortfolio(holdings, quotesMap);
  }
}

export const stockService = new StockService();
