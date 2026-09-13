import {
  HoldingSeed,
  StockQuote,
  HoldingCalculated,
  SectorSummary,
  PortfolioSummary,
} from "../types/portfolio.types";

/**
 * Pure calculation functions for portfolio financial metrics.
 * Deterministic, unit-testable, with division-by-zero guards.
 */

export function calculateInvestment(purchasePrice: number, quantity: number): number {
  return Number((purchasePrice * quantity).toFixed(2));
}

export function calculatePresentValue(cmp: number, quantity: number): number {
  return Number((cmp * quantity).toFixed(2));
}

export function calculateGainLoss(presentValue: number, investment: number): number {
  return Number((presentValue - investment).toFixed(2));
}

export function calculateGainLossPercent(gainLoss: number, investment: number): number {
  if (investment <= 0) return 0;
  return Number(((gainLoss / investment) * 100).toFixed(2));
}

export function calculatePortfolioWeight(investment: number, totalInvestment: number): number {
  if (totalInvestment <= 0) return 0;
  return Number(((investment / totalInvestment) * 100).toFixed(4));
}

/**
 * Merges a holding seed with its quote and calculates holding-level metrics.
 * Strictly avoids substituting missing live quotes with historical baseline mock prices.
 */
export function calculateHolding(
  seed: HoldingSeed,
  quote: StockQuote | undefined,
  totalPortfolioInvestment: number
): HoldingCalculated {
  const investment = calculateInvestment(seed.purchasePrice, seed.quantity);
  
  // Resolve CMP strictly from live quote or cached quote (null if missing/error)
  const cmp = (typeof quote?.cmp === "number" && !isNaN(quote.cmp)) ? quote.cmp : null;
  const presentValue = cmp !== null ? calculatePresentValue(cmp, seed.quantity) : null;
  const gainLoss = presentValue !== null ? calculateGainLoss(presentValue, investment) : null;
  const gainLossPercent = (gainLoss !== null && investment > 0) ? calculateGainLossPercent(gainLoss, investment) : null;
  const portfolioWeight = calculatePortfolioWeight(investment, totalPortfolioInvestment);

  const pe = (typeof quote?.pe === "number") ? quote.pe : null;
  const latestEarnings = (typeof quote?.latestEarnings === "number") ? quote.latestEarnings : null;
  // Status is the single source of truth; isStale is strictly derived from status
  const status: "live" | "stale" | "error" = quote?.status ?? (cmp === null ? "error" : quote?.isStale ? "stale" : "live");
  const isStale = status === "stale";
  const source = quote?.source ?? (cmp === null ? "error" : "cache");

  return {
    ...seed,
    cmp,
    investment,
    presentValue,
    gainLoss,
    gainLossPercent,
    portfolioWeight,
    pe,
    latestEarnings,
    isStale,
    source,
    status,
  };
}

/**
 * Groups calculated holdings by sector and computes sector-level aggregates.
 */
export function calculateSectorSummary(
  sectorName: string,
  holdings: HoldingCalculated[],
  totalPortfolioInvestment: number
): SectorSummary {
  const totalInvestment = Number(
    holdings.reduce((sum, h) => sum + h.investment, 0).toFixed(2)
  );
  
  const hasAnyPresentValue = holdings.some((h) => h.presentValue !== null);
  const totalPresentValue = hasAnyPresentValue
    ? Number(holdings.reduce((sum, h) => sum + (h.presentValue ?? 0), 0).toFixed(2))
    : null;

  const totalGainLoss = totalPresentValue !== null ? calculateGainLoss(totalPresentValue, totalInvestment) : null;
  const gainLossPercent = totalGainLoss !== null ? calculateGainLossPercent(totalGainLoss, totalInvestment) : null;
  const portfolioWeight = calculatePortfolioWeight(totalInvestment, totalPortfolioInvestment);

  return {
    sector: sectorName,
    holdings,
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    gainLossPercent,
    portfolioWeight,
  };
}

