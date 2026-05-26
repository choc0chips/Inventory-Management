"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Truck,
  BarChart3,
  FileUp,
  LogOut,
  LogIn,
  AlertTriangle,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { logoutUser } from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import { useTheme } from "./theme-provider";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle, badge: true },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/import", label: "Import", icon: FileUp },
];

function NavLink({ href, label, icon: Icon, isActive, badge, badgeCount }: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  badge?: boolean;
  badgeCount?: number;
}): React.ReactElement {
  const { close } = useSidebar();
  const showBadge = badge && badgeCount !== undefined && badgeCount > 0;
  return (
    <Link
      href={href}
      onClick={close}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5",
        isActive
          ? "bg-primary/10 text-white shadow-sm shadow-primary/5"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 overflow-hidden group-hover:scale-110 transition-transform duration-200" />
      <span>{label}</span>
      {showBadge && (
        <span className="relative ml-auto flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 py-0.5 text-[10px] font-bold text-white shadow-md shadow-rose-500/20">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative">{badgeCount > 99 ? "99+" : badgeCount}</span>
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ isAuthenticated, alertCount }: { isAuthenticated: boolean; alertCount: number }): React.ReactElement {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutUser();
        toast.success("Logged out successfully");
      } catch {
        toast.success("Logged out successfully");
      }
    });
  };

  return (
    <>
      

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-6">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">StockWise</h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Inventory</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                badge={item.badge}
                badgeCount={item.badge ? alertCount : undefined}
              />
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex flex-col justify-between border-t border-slate-700/50">
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-xs text-slate-500">
              StockWise v1.0
            </p>
            <button
              onClick={toggleTheme}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all shadow-sm hover:scale-105 md:h-8 md:w-8"
              aria-label={theme === "dark" ? "Activate Light Theme" : "Activate Dark Theme"}
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-slate-400" />
              )}
            </button>
          </div>
          <div className="px-3 pb-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                disabled={isPending}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isPending
                    ? "cursor-not-allowed text-slate-500 opacity-50"
                    : "text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>{isPending ? "Logging out..." : "Log Out"}</span>
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={close}
                className="flex w-full items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/80 hover:shadow-lg hover:shadow-primary/30"
              >
                <LogIn className="h-5 w-5 flex-shrink-0" />
                <span>Log In</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
