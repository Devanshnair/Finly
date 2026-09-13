"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center p-6">
      <div className="max-w-md w-full p-6 rounded-2xl border border-border bg-bg-surface text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-negative-bg text-negative mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-text-primary tracking-tight">
          Unable to display dashboard
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          {error.message || "An unexpected error occurred while loading your portfolio."}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-text-primary font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
