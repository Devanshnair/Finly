"use client";

import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { HoldingCalculated } from "../types/portfolio.types";
import { formatINR, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface TopMoversWidgetProps {
  topGainers: HoldingCalculated[];
  topLosers: HoldingCalculated[];
  compact?: boolean;
}

export function TopMoversWidget({ topGainers, topLosers, compact = false }: TopMoversWidgetProps) {
  const [activeTab, setActiveTab] = useState<"gainers" | "losers">("gainers");
  const items = activeTab === "gainers" ? topGainers : topLosers;

  return (
    <div
      className={cn(
        compact ? "p-4" : "p-5",
        "rounded-xl border border-border bg-bg-surface flex flex-col h-full"
      )}
    >
      <div className={cn("flex items-center justify-between", compact ? "mb-2.5" : "mb-4")}>
        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">
            Portfolio Movers
          </h3>
          <p className="text-xs text-text-muted mt-0.5">Top performers by nominal return</p>
        </div>

        <div className="flex p-0.5 rounded-lg bg-bg-surface-2 border border-border text-xs">
          <button
            onClick={() => setActiveTab("gainers")}
            className={cn(
              "px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer",
              activeTab === "gainers"
                ? "bg-bg-surface text-text-primary shadow-xs"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            Gainers
          </button>
          <button
            onClick={() => setActiveTab("losers")}
            className={cn(
              "px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer",
              activeTab === "losers"
                ? "bg-bg-surface text-text-primary shadow-xs"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            Losers
          </button>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border/60 flex-1 justify-around">
        {items.slice(0, compact ? 3 : 4).map((holding) => {
          const isPositive = holding.gainLoss !== null ? holding.gainLoss >= 0 : true;
          return (
            <div
              key={holding.id}
              className={cn(
                compact ? "py-1.5" : "py-2.5",
                "flex items-center justify-between text-xs"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center shrink-0",
                    isPositive ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative"
                  )}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-text-primary">{holding.particulars}</div>
                  <div className="text-[11px] text-text-muted">{holding.exchangeCode}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-text-primary tabular-nums">
                  {formatINR(holding.cmp)}
                </div>
                <div
                  className={cn(
                    "font-semibold tabular-nums text-[11px]",
                    isPositive ? "text-positive" : "text-negative"
                  )}
                >
                  {formatPercent(holding.gainLossPercent)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
