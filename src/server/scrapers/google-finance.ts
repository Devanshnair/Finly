import pLimit from "p-limit";
import { StockQuote } from "@/features/portfolio/types/portfolio.types";

const SCRAPE_TIMEOUT_MS = 3500;
const CONCURRENCY = 5;

// max 5 at once so google doesn't rate limit
const limit = pLimit(CONCURRENCY);

async function fetchWithTimeout(url: string, ms = SCRAPE_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store", // skip nextjs cache, google pages are huge (>3mb)
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
  // convert .NS/.BO to :NSE/:BOM for google url
  const symbol = ticker.replace(/\.NS$/i, "").replace(/\.BO$/i, "");
  const exchange = ticker.endsWith(".BO") ? "BOM" : "NSE";
  const googleUrl = `https://www.google.com/finance/quote/${encodeURIComponent(symbol)}:${exchange}`;

  const res = await fetchWithTimeout(googleUrl);

  if (res.ok) {
    const html = await res.text();

    const gPriceMatch =
      html.match(
        /class="[^"]*(?:zhtAvb|ujg0He|N6SYTe)[^"]*"[\s\S]*?<span[^>]*jsname="Pdsbrc"[^>]*><span>[^0-9]*([\d,.]+)/i
      ) || html.match(/class="[^"]*YMlKec fxKbKc[^"]*"[^>]*>[^0-9]*([\d,.]+)/i);

    if (gPriceMatch?.[1]) {
      const cmp = parseFloat(gPriceMatch[1].replace(/,/g, ""));
      if (!isNaN(cmp) && cmp > 0) {
        // google shuffles classes, match 'P/E ratio' text and take next div
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

export async function scrapeGoogleFinance(ticker: string): Promise<StockQuote | null> {
  return limit(async () => {
    try {
      return await scrapeOneTicker(ticker);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.debug(`[Google Finance] Timeout for ${ticker} (>${SCRAPE_TIMEOUT_MS}ms)`);
      } else {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`[Google Finance] Scrape failed for ${ticker}: ${msg}`);
      }
      return null;
    }
  });
}
