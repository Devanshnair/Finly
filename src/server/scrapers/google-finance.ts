import pLimit from "p-limit";
import { StockQuote } from "@/features/portfolio/types/portfolio.types";

/**
 * Google Finance scraper module.
 * Fetches live market price (CMP) and fundamental ratios directly from Google Finance quote pages.
 *
 * Design decisions:
 * 1. fetchWithTimeout — each individual request is bounded by an AbortController.
 *    Google Finance pages can be 3–4MB and take 8s+ on a slow connection; without
 *    this, 26 uncapped fetches easily blow past the client timeout.
 *
 * 2. p-limit(5) concurrency cap — mirrors yahoo-finance2's internal concurrency ceiling.
 *    Fully parallel (26 at once) risks OS/runtime file-descriptor exhaustion and can
 *    trigger rate-limiting at the remote; 5 concurrent gives near-linear speedup
 *    without that pressure.
 *
 * 3. cache: "no-store" — we intentionally bypass Next.js's automatic fetch data cache.
 *    Next.js rejects cached payloads >2MB (e.g., ASTRAL:NSE is ~3.4MB), generating
 *    a noisy error on every request. stock-cache.ts is our single caching truth.
 */


const SCRAPE_TIMEOUT_MS = 3500;
const CONCURRENCY = 5;

// Shared limiter — one instance means all callers share the same concurrency cap
const limit = pLimit(CONCURRENCY);

async function fetchWithTimeout(url: string, ms = SCRAPE_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  } finally {
    clearTimeout(id);
  }
}

async function scrapeOneTicker(ticker: string): Promise<StockQuote | null> {
  // Format Yahoo ticker (e.g. "HDFCBANK.NS") → Google Finance format (e.g. "HDFCBANK:NSE")
  const symbol = ticker.replace(/\.NS$/i, "").replace(/\.BO$/i, "");
  const exchange = ticker.endsWith(".BO") ? "BOM" : "NSE";
  const googleUrl = `https://www.google.com/finance/quote/${encodeURIComponent(symbol)}:${exchange}`;

  const res = await fetchWithTimeout(googleUrl);

  if (res.ok) {
    const html = await res.text();

    // 1. Price container: matches modern hero banner (zhtAvb/ujg0He/N6SYTe with jsname="Pdsbrc")
    //    with legacy YMlKec fxKbKc as secondary fallback
    const gPriceMatch =
      html.match(/class="[^"]*(?:zhtAvb|ujg0He|N6SYTe)[^"]*"[\s\S]*?<span[^>]*jsname="Pdsbrc"[^>]*><span>[^0-9]*([\d,.]+)/i) ||
      html.match(/class="[^"]*YMlKec fxKbKc[^"]*"[^>]*>[^0-9]*([\d,.]+)/i);

    if (gPriceMatch?.[1]) {
      const cmp = parseFloat(gPriceMatch[1].replace(/,/g, ""));
      if (!isNaN(cmp) && cmp > 0) {
        // 2. P/E ratio: Semantic label anchoring matching human-readable "P/E ratio" text
        //    and grabbing the immediate sibling value div (class-agnostic)
        const peMatch =
          html.match(/P\/E ratio<\/div><div[^>]*>([\d,.]+)<\/div>/i) ||
          html.match(/P\/E ratio[\s\S]*?class="[^"]*P6K39c[^"]*"[^>]*>([\d,.]+)/i);
        const pe = peMatch?.[1] ? parseFloat(peMatch[1].replace(/,/g, "")) : null;

        return {
          ticker,
          cmp,
          pe: pe && !isNaN(pe) ? pe : null,
          latestEarnings: null,
          fetchedAt: Date.now(),
          isStale: false,
          source: "google-finance",
          status: "live",
        };
      }
    }
  }

  return null;
}

/**
 * Scrape a single ticker from Google Finance, bounded by concurrency limit and
 * per-request timeout. Each ticker's failure is independent — a timed-out
 * ASTRAL:NSE falls back to its last cached value without stalling others.
 */
export async function scrapeGoogleFinance(ticker: string): Promise<StockQuote | null> {
  return limit(async () => {
    try {
      return await scrapeOneTicker(ticker);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Expected on timeout — debug level only, not a warn wall
        console.debug(`[Google Finance] Timeout for ${ticker} (>${SCRAPE_TIMEOUT_MS}ms)`);
      } else {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`[Google Finance] Scrape failed for ${ticker}: ${msg}`);
      }
      return null;
    }
  });
}
