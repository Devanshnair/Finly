"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { portfolioKeys } from "./portfolio.keys";
import { PortfolioApiResponse, PortfolioSummary } from "../types/portfolio.types";
import { computePriceChanges, PriceChangeDirection } from "../utils/price-changes";
import { apiClient } from "@/lib/api-client";

export type { PriceChangeDirection };
export type SseConnectionStatus = "connecting" | "connected" | "error";

export function usePortfolioSse(options?: { endpoint?: string; queryKey?: readonly unknown[] }) {
  const queryClient = useQueryClient();
  const previousPricesRef = useRef<Record<string, number>>({});
  const [priceChanges, setPriceChanges] = useState<Record<string, PriceChangeDirection>>({});
  const [sseStatus, setSseStatus] = useState<SseConnectionStatus>("connecting");
  const [isManualFetching, setIsManualFetching] = useState(false);

  const endpoint = options?.endpoint ?? "/api/portfolio";
  const isSseActive = endpoint === "/api/portfolio";

  // stable query key reference so query does not churn
  const queryKey = useMemo(
    () =>
      options?.queryKey ??
      (endpoint === "/api/portfolio" ? portfolioKeys.summary() : ["portfolio", endpoint]),
    [options?.queryKey, endpoint]
  );

  // no polling, cache slot only
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<PortfolioSummary> => {
      const res = await apiClient.get<PortfolioApiResponse>(endpoint);
      return res.data.data;
    },
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const handleIncomingData = useCallback(
    (data: PortfolioSummary) => {
      queryClient.setQueryData(queryKey, data);

      if (data.holdings) {
        const { changes, hasChanges } = computePriceChanges(
          data.holdings,
          previousPricesRef.current
        );
        if (hasChanges) {
          setPriceChanges(changes);
          setTimeout(() => {
            setPriceChanges({});
          }, 1000);
        }
      }
    },
    [queryClient, queryKey]
  );

  // keep ref so stream effect only mounts once and does not close on re-renders
  const handleIncomingDataRef = useRef(handleIncomingData);
  useEffect(() => {
    handleIncomingDataRef.current = handleIncomingData;
  }, [handleIncomingData]);

  useEffect(() => {
    if (!isSseActive) {
      setSseStatus("connected");
      return;
    }

    let es: EventSource | null = null;

    try {
      es = new EventSource("/api/portfolio/sse");

      // browser auto-reconnect return path
      es.onopen = () => {
        setSseStatus("connected");
      };

      es.onmessage = (event) => {
        try {
          const data: PortfolioSummary = JSON.parse(event.data);
          handleIncomingDataRef.current(data);
          setSseStatus("connected");
        } catch {
          // bad json ignore
        }
      };

      es.onerror = () => {
        setSseStatus("error");
      };
    } catch {
      setSseStatus("error");
    }

    return () => {
      if (es) {
        es.close();
      }
    };
  }, [isSseActive]);

  const refetch = useCallback(async () => {
    setIsManualFetching(true);
    try {
      const res = await apiClient.get<PortfolioApiResponse>(endpoint);
      handleIncomingData(res.data.data);
    } catch (err) {
      console.error("refresh fail", err);
    } finally {
      setIsManualFetching(false);
    }
  }, [handleIncomingData, endpoint]);

  return {
    data: query.data,
    isLoading: query.isLoading && !query.data,
    isError: query.isError && !query.data && sseStatus === "error",
    isFetching: isManualFetching,
    status: sseStatus,
    priceChanges,
    refetch,
  };
}
