"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveStatusBadgeProps {
  lastUpdated?: string;
  isFetching: boolean;
  hasStaleData?: boolean;
  onRefresh: () => void;
}

export function LiveStatusBadge({
  lastUpdated,
  isFetching,
  hasStaleData,
  onRefresh,
}: LiveStatusBadgeProps) {
  const [timeAgo, setTimeAgo] = useState("just now");

  useEffect(() => {
    if (!lastUpdated) return;

    const update = () => {
      const elapsed = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
      if (elapsed < 5) setTimeAgo("just now");
      else if (elapsed < 60) setTimeAgo(`${elapsed}s ago`);
      else setTimeAgo(`${Math.floor(elapsed / 60)}m ago`);
    };

    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-surface text-xs text-text-secondary shadow-xs">
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            hasStaleData ? "bg-text-muted" : "bg-accent animate-pulse"
          )}
        />
        <span className="font-medium text-text-primary">
          {hasStaleData ? "Stale Data" : "Live"}
        </span>
        <span className="text-text-muted">|</span>
        <span className="text-text-muted tabular-nums">Updated {timeAgo}</span>
        <span className="text-text-muted">•</span>
        <span className="text-text-muted">Polls every 15s</span>
      </div>

      <button
        onClick={onRefresh}
        disabled={isFetching}
        className="p-1.5 rounded-md border border-border bg-bg-surface hover:bg-bg-surface-2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
        title="Refresh data now"
      >
        <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin text-accent")} />
      </button>
    </div>
  );
}
