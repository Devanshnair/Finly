import { HoldingSeed, StockQuote, PortfolioSummary } from "../types/portfolio.types";
import { calculatePortfolio } from "../services/portfolio-calculator";

export const MOCK_HOLDINGS_SEED: HoldingSeed[] = [
  {
    id: "hdfc-bank",
    sector: "Financial Sector",
    particulars: "HDFC Bank",
    purchasePrice: 1490,
    quantity: 50,
    exchangeCode: "HDFCBANK",
    ticker: "HDFCBANK.NS",
    baseline: { cmp: 1700.15, pe: 18.69, latestEarnings: 91.02 },
  },
  {
    id: "bajaj-finance",
    sector: "Financial Sector",
    particulars: "Bajaj Finance",
    purchasePrice: 6466,
    quantity: 15,
    exchangeCode: "BAJFINANCE",
    ticker: "BAJFINANCE.NS",
    baseline: { cmp: 8419.6, pe: 32.63, latestEarnings: 257.8 },
  },
  {
    id: "icici-bank",
    sector: "Financial Sector",
    particulars: "ICICI Bank",
    purchasePrice: 780,
    quantity: 84,
    exchangeCode: "532174",
    ticker: "ICICIBANK.NS",
    baseline: { cmp: 1215.5, pe: 17.68, latestEarnings: 68.72 },
  },
  {
    id: "bajaj-housing",
    sector: "Financial Sector",
    particulars: "Bajaj Housing",
    purchasePrice: 130,
    quantity: 504,
    exchangeCode: "544252",
    ticker: "BAJAJHFL.NS",
    baseline: { cmp: 112.85, pe: 85.72, latestEarnings: 2.53 },
  },
  {
    id: "savani-financials",
    sector: "Financial Sector",
    particulars: "Savani Financials",
    purchasePrice: 24,
    quantity: 1080,
    exchangeCode: "511577",
    ticker: "511577.BO",
    baseline: { cmp: 14.86, pe: null, latestEarnings: null },
  },
  {
    id: "affle-india",
    sector: "Tech Sector",
    particulars: "Affle India",
    purchasePrice: 1151,
    quantity: 50,
    exchangeCode: "AFFLE",
    ticker: "AFFLE.NS",
    baseline: { cmp: 1459.6, pe: 55.53, latestEarnings: 26.11 },
  },
  {
    id: "lti-mindtree",
    sector: "Tech Sector",
    particulars: "LTI Mindtree",
    purchasePrice: 4775,
    quantity: 16,
    exchangeCode: "LTIM",
    ticker: "LTIM.NS",
    baseline: { cmp: 4793.8, pe: 34.69, latestEarnings: 145.92 },
  },
  {
    id: "kpit-tech",
    sector: "Tech Sector",
    particulars: "KPIT Tech",
    purchasePrice: 672,
    quantity: 61,
    exchangeCode: "542651",
    ticker: "KPITTECH.NS",
    baseline: { cmp: 1293.1, pe: 46.57, latestEarnings: 27.77 },
  },
  {
    id: "tata-tech",
    sector: "Tech Sector",
    particulars: "Tata Tech",
    purchasePrice: 1072,
    quantity: 63,
    exchangeCode: "544028",
    ticker: "TATATECH.NS",
    baseline: { cmp: 662, pe: 41.68, latestEarnings: 15.88 },
  },
  {
    id: "bls-e-services",
    sector: "Tech Sector",
    particulars: "BLS E-Services",
    purchasePrice: 232,
    quantity: 191,
    exchangeCode: "544107",
    ticker: "BLSE.NS",
    baseline: { cmp: 152.9, pe: 26.3, latestEarnings: 5.8 },
  },
  {
    id: "tanla",
    sector: "Tech Sector",
    particulars: "Tanla",
    purchasePrice: 1134,
    quantity: 45,
    exchangeCode: "532790",
    ticker: "TANLA.NS",
    baseline: { cmp: 449.5, pe: 11.64, latestEarnings: 39.48 },
  },
  {
    id: "dmart",
    sector: "Consumer",
    particulars: "Dmart",
    purchasePrice: 3777,
    quantity: 27,
    exchangeCode: "DMART",
    ticker: "DMART.NS",
    baseline: { cmp: 3451.1, pe: 82.63, latestEarnings: 41.75 },
  },
  {
    id: "tata-consumer",
    sector: "Consumer",
    particulars: "Tata Consumer",
    purchasePrice: 845,
    quantity: 90,
    exchangeCode: "532540",
    ticker: "TATACONSUM.NS",
    baseline: { cmp: 961.1, pe: 26.56, latestEarnings: 134.77 },
  },
  {
    id: "pidilite",
    sector: "Consumer",
    particulars: "Pidilite",
    purchasePrice: 2376,
    quantity: 36,
    exchangeCode: "500331",
    ticker: "PIDILITIND.NS",
    baseline: { cmp: 2730, pe: 71.13, latestEarnings: 38.36 },
  },
  {
    id: "tata-power",
    sector: "Power",
    particulars: "Tata Power",
    purchasePrice: 224,
    quantity: 225,
    exchangeCode: "500400",
    ticker: "TATAPOWER.NS",
    baseline: { cmp: 351, pe: 29.36, latestEarnings: 11.94 },
  },
  {
    id: "kpi-green",
    sector: "Power",
    particulars: "KPI Green",
    purchasePrice: 875,
    quantity: 50,
    exchangeCode: "542323",
    ticker: "KPIGREEN.NS",
    baseline: { cmp: 402.4, pe: 29.26, latestEarnings: 13.75 },
  },
  {
    id: "suzlon",
    sector: "Power",
    particulars: "Suzlon",
    purchasePrice: 44,
    quantity: 450,
    exchangeCode: "532667",
    ticker: "SUZLON.NS",
    baseline: { cmp: 51.36, pe: 61.25, latestEarnings: 0.84 },
  },
  {
    id: "gensol",
    sector: "Power",
    particulars: "Gensol",
    purchasePrice: 998,
    quantity: 45,
    exchangeCode: "542851",
    ticker: "GENSOL.NS",
    baseline: { cmp: 372.6, pe: 39.51, latestEarnings: 5.57 },
  },
  {
    id: "hariom-pipes",
    sector: "Pipe Sector",
    particulars: "Hariom Pipes",
    purchasePrice: 580,
    quantity: 60,
    exchangeCode: "543517",
    ticker: "HARIOMPIPE.NS",
    baseline: { cmp: 355.75, pe: 17.98, latestEarnings: 19.78 },
  },
  {
    id: "astral",
    sector: "Pipe Sector",
    particulars: "Astral",
    purchasePrice: 1517,
    quantity: 56,
    exchangeCode: "ASTRAL",
    ticker: "ASTRAL.NS",
    baseline: { cmp: 1317.6, pe: 67.13, latestEarnings: 19.59 },
  },
  {
    id: "polycab",
    sector: "Pipe Sector",
    particulars: "Polycab",
    purchasePrice: 2818,
    quantity: 28,
    exchangeCode: "542652",
    ticker: "POLYCAB.NS",
    baseline: { cmp: 5000, pe: 40.91, latestEarnings: 121.97 },
  },
  {
    id: "clean-science",
    sector: "Others",
    particulars: "Clean Science",
    purchasePrice: 1610,
    quantity: 32,
    exchangeCode: "543318",
    ticker: "CLEAN.NS",
    baseline: { cmp: 1237.45, pe: 50.37, latestEarnings: 24.52 },
  },
  {
    id: "deepak-nitrite",
    sector: "Others",
    particulars: "Deepak Nitrite",
    purchasePrice: 2248,
    quantity: 27,
    exchangeCode: "506401",
    ticker: "DEEPAKNTR.NS",
    baseline: { cmp: 1927.9, pe: 41.86, latestEarnings: 37.26 },
  },
  {
    id: "fine-organic",
    sector: "Others",
    particulars: "Fine Organic",
    purchasePrice: 4284,
    quantity: 16,
    exchangeCode: "541557",
    ticker: "FINEORG.NS",
    baseline: { cmp: 3743, pe: 41.86, latestEarnings: 37.26 },
  },
  {
    id: "gravita",
    sector: "Others",
    particulars: "Gravita",
    purchasePrice: 2037,
    quantity: 8,
    exchangeCode: "533282",
    ticker: "GRAVITA.NS",
    baseline: { cmp: 1614.2, pe: 41.86, latestEarnings: 37.26 },
  },
  {
    id: "sbi-life",
    sector: "Others",
    particulars: "SBI Life",
    purchasePrice: 1197,
    quantity: 49,
    exchangeCode: "540719",
    ticker: "SBILIFE.NS",
    baseline: { cmp: 1405.45, pe: null, latestEarnings: -5.82 },
  },
];

