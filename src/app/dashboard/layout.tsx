"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("finly_sidebar_collapsed");
      if (stored !== null) {
        const collapsed = stored === "true";
        requestAnimationFrame(() => setIsCollapsed(collapsed));
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("finly_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      <DashboardSidebar
        isCollapsed={isCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content — offset by sidebar width */}
      <div
        className={cn(
          "min-h-screen flex flex-col transition-all duration-250 ease-in-out",
          isCollapsed ? "md:pl-[60px]" : "md:pl-56"
        )}
      >
        <DashboardHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
