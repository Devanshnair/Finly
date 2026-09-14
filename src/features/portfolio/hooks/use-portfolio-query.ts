"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { portfolioKeys } from "./portfolio.keys";
import { PortfolioApiResponse, PortfolioSummary } from "../types/portfolio.types";

export type PriceChangeDirection = "up" | "down" | "unchanged";

export function usePortfolioQuery(options?: { endpoint?: string; queryKey?: readonly unknown[] }) {
  const previousPricesRef = useRef<Record<string, number>>({});
  const [priceChanges, setPriceChanges] = useState<Record<string, PriceChangeDirection>>({});

  const endpoint = options?.endpoint ?? "/api/portfolio";
  const queryKey =
    options?.queryKey ??
    (endpoint === "/api/portfolio" ? portfolioKeys.summary() : ["portfolio", endpoint]);

  // The assignment-spec endpoint hits 26 external URLs concurrently. With per-scrape
  // AbortController timeouts (~4s), the round should land in 4–6s. 15s gives honest
  // headroom without the "more rope for the retry storm" problem of raising it to 35s.
  const requestTimeout = endpoint.includes("assignment-spec") ? 15_000 : 10_000;

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<PortfolioSummary> => {
      const res = await apiClient.get<PortfolioApiResponse>(endpoint, {
        timeout: requestTimeout,
      });
      return res.data.data;
    },
    refetchInterval: 15 * 1000, // 15 seconds polling per assignment brief
    refetchIntervalInBackground: false,
    staleTime: 5 * 1000,
    // Default retry:3 turns a single slow request into a retry storm — each
    // retry re-scrapes all 26 tickers and compounds the timeout pressure.
    retry: 1,
    retryDelay: 2000,
  });

  // Compare previous vs new CMP to trigger flash animations
  useEffect(() => {
    if (!query.data?.holdings) return;

    const changes: Record<string, PriceChangeDirection> = {};
    const prev = previousPricesRef.current;
    let hasChanges = false;

    for (const h of query.data.holdings) {
      if (h.cmp === null) continue;
      const prevPrice = prev[h.ticker];
      if (prevPrice !== undefined && prevPrice !== h.cmp) {
        changes[h.ticker] = h.cmp > prevPrice ? "up" : "down";
        hasChanges = true;
      }
      prev[h.ticker] = h.cmp;
    }

    if (hasChanges) {
      let clearTimer: NodeJS.Timeout;
      const frameId = requestAnimationFrame(() => {
        setPriceChanges(changes);
        clearTimer = setTimeout(() => {
          setPriceChanges({});
        }, 1000);
      });
      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(clearTimer);
      };
    }
  }, [query.data]);

  return {
    ...query,
    priceChanges,
  };
}