export function getPartialFeedOutageData(): PortfolioSummary {
  const quotesMap: Record<string, StockQuote> = {};

  for (const h of MOCK_HOLDINGS_SEED) {
    if (["511577.BO", "BAJAJHFL.NS", "BLSE.NS"].includes(h.ticker)) {
      quotesMap[h.ticker] = {
        ticker: h.ticker,
        cmp: null,
        pe: null,
        latestEarnings: null,
        fetchedAt: Date.now() - 3600000,
        isStale: true,
        source: "error",
        status: "error",
      };
    } else if (["HDFCBANK.NS", "LTIM.NS", "DMART.NS"].includes(h.ticker)) {
      quotesMap[h.ticker] = {
        ticker: h.ticker,
        cmp: h.baseline.cmp,
        pe: h.baseline.pe,
        latestEarnings: h.baseline.latestEarnings,
        fetchedAt: Date.now() - 45000,
        isStale: true,
        source: "cache",
        status: "stale",
      };
    } else {
      quotesMap[h.ticker] = {
        ticker: h.ticker,
        cmp: h.baseline.cmp,
        pe: h.baseline.pe,
        latestEarnings: h.baseline.latestEarnings,
        fetchedAt: Date.now(),
        isStale: false,
        source: "yahoo-finance",
        status: "live",
      };
    }
  }

  return calculatePortfolio(MOCK_HOLDINGS_SEED, quotesMap);
}

