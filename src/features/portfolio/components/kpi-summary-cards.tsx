"use client";

import React from "react";
import { PortfolioSummary } from "../types/portfolio.types";
import { formatINR, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface KpiSummaryCardsProps {
  summary: PortfolioSummary;
  compact?: boolean;
}

export function KpiSummaryCards({ summary, compact = false }: KpiSummaryCardsProps) {
  const hasGainLoss = summary.totalGainLoss !== null;
  const isGain = hasGainLoss ? (summary.totalGainLoss as number) >= 0 : null;

  const cardPadding = compact ? "p-3.5" : "p-5";
  const labelMargin = compact ? "mt-1.5" : "mt-3";
  const valueSize = compact ? "text-xl" : "text-2xl";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Investment */}
      <div
        className={cn(
          cardPadding,
          "rounded-xl border border-border bg-bg-surface flex flex-col justify-between transition-colors hover:border-text-secondary/40"
        )}
      >
        <span className="text-xs uppercase tracking-wider font-medium text-text-muted">
          Total Investment
        </span>
        <div className={labelMargin}>
          <div
            className={cn(valueSize, "font-semibold tracking-tight text-text-primary tabular-nums")}
          >
            {formatINR(summary.totalInvestment)}
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Cost basis · {summary.holdingsCount} stocks
          </p>
        </div>
      </div>

      {/* 2. Present Value */}
      <div
        className={cn(
          cardPadding,
          "rounded-xl border border-border bg-bg-surface flex flex-col justify-between transition-colors hover:border-text-secondary/40"
        )}
      >
        <span className="text-xs uppercase tracking-wider font-medium text-text-muted">
          Current Value
        </span>
        <div className={labelMargin}>
          <div
            className={cn(valueSize, "font-semibold tracking-tight text-text-primary tabular-nums")}
          >
            {formatINR(summary.totalPresentValue)}
          </div>
          <p className="text-xs text-text-muted mt-0.5">Live market valuation</p>
        </div>
      </div>

      {/* 3. Total Gain / Loss */}
      <div
        className={cn(
          cardPadding,
          "rounded-xl border border-border bg-bg-surface flex flex-col justify-between transition-colors hover:border-text-secondary/40"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-medium text-text-muted">
            Total Gain / Loss
          </span>
          {isGain !== null && (
            <span
              className={cn(
                "text-sm font-bold leading-none",
                isGain ? "text-positive" : "text-negative"
              )}
            >
              {isGain ? "▲" : "▼"}
            </span>
          )}
        </div>
        <div className={labelMargin}>
          <div
            className={cn(
              valueSize,
              "font-semibold tracking-tight tabular-nums",
              isGain === true && "text-positive",
              isGain === false && "text-negative",
              isGain === null && "text-text-muted"
            )}
          >
            {formatINR(summary.totalGainLoss, { showSign: true })}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {summary.gainLossPercent !== null ? (
              <span
                className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold tabular-nums",
                  isGain ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative"
                )}
              >
                {formatPercent(summary.gainLossPercent)}
              </span>
            ) : null}
            <span className="text-xs text-text-muted">overall return</span>
          </div>
        </div>
      </div>

      {/* 4. Avg P/E */}
      <div
        className={cn(
          cardPadding,
          "rounded-xl border border-border bg-bg-surface flex flex-col justify-between transition-colors hover:border-text-secondary/40"
        )}
      >
        <span className="text-xs uppercase tracking-wider font-medium text-text-muted">
          Avg P/E Ratio
        </span>
        <div className={labelMargin}>
          <div
            className={cn(valueSize, "font-semibold tracking-tight text-text-primary tabular-nums")}
          >
            {(summary.avgPe ?? null) !== null ? (summary.avgPe as number).toFixed(1) : "N/A"}
          </div>
          <p className="text-xs text-text-muted mt-0.5">Weighted by cost basis</p>
        </div>
      </div>
    </div>
  );
}
