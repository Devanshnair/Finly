export type PriceChangeDirection = "up" | "down" | "unchanged";

export function computePriceChanges(
  holdings: Array<{ ticker: string; cmp: number | null }>,
  previousPrices: Record<string, number>
): { changes: Record<string, PriceChangeDirection>; hasChanges: boolean } {
  const changes: Record<string, PriceChangeDirection> = {};
  let hasChanges = false;

  for (const h of holdings) {
    if (h.cmp === null) continue;
    const prevPrice = previousPrices[h.ticker];
    if (prevPrice !== undefined && prevPrice !== h.cmp) {
      changes[h.ticker] = h.cmp > prevPrice ? "up" : "down";
      hasChanges = true;
    }
    previousPrices[h.ticker] = h.cmp;
  }

  return { changes, hasChanges };
}