/**
 * Calculates a portfolio-level weighted average P/E ratio.
 * Only includes holdings that have a valid P/E and non-zero investment weight.
 * Weight = holding's investment / total portfolio investment.
 */
export function calculateAvgPe(holdings: HoldingCalculated[], totalInvestment: number): number | null {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const h of holdings) {
    if (h.pe !== null && h.pe > 0 && totalInvestment > 0) {
      const weight = h.investment / totalInvestment;
      weightedSum += h.pe * weight;
      totalWeight += weight;
    }
  }
  if (totalWeight === 0) return null;
  return Number((weightedSum / totalWeight).toFixed(1));
}

/**
 * Master calculation function: takes raw holdings seed and live quotes map,
 * and produces the comprehensive PortfolioSummary.
 */
export function calculatePortfolio(
  seedHoldings: HoldingSeed[],
  quotesMap: Record<string, StockQuote>
): PortfolioSummary {
  // 1. Calculate preliminary total initial investment across all holdings
  const totalInvestment = Number(
    seedHoldings
      .reduce((sum, h) => sum + calculateInvestment(h.purchasePrice, h.quantity), 0)
      .toFixed(2)
  );

  // 2. Calculate individual holding metrics
  const calculatedHoldings: HoldingCalculated[] = seedHoldings.map((seed) => {
    const quote = quotesMap[seed.ticker];
    if (process.env.NODE_ENV !== "production" && !quote) {
      console.warn(`[PortfolioCalculator] Missing quote entry for canonical ticker: ${seed.ticker}`);
    }
    return calculateHolding(seed, quote, totalInvestment);
  });

  // 3. Group by sector
  const sectorGroups = new Map<string, HoldingCalculated[]>();
  for (const h of calculatedHoldings) {
    const list = sectorGroups.get(h.sector) ?? [];
    list.push(h);
    sectorGroups.set(h.sector, list);
  }

  const sectors: SectorSummary[] = Array.from(sectorGroups.entries()).map(([name, group]) =>
    calculateSectorSummary(name, group, totalInvestment)
  );

  // 4. Overall portfolio totals
  const hasAnyPresentValue = calculatedHoldings.some((h) => h.presentValue !== null);
  const totalPresentValue = hasAnyPresentValue
    ? Number(calculatedHoldings.reduce((sum, h) => sum + (h.presentValue ?? 0), 0).toFixed(2))
    : null;
  const totalGainLoss = totalPresentValue !== null ? calculateGainLoss(totalPresentValue, totalInvestment) : null;
  const gainLossPercent = totalGainLoss !== null ? calculateGainLossPercent(totalGainLoss, totalInvestment) : null;

  // 5. Rank top gainers & top losers (only among holdings with valid gain/loss %)
  const validMoverHoldings = calculatedHoldings.filter((h) => h.gainLossPercent !== null);
  const sorted = [...validMoverHoldings].sort(
    (a, b) => (b.gainLossPercent ?? 0) - (a.gainLossPercent ?? 0)
  );
  const topGainers = sorted.slice(0, 5);
  const topLosers = sorted.slice(-5).reverse();

  // Status partitions are mutually exclusive by definition
  const offlineCount = calculatedHoldings.filter((h) => h.status === "error" || h.cmp === null).length;
  const staleCount = calculatedHoldings.filter((h) => h.status === "stale" && h.cmp !== null).length;
  const liveCount = calculatedHoldings.filter((h) => h.status === "live" && h.cmp !== null).length;
  const hasStaleData = staleCount > 0;
  const hasErrorData = offlineCount > 0;
  const avgPe = calculateAvgPe(calculatedHoldings, totalInvestment);

  return {
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    gainLossPercent,
    holdingsCount: calculatedHoldings.length,
    sectorsCount: sectors.length,
    avgPe,
    sectors,
    holdings: calculatedHoldings,
    topGainers,
    topLosers,
    lastUpdated: new Date().toISOString(),
    hasStaleData,
    hasErrorData,
    liveCount,
    staleCount,
    offlineCount,
  };
}
