"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SectorSummary } from "../types/portfolio.types";
import { formatINR, formatPercent, formatRatio, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { PriceChangeDirection } from "../hooks/use-portfolio-query";

interface PortfolioTableProps {
  sectors: SectorSummary[];
  priceChanges: Record<string, PriceChangeDirection>;
  searchQuery?: string;
}

export function PortfolioTable({ sectors, priceChanges, searchQuery = "" }: PortfolioTableProps) {
  const [collapsedSectors, setCollapsedSectors] = useState<Record<string, boolean>>({});

  const toggleSector = (sector: string) => {
    setCollapsedSectors((prev) => ({
      ...prev,
      [sector]: !prev[sector],
    }));
  };

  const toggleAllSectors = (collapse: boolean) => {
    const newState: Record<string, boolean> = {};
    sectors.forEach((s) => {
      newState[s.sector] = collapse;
    });
    setCollapsedSectors(newState);
  };

  const filteredSectors = useMemo(() => {
    return sectors
      .map((sec) => {
        const matchingHoldings = sec.holdings.filter((h) => {
          if (!searchQuery.trim()) return true;
          const query = searchQuery.toLowerCase();
          return (
            h.particulars.toLowerCase().includes(query) ||
            h.exchangeCode.toLowerCase().includes(query) ||
            h.ticker.toLowerCase().includes(query)
          );
        });
        return { ...sec, holdings: matchingHoldings };
      })
      .filter((sec) => sec.holdings.length > 0);
  }, [sectors, searchQuery]);

  return (
    <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
      {/* Table Toolbar: expand/collapse all */}
      <div className="p-3.5 border-b border-border flex items-center justify-end gap-2 bg-bg-surface text-xs">
        <button
          onClick={() => toggleAllSectors(false)}
          className="px-2.5 py-1 rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-bg-surface-2 transition-colors cursor-pointer"
        >
          Expand All
        </button>
        <button
          onClick={() => toggleAllSectors(true)}
          className="px-2.5 py-1 rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-bg-surface-2 transition-colors cursor-pointer"
        >
          Collapse All
        </button>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-bg-surface text-text-muted font-medium select-none">
              <th className="py-3 px-4 font-normal">Particulars</th>
              <th className="py-3 px-3 font-normal text-right">Purchase Price</th>
              <th className="py-3 px-3 font-normal text-right">Qty</th>
              <th className="py-3 px-3 font-normal text-right">Investment</th>
              <th className="py-3 px-3 font-normal text-right">Portfolio (%)</th>
              <th className="py-3 px-3 font-normal text-center">NSE/BSE</th>
              <th className="py-3 px-4 font-normal text-right">CMP (Live)</th>
              <th className="py-3 px-4 font-normal text-right">Present Value</th>
              <th className="py-3 px-4 font-normal text-right">Gain / Loss</th>
              <th className="py-3 px-3 font-normal text-right">P/E</th>
              <th className="py-3 px-3 font-normal text-right">Earnings (EPS)</th>
            </tr>
          </thead>
          <tbody>
            {filteredSectors.map((sec) => {
              const isCollapsed = collapsedSectors[sec.sector];
              const isSecGain = sec.totalGainLoss !== null ? sec.totalGainLoss >= 0 : null;

              return (
                <React.Fragment key={sec.sector}>
                  {/* Sector Summary Row */}
                  <tr
                    onClick={() => toggleSector(sec.sector)}
                    className="border-b border-border bg-bg-surface-2/70 hover:bg-bg-surface-2 cursor-pointer transition-colors font-medium text-text-primary"
                  >
                    <td colSpan={3} className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted">
                          {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span className="font-semibold text-text-primary">{sec.sector}</span>
                        <span className="text-[11px] text-text-muted font-normal">
                          ({sec.holdings.length} stocks)
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">
                      {formatINR(sec.totalInvestment)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-text-muted">
                      {formatPercent(sec.portfolioWeight, { showSign: false })}
                    </td>
                    <td className="py-2.5 px-3 text-center text-text-muted">—</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-text-muted">—</td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-semibold">
                      {formatINR(sec.totalPresentValue)}
                    </td>
                    {/* Sector Subtotal Gain/Loss */}
                    <td className="py-2.5 px-4 text-right">
                      {sec.totalGainLoss !== null &&
                      sec.gainLossPercent !== null &&
                      isSecGain !== null ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className={cn(
                              "tabular-nums font-semibold",
                              isSecGain ? "text-positive" : "text-negative"
                            )}
                          >
                            {formatINR(sec.totalGainLoss, { showSign: true })}
                          </span>
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums",
                              isSecGain
                                ? "bg-positive-bg text-positive"
                                : "bg-negative-bg text-negative"
                            )}
                          >
                            {formatPercent(sec.gainLossPercent)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-text-muted">—</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-text-muted">—</td>
                  </tr>

                  {/* Individual Holdings under this sector */}
                  {!isCollapsed &&
                    sec.holdings.map((h) => {
                      const isHoldingGain = h.gainLoss !== null ? h.gainLoss >= 0 : null;
                      const priceDirection = priceChanges[h.ticker];

                      return (
                        <tr
                          key={h.id}
                          className="border-b border-border/50 hover:bg-bg-surface-2/40 transition-colors group"
                        >
                          {/* Stock Particulars */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-text-primary">{h.particulars}</span>
                              {h.status === "error" || h.cmp === null ? (
                                <span
                                  className="px-1 py-0.2 rounded text-[10px] bg-negative-bg text-negative border border-negative/30"
                                  title="Live feed offline for this ticker"
                                >
                                  offline
                                </span>
                              ) : h.isStale ? (
                                <span
                                  className="px-1 py-0.2 rounded text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                  title="Cached / Stale price"
                                >
                                  stale
                                </span>
                              ) : null}
                            </div>
                          </td>

                          {/* Purchase Price */}
                          <td className="py-3 px-3 text-right tabular-nums text-text-secondary">
                            {formatINR(h.purchasePrice)}
                          </td>

                          {/* Quantity */}
                          <td className="py-3 px-3 text-right tabular-nums text-text-secondary">
                            {formatNumber(h.quantity)}
                          </td>

                          {/* Total Investment */}
                          <td className="py-3 px-3 text-right tabular-nums text-text-primary font-medium">
                            {formatINR(h.investment)}
                          </td>

                          {/* Portfolio Weight */}
                          <td className="py-3 px-3 text-right tabular-nums text-text-muted">
                            {formatPercent(h.portfolioWeight, { showSign: false })}
                          </td>

                          {/* Exchange Code */}
                          <td className="py-3 px-3 text-center">
                            <span className="px-1.5 py-0.5 rounded bg-bg-surface-2 border border-border text-[11px] font-mono text-text-muted">
                              {h.exchangeCode}
                            </span>
                          </td>

                          {/* Live CMP with Price Flash */}
                          <td
                            className={cn(
                              "py-3 px-4 text-right tabular-nums font-semibold transition-colors duration-500",
                              priceDirection === "up" && "flash-up text-positive",
                              priceDirection === "down" && "flash-down text-negative",
                              !priceDirection && "text-text-primary"
                            )}
                          >
                            {formatINR(h.cmp)}
                          </td>

                          {/* Present Value with Price Flash */}
                          <td
                            className={cn(
                              "py-3 px-4 text-right tabular-nums font-semibold transition-colors duration-500",
                              priceDirection === "up" && "flash-up text-positive",
                              priceDirection === "down" && "flash-down text-negative",
                              !priceDirection && "text-text-primary"
                            )}
                          >
                            {formatINR(h.presentValue)}
                          </td>

                          {/* Gain / Loss */}
                          <td className="py-3 px-4 text-right">
                            {h.gainLoss !== null &&
                            h.gainLossPercent !== null &&
                            isHoldingGain !== null ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <span
                                  className={cn(
                                    "tabular-nums font-medium",
                                    isHoldingGain ? "text-positive" : "text-negative"
                                  )}
                                >
                                  {formatINR(h.gainLoss, { showSign: true })}
                                </span>
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums",
                                    isHoldingGain
                                      ? "bg-positive-bg text-positive"
                                      : "bg-negative-bg text-negative"
                                  )}
                                >
                                  {formatPercent(h.gainLossPercent)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-text-muted">—</span>
                            )}
                          </td>

                          {/* P/E Ratio */}
                          <td className="py-3 px-3 text-right tabular-nums text-text-secondary">
                            {formatRatio(h.pe)}
                          </td>

                          {/* Latest Earnings (EPS) */}
                          <td className="py-3 px-3 text-right tabular-nums text-text-secondary">
                            {h.latestEarnings !== null ? formatINR(h.latestEarnings) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredSectors.length === 0 && (
        <div className="p-8 text-center text-text-muted text-xs">
          No holdings match your search criteria.
        </div>
      )}
    </div>
  );
}
