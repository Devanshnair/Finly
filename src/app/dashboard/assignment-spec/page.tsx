"use client";

import React, { useState, useMemo } from "react";
import { AlertCircle, Search, RefreshCw, Info } from "lucide-react";
import { usePortfolioSse } from "@/features/portfolio/hooks/use-portfolio-sse";
import { PortfolioTable } from "@/features/portfolio/components/portfolio-table";
import { LiveStatus } from "@/features/portfolio/components/live-status";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AssignmentSpecPage() {
  const {
    data: summary,
    isLoading,
    isError,
    priceChanges,
    isFetching,
    status,
    refetch,
  } = usePortfolioSse({
    endpoint: "/api/portfolio/assignment-spec",
    queryKey: ["portfolio", "assignment-spec"],
  });

  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const sectorOptions = useMemo(() => {
    if (!summary?.sectors) return [];
    return summary.sectors.map((s) => ({
      value: s.sector,
      label: `${s.sector} (${s.holdings.length})`,
    }));
  }, [summary]);

  if (isError) {
    return (
      <div className="p-4 rounded-xl border border-negative-bg bg-negative-bg/30 text-negative flex items-center gap-3 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Market data is temporarily unavailable. Please try again in a moment.</span>
        <button
          onClick={() => refetch()}
          className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-md bg-negative/20 text-text-primary hover:bg-negative/30 font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    );
  }

  if (isLoading && !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 rounded-xl bg-bg-surface border border-border" />
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 rounded bg-bg-surface border border-border" />
          <div className="h-4 w-40 rounded bg-bg-surface border border-border" />
        </div>
        <div className="h-10 rounded-lg bg-bg-surface border border-border" />
        <div className="h-96 rounded-xl bg-bg-surface border border-border" />
      </div>
    );
  }

  if (!summary) return null;

  const filteredSectors =
    selectedSector === "all"
      ? summary.sectors
      : summary.sectors.filter((s) => s.sector === selectedSector);

  const totalPositions = filteredSectors.reduce((acc, s) => acc + s.holdings.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-bg-surface px-3 py-2">
        <Info className="h-3.5 w-3.5 shrink-0 text-accent" />
        <p className="text-xs text-text-secondary">
          Live market data is fetched from{" "}
          <span className="font-medium text-text-primary">Yahoo Finance</span>; P/E and EPS data is
          fetched from <span className="font-medium text-text-primary">Google Finance</span>.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Holdings</h1>
          <p className="text-xs text-text-muted mt-0.5">
            <span className="font-medium text-text-secondary tabular-nums">
              {summary.holdingsCount}
            </span>{" "}
            positions across{" "}
            <span className="font-medium text-text-secondary tabular-nums">
              {summary.sectorsCount}
            </span>{" "}
            sectors
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
            streamMode="polling"
            onRefresh={refetch}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            id="assignment-spec-search"
            type="text"
            placeholder="Search stocks or ticker…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-bg-surface placeholder:text-text-muted text-text-primary focus:outline-none focus:border-text-primary transition-colors"
          />
        </div>

        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-full sm:w-48 text-xs h-8" id="assignment-spec-sector-filter">
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectorOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-text-muted shrink-0 px-1">
          {totalPositions} position{totalPositions !== 1 ? "s" : ""}
        </span>
      </div>

      <PortfolioTable
        sectors={filteredSectors}
        priceChanges={priceChanges}
        searchQuery={searchQuery}
      />
    </div>
  );
}
