import { StockQuote } from "@/features/portfolio/types/portfolio.types";

interface CacheEntry {
  quote: StockQuote;
  priceExpiresAt: number;
  fundamentalsExpiresAt: number;
}

// 15s for price, 4h for fundamentals
class StockCache {
  private cache = new Map<string, CacheEntry>();
  private readonly PRICE_TTL_MS = 15 * 1000;
  private readonly FUNDAMENTALS_TTL_MS = 4 * 60 * 60 * 1000;

  public get(ticker: string): StockQuote | null {
    const entry = this.cache.get(ticker);
    if (!entry) return null;

    const now = Date.now();
    const isPriceExpired = now > entry.priceExpiresAt;

    return {
      ...entry.quote,
      isStale: isPriceExpired,
      status: isPriceExpired ? "stale" : "live",
    };
  }

  public set(quote: StockQuote): void {
    const now = Date.now();
    const existing = this.cache.get(quote.ticker);

    const priceExpiresAt = now + this.PRICE_TTL_MS;

    const fundamentalsStillFresh = !!existing && now < existing.fundamentalsExpiresAt;
    const hasNewFundamentals = quote.pe !== null || quote.latestEarnings !== null;

    const pe = quote.pe ?? (fundamentalsStillFresh ? existing!.quote.pe : null);
    const latestEarnings =
      quote.latestEarnings ?? (fundamentalsStillFresh ? existing!.quote.latestEarnings : null);

    const fundamentalsExpiresAt = hasNewFundamentals
      ? now + this.FUNDAMENTALS_TTL_MS
      : fundamentalsStillFresh
        ? existing!.fundamentalsExpiresAt
        : now;

    this.cache.set(quote.ticker, {
      quote: {
        ...quote,
        pe,
        latestEarnings,
        fetchedAt: now,
        isStale: false,
        status: "live",
      },
      priceExpiresAt,
      fundamentalsExpiresAt,
    });
  }

  public getAll(): Map<string, StockQuote> {
    const result = new Map<string, StockQuote>();
    const now = Date.now();

    for (const [ticker, entry] of this.cache.entries()) {
      const isStale = now > entry.priceExpiresAt;
      result.set(ticker, {
        ...entry.quote,
        isStale,
        status: isStale ? "stale" : "live",
      });
    }

    return result;
  }

  public clear(): void {
    this.cache.clear();
  }
}

const globalStockCache = globalThis as unknown as { __finly_stock_cache__?: StockCache };
export const stockCache = globalStockCache.__finly_stock_cache__ ?? new StockCache();
if (process.env.NODE_ENV !== "production") {
  globalStockCache.__finly_stock_cache__ = stockCache;
}
