"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { usePortfolioSse } from "@/features/portfolio/hooks/use-portfolio-sse";
import { KpiSummaryCards } from "@/features/portfolio/components/kpi-summary-cards";
import { SectorAllocationChart } from "@/features/portfolio/components/sector-allocation-chart";
import { SectorBarChart } from "@/features/portfolio/components/sector-bar-chart";
import { TopMoversWidget } from "@/features/portfolio/components/top-movers-widget";
import { formatINR, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { HoldingCalculated } from "@/features/portfolio/types/portfolio.types";
import { LiveStatus } from "@/features/portfolio/components/live-status";

function TopHoldingsPreview({ holdings, total }: { holdings: HoldingCalculated[]; total: number }) {
  const top5 = useMemo(
    () => [...holdings].sort((a, b) => (b.presentValue ?? 0) - (a.presentValue ?? 0)).slice(0, 5),
    [holdings]
  );

  return (
    <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">Top Holdings</h3>
          <p className="text-xs text-text-muted mt-0.5">By present value</p>
        </div>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-y border-border bg-bg-surface-2/50 text-text-muted font-medium">
            <th className="py-2 px-5 text-left font-normal">Stock</th>
            <th className="py-2 px-4 text-right font-normal">CMP</th>
            <th className="py-2 px-4 text-right font-normal">Present Value</th>
            <th className="py-2 px-4 text-right font-normal">G/L</th>
          </tr>
        </thead>
        <tbody>
          {top5.map((h) => {
            const hasGain = h.gainLoss !== null;
            const isGain = hasGain ? (h.gainLoss as number) >= 0 : null;
            return (
              <tr
                key={h.id}
                className="border-b border-border/50 hover:bg-bg-surface-2/40 transition-colors"
              >
                <td className="py-2.5 px-5">
                  <div className="font-medium text-text-primary">{h.particulars}</div>
                  <div className="text-[11px] text-text-muted">{h.exchangeCode}</div>
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-text-secondary">
                  {formatINR(h.cmp)}
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums font-medium text-text-primary">
                  {formatINR(h.presentValue)}
                </td>
                <td className="py-2.5 px-4 text-right">
                  {isGain !== null ? (
                    <div className="flex items-center justify-end gap-1">
                      {isGain ? (
                        <ArrowUpRight className="w-3 h-3 text-positive shrink-0" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-negative shrink-0" />
                      )}
                      <span
                        className={cn(
                          "tabular-nums font-semibold",
                          isGain ? "text-positive" : "text-negative"
                        )}
                      >
                        {formatPercent(h.gainLossPercent)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Link
        href="/dashboard/holdings"
        className="flex items-center justify-between px-5 py-3 text-xs text-text-muted hover:text-text-primary hover:bg-bg-surface-2/40 transition-colors group"
      >
        <span>View all {total} positions</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}

export default function OverviewPage() {
  const { data: summary, isLoading, isError, isFetching, status, refetch } = usePortfolioSse();

  if (isError) {
    return (
      <div className="p-4 rounded-xl border border-negative-bg bg-negative-bg/30 text-negative flex items-center gap-3 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Market data is temporarily unavailable. Please try again in a moment.</span>
      </div>
    );
  }

  if (isLoading && !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 rounded bg-bg-surface border border-border" />
          <div className="h-4 w-40 rounded bg-bg-surface border border-border" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-bg-surface border border-border" />
          ))}
        </div>
        <div className="h-11 rounded-2xl bg-bg-surface-2 border border-border" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-xl bg-bg-surface border border-border" />
          <div className="h-64 rounded-xl bg-bg-surface border border-border" />
        </div>
        <div className="h-64 rounded-xl bg-bg-surface border border-border" />
        <div className="h-64 rounded-xl bg-bg-surface border border-border" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Overview</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Portfolio summary, sector allocation, and top movers
          </p>
        </div>
        <div className="flex items-center">
          <LiveStatus
            lastUpdated={summary.lastUpdated}
            isFetching={isFetching}
            hasStaleData={summary.hasStaleData}
            hasErrorData={summary.hasErrorData}
            totalCount={summary.holdingsCount}
            liveCount={summary.liveCount}
            offlineCount={summary.offlineCount}
            streamMode="sse"
            sseStatus={status}
            onRefresh={refetch}
          />
        </div>
      </div>

      <KpiSummaryCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <SectorAllocationChart sectors={summary.sectors} />
        </div>
        <div>
          <TopMoversWidget topGainers={summary.topGainers} topLosers={summary.topLosers} />
        </div>
      </div>

      <SectorBarChart sectors={summary.sectors} />

      <TopHoldingsPreview holdings={summary.holdings} total={summary.holdingsCount} />
    </div>
  );
}
