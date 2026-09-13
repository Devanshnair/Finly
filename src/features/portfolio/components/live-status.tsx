"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveStatusProps {
  lastUpdated?: string;
  isFetching: boolean;
  hasStaleData?: boolean;
  hasErrorData?: boolean;
  totalCount?: number;
  liveCount?: number;
  offlineCount?: number;
  onRefresh: () => void;
}

export function LiveStatus({
  lastUpdated,
  isFetching,
  hasStaleData,
  hasErrorData,
  totalCount,
  liveCount,
  offlineCount,
  onRefresh,
}: LiveStatusProps) {
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
    const id = setInterval(update, 2000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  let dotColor = "bg-accent animate-pulse";
  let statusLabel = "Live";
  let textStyle = "text-text-secondary";

  if (typeof totalCount === "number" && totalCount > 0 && typeof liveCount === "number") {
    const total = totalCount;
    const live = liveCount;
    const offline = offlineCount ?? 0;
    const livePct = live / total;

    if (offline === total) {
      // Complete systemic failure — no data at all
      statusLabel = "Feed offline";
      dotColor = "bg-negative";
      textStyle = "text-negative font-medium";
    } else if (live === total) {
      // All tickers fresh
      statusLabel = "Live";
      dotColor = "bg-accent animate-pulse";
      textStyle = "text-text-secondary";
    } else if (live === 0) {
      // No live tickers but not all offline → all stale (cached past TTL)
      statusLabel = "Stale cache";
      dotColor = "bg-amber-500";
      textStyle = "text-amber-500 font-medium";
    } else if (livePct > 0.5) {
      // Majority live — green with count for transparency
      statusLabel = `${live}/${total} live`;
      dotColor = "bg-accent animate-pulse";
      textStyle = "text-text-secondary";
    } else if (livePct < 0.2) {
      // Most are down — red warning
      statusLabel = `${live}/${total} live`;
      dotColor = "bg-negative";
      textStyle = "text-negative font-medium";
    } else {
      // 20–50% live — amber caution
      statusLabel = `${live}/${total} live`;
      dotColor = "bg-amber-500";
      textStyle = "text-amber-500 font-medium";
    }
  } else {
    if (hasErrorData) {
      statusLabel = "Feed offline";
      dotColor = "bg-negative";
      textStyle = "text-negative font-medium";
    } else if (hasStaleData) {
      statusLabel = "Stale";
      dotColor = "bg-amber-500";
      textStyle = "text-amber-500 font-medium";
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs text-text-muted">
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      <span className={cn("tabular-nums", textStyle)}>{statusLabel}</span>
      <span>·</span>
      <span className="tabular-nums">Updated {timeAgo}</span>
      <span>·</span>
      <span>Polls every 15s</span>
      <button
        onClick={onRefresh}
        disabled={isFetching}
        className="ml-1 p-0.5 rounded text-text-muted hover:text-text-primary transition-colors disabled:opacity-40 cursor-pointer"
        title="Refresh now"
      >
        <RefreshCw className={cn("w-3 h-3", isFetching && "animate-spin text-accent")} />
      </button>
    </div>
  );
}
