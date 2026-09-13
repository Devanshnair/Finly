"use client";

import Link from "next/link";
// Kept for quick 1-line fallback if needed:
// import Image from "next/image";
import { ArrowRight, RefreshCw, Layers, TrendingUp, Shield } from "lucide-react";
import { FinlyLogo } from "@/components/ui/finly-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HeroPreview } from "@/components/landing/hero-preview";

const FEATURES = [
  {
    icon: RefreshCw,
    title: "Real-time updates",
    description:
      "Prices update every 15 seconds, so you're always looking at what the market is doing right now.",
  },
  {
    icon: Layers,
    title: "Sector breakdowns",
    description:
      "See exactly how each part of your portfolio is performing — not just the whole, but sector by sector.",
  },
  {
    icon: TrendingUp,
    title: "Valuation & fundamentals",
    description:
      "Valuation and earnings sit right next to your live prices — so you can judge a stock on more than just how much it moved today.",
  },
  {
    icon: Shield,
    title: "Honest status",
    description:
      "If we're not sure a number is current, we'll say so. You'll never mistake an old price for today's.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg-page/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <FinlyLogo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-neutral-950 font-semibold text-xs hover:opacity-90 transition-opacity group cursor-pointer"
            >
              Open Dashboard
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-16 pb-0 flex flex-col items-center text-center px-6 overflow-hidden">
        {/* Subtle radial glow behind content */}
        <div className="hero-glow pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-[0.07] dark:opacity-[0.12]" />

        {/* Headline — 2 lines with reduced font size */}
        <h1 className="hero-fade-up relative z-10 font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-[1.1] text-text-primary max-w-2xl">
          Your portfolio,
          <br />
          <span className="text-accent">live.</span>
        </h1>

        {/* Subheadline */}
        <p className="hero-fade-up animation-delay-80 relative z-10 mt-4 sm:mt-5 text-sm sm:text-base text-text-secondary max-w-xl leading-relaxed">
          Track your stock holdings with live prices, sector subtotals, and P/E ratios.
        </p>

        {/* CTA */}
        <div className="hero-fade-up animation-delay-160 relative z-10 mt-6 sm:mt-7 flex items-center justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-neutral-950 font-semibold text-sm hover:opacity-90 transition-opacity group cursor-pointer shadow-lg shadow-accent/10"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Dashboard Preview — exact dashboard layout (sidebar + header + overview) */}
        <div className="hero-scale-in animation-delay-280 relative z-10 mt-8 sm:mt-10 w-full max-w-5xl mx-auto">
          {/* Live component preview (auto-themes via CSS variables & ThemeProvider) */}
          <HeroPreview />

          {/* Fallback Static Screenshot (kept in public/Screenshot_14-9-2026_42520_localhost.jpeg):
          <div className="relative rounded-xl overflow-hidden border border-border/40 bg-bg-surface shadow-2xl shadow-black/50">
            <Image
              src="/Screenshot_14-9-2026_42520_localhost.jpeg"
              alt="Finly Dashboard"
              width={1887}
              height={965}
              className="w-full h-auto block object-cover object-top"
              priority
            />
            <div className="hero-mask-gradient absolute bottom-0 left-0 right-0 h-28 pointer-events-none" />
          </div>
          */}
        </div>
      </section>

      {/* ── Feature cards ───────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary text-center tracking-tight mb-16">
            Everything you need to track your positions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-bg-surface p-6 hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-bg-surface-2 border border-border group-hover:border-accent/30 transition-colors">
                    <f.icon className="w-4 h-4 text-text-secondary" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-text-primary">
                    {f.title}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA banner ────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border bg-bg-surface relative overflow-hidden px-8 py-16 text-center">
            {/* Subtle accent glow inside card */}
            <div className="hero-glow-top pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 opacity-[0.08] dark:opacity-[0.14]" />
            <h2 className="relative font-display text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-4">
              See it live.
            </h2>
            <p className="relative text-text-secondary text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Real market data, updated continuously — no mocked numbers, no placeholders.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-accent text-neutral-950 font-semibold text-sm hover:opacity-90 transition-opacity group cursor-pointer"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <span>
            <span className="font-display font-bold text-text-primary">
              finly
            </span>
            <span className="text-accent">.</span>
            {" "}Portfolio intelligence.
          </span>
          <span>Real-time market dashboard</span>
        </div>
      </footer>
    </div>
  );
}
