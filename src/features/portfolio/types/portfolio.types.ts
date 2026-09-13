export interface HoldingBaseline {
  cmp: number | null;
  pe: number | null;
  latestEarnings: number | null;
}

export interface HoldingSeed {
  id: string;
  sector: string;
  particulars: string;
  purchasePrice: number;
  quantity: number;
  exchangeCode: string;
  ticker: string;
  baseline: HoldingBaseline;
}

export interface StockQuote {
  ticker: string;
  cmp: number | null;
  pe: number | null;
  latestEarnings: number | null;
  fetchedAt: number;
  isStale?: boolean;
  source?: "yahoo-finance" | "google-finance" | "cache" | "error" | "assignment-spec";
  status?: "live" | "stale" | "error";
}

export interface HoldingCalculated extends HoldingSeed {
  cmp: number | null;
  investment: number;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercent: number | null;
  portfolioWeight: number; // percentage (0 - 100)
  pe: number | null;
  latestEarnings: number | null;
  isStale: boolean;
  source: string;
  status: "live" | "stale" | "error";
}

export interface SectorSummary {
  sector: string;
  holdings: HoldingCalculated[];
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  gainLossPercent: number | null;
  portfolioWeight: number; // percentage of total portfolio
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  gainLossPercent: number | null;
  holdingsCount: number;
  sectorsCount: number;
  avgPe: number | null;
  sectors: SectorSummary[];
  holdings: HoldingCalculated[];
  topGainers: HoldingCalculated[];
  topLosers: HoldingCalculated[];
  lastUpdated: string;
  hasStaleData: boolean;
  hasErrorData: boolean;
  liveCount: number;
  staleCount: number;
  offlineCount: number;
}

export interface PortfolioApiResponse {
  success: boolean;
  data: PortfolioSummary;
  meta: {
    fetchedAt: string;
    refreshIntervalSeconds: number;
  };
}
