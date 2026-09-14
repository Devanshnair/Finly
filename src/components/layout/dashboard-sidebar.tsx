"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TableProperties, X } from "lucide-react";
import { FinlyLogo } from "@/components/ui/finly-logo";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Holdings",
    href: "/dashboard/holdings",
    icon: TableProperties,
    exact: false,
  },
];

export function DashboardSidebar({
  isCollapsed,
  mobileOpen,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border bg-bg-surface transition-all duration-250 ease-in-out select-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-[60px]" : "md:w-56",
          "w-56"
        )}
      >
        <div
          className={cn(
            "h-14 border-b border-border flex items-center shrink-0 overflow-hidden",
            isCollapsed ? "md:justify-center md:px-0 px-4" : "px-5"
          )}
        >
          <div
            className={cn("transition-all duration-200", isCollapsed ? "md:hidden block" : "block")}
          >
            <FinlyLogo href="/" />
          </div>
          <div className={cn("hidden", isCollapsed ? "md:block" : "md:hidden")}>
            <FinlyLogo href="/" compact />
          </div>

          <button
            onClick={onMobileClose}
            className="ml-auto md:hidden p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-surface-2 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 relative",
                  active
                    ? "bg-bg-surface-2 text-text-primary font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-2/60",
                  isCollapsed && "md:justify-center md:px-0 md:w-10 md:mx-auto"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    active ? "text-text-primary" : "text-text-muted group-hover:text-text-primary"
                  )}
                />
                <span className={cn("truncate text-sm", isCollapsed && "md:hidden")}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
