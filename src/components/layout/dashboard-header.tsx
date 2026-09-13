"use client";

import { PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface DashboardHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onMobileMenuOpen: () => void;
}

export function DashboardHeader({
  isCollapsed,
  onToggleCollapse,
  onMobileMenuOpen,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-bg-surface/90 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Top left: Collapse button (desktop) & Menu button (mobile) */}
      <div className="flex items-center gap-2">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-surface-2 transition-colors cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar collapse/expand toggle at top left of top nav */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface-2 transition-colors cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Top right: Theme toggle */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