export function getStaleFallbackData(): PortfolioSummary {
  const quotesMap: Record<string, StockQuote> = {};

  for (const h of MOCK_HOLDINGS_SEED) {
    quotesMap[h.ticker] = {
      ticker: h.ticker,
      cmp: h.baseline.cmp,
      pe: h.baseline.pe,
      latestEarnings: h.baseline.latestEarnings,
      fetchedAt: Date.now() - 60000,
      isStale: true,
      source: "cache",
      status: "stale",
    };
  }

  return calculatePortfolio(MOCK_HOLDINGS_SEED, quotesMap);
}

export function getCompleteOutageData(): PortfolioSummary {
  const quotesMap: Record<string, StockQuote> = {};

  for (const h of MOCK_HOLDINGS_SEED) {
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

  return calculatePortfolio(MOCK_HOLDINGS_SEED, quotesMap);
}

export function getHealthyLiveData(): PortfolioSummary {
  const quotesMap: Record<string, StockQuote> = {};

  for (const h of MOCK_HOLDINGS_SEED) {
    quotesMap[h.ticker] = {
      ticker: h.ticker,
      cmp: h.baseline.cmp,
      pe: h.baseline.pe,
      latestEarnings: h.baseline.latestEarnings,
      fetchedAt: Date.now(),
      isStale: false,
      source: "yahoo-finance",
      status: "live",
    };
  }

  return calculatePortfolio(MOCK_HOLDINGS_SEED, quotesMap);
}

// snapshot for landing page hero preview
export function getHeroMockData(): PortfolioSummary {
  const quotesMap: Record<string, StockQuote> = {};

  for (const h of MOCK_HOLDINGS_SEED) {
    const factor = 0.89;
    const cmp = h.baseline.cmp !== null ? Number((h.baseline.cmp * factor).toFixed(2)) : null;

    quotesMap[h.ticker] = {
      ticker: h.ticker,
      cmp,
      pe: h.baseline.pe,
      latestEarnings: h.baseline.latestEarnings,
      fetchedAt: Date.now(),
      isStale: false,
      source: "yahoo-finance",
      status: "live",
    };
  }

  return calculatePortfolio(MOCK_HOLDINGS_SEED, quotesMap);
}
