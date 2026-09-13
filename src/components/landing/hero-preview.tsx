"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import {
  LayoutDashboard,
  TableProperties,
  PanelLeftClose,
  Moon,
  Sun,
} from "lucide-react";
import { FinlyLogo } from "@/components/ui/finly-logo";
import { getHeroMockData } from "@/features/portfolio/data/mock-test-states";
import { KpiSummaryCards } from "@/features/portfolio/components/kpi-summary-cards";
import { SectorAllocationChart } from "@/features/portfolio/components/sector-allocation-chart";
import { SectorBarChart } from "@/features/portfolio/components/sector-bar-chart";
import { TopMoversWidget } from "@/features/portfolio/components/top-movers-widget";

const emptySubscribe = () => () => {};

export function HeroPreview() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Purely static, deterministic mock data snapshot showing clean portfolio in loss
  const summary = useMemo(() => getHeroMockData(), []);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-bg-surface shadow-2xl shadow-black/10 dark:shadow-black/50 pointer-events-none select-none text-left flex">
      {/* ── Dashboard Sidebar ─────────────────────────────────────────── */}
      <aside className="w-28 sm:w-32 lg:w-36 border-r border-border bg-bg-surface flex flex-col shrink-0">
        {/* Sidebar Logo Header */}
        <div className="h-11 sm:h-12 border-b border-border px-3 sm:px-3.5 flex items-center">
          <FinlyLogo />
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 flex-1">
          {/* Active Overview Tab */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bg-surface-2 text-text-primary font-medium text-xs border border-border/50">
            <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
            <span>Overview</span>
          </div>

          {/* Holdings Tab */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-muted text-xs">
            <TableProperties className="w-3.5 h-3.5" />
            <span>Holdings</span>
          </div>
        </nav>
      </aside>

      {/* ── Main Dashboard Body ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-page">
        {/* Dashboard Top Nav Bar (without "Portfolio" and without "26/26 Live") */}
        <header className="h-11 sm:h-12 border-b border-border bg-bg-surface/90 px-3.5 sm:px-5 flex items-center justify-between shrink-0">
          {/* Left: Sidebar toggle icon */}
          <div className="flex items-center">
            <div className="p-1.5 rounded-lg text-text-muted hover:bg-bg-surface-2">
              <PanelLeftClose className="w-4 h-4" />
            </div>
          </div>

          {/* Right: Theme toggle button icon */}
          <div className="flex items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-border bg-bg-surface flex items-center justify-center text-text-secondary">
              <Moon className="w-3.5 h-3.5 hidden dark:block" />
              <Sun className="w-3.5 h-3.5 block dark:hidden" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-3.5 sm:p-5 space-y-3.5 max-h-[640px] sm:max-h-[690px] lg:max-h-[730px] overflow-hidden">
          {/* Overview Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary">
                Overview
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Portfolio summary, sector allocation, and top movers
              </p>
            </div>
          </div>

          {/* Compact KPI Summary Cards — displaying portfolio in loss */}
          <KpiSummaryCards summary={summary} compact />

          {/* Charts Row 1: Balanced Sector Donut + Movers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
            <div className="lg:col-span-2">
              {mounted ? (
                <SectorAllocationChart sectors={summary.sectors} compact />
              ) : (
                <div className="h-44 rounded-xl border border-border bg-bg-surface" />
              )}
            </div>
            <div>
              <TopMoversWidget
                topGainers={summary.topGainers}
                topLosers={summary.topLosers}
                compact
              />
            </div>
          </div>

          {/* Charts Row 2: Invested vs Present Value Bar Chart */}
          {mounted ? (
            <SectorBarChart sectors={summary.sectors} />
          ) : (
            <div className="h-56 rounded-xl border border-border bg-bg-surface" />
          )}
        </div>
      </div>

      {/* ── Bottom Gradient Mask: Seamless fade across sidebar and content ── */}
      <div className="hero-mask-gradient absolute bottom-0 left-0 right-0 h-24 pointer-events-none" />
    </div>
  );
}
