import YahooFinance from "yahoo-finance2";
import { StockQuote } from "@/features/portfolio/types/portfolio.types";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

/**
 * Fetches batch quotes from Yahoo Finance JSON endpoints.
 */
export async function fetchYahooFinanceQuotes(tickers: string[]): Promise<Map<string, StockQuote>> {
  const quotesMap = new Map<string, StockQuote>();
  if (tickers.length === 0) return quotesMap;

  // Batch in chunks of 10 to keep URL length and payload modest
  const chunkSize = 10;
  const chunks: string[][] = [];
  for (let i = 0; i < tickers.length; i += chunkSize) {
    chunks.push(tickers.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    try {
      const results = await yahooFinance.quote(chunk);
      const quotesArray = Array.isArray(results) ? results : [results];

      for (const item of quotesArray) {
        if (!item || !item.symbol) continue;

        const cmp = item.regularMarketPrice ?? item.currentPrice;
        if (typeof cmp !== "number" || isNaN(cmp)) continue;

        const pe = typeof item.trailingPE === "number" ? Number(item.trailingPE.toFixed(2)) : null;
        const latestEarnings =
          typeof item.epsTrailingTwelveMonths === "number"
            ? Number(item.epsTrailingTwelveMonths.toFixed(2))
            : null;

        quotesMap.set(item.symbol, {
          ticker: item.symbol,
          cmp,
          pe,
          latestEarnings,
          fetchedAt: Date.now(),
          isStale: false,
          source: "yahoo-finance",
          status: "live",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(
        `[Yahoo Finance Scraper Warning] Chunk failed: [${chunk.join(", ")}]. Error: ${msg}`
      );
    }
  }

  return quotesMap;
}
