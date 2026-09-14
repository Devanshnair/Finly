"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("finly-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored === "dark" || (!stored && systemDark);

    const frameId = requestAnimationFrame(() => {
      setIsDark(dark);
      applyTheme(dark);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  function applyTheme(dark: boolean) {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  }

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem("finly-theme", next ? "dark" : "light");
  }

  // Render a placeholder during SSR / before hydration to avoid layout shift
  if (!mounted) {
    return (
      <div className={cn("h-9 w-9 rounded-xl border border-border bg-bg-surface", className)} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative h-9 w-9 overflow-hidden rounded-xl border border-border bg-bg-surface",
        "flex items-center justify-center text-text-secondary",
        "hover:bg-bg-surface-2 hover:text-text-primary",
        "transition-colors duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        className
      )}
    >
      {/* Sun — visible in light mode, rotates away in dark mode */}
      <Sun
        className={cn(
          "absolute h-[18px] w-[18px] transition-all duration-300 ease-out",
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
      />

      {/* Moon — hidden in light mode, rotates in on dark mode */}
      <Moon
        className={cn(
          "absolute h-[18px] w-[18px] transition-all duration-300 ease-out",
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        )}
      />
    </button>
  );
}
