"use client";

import React from "react";
import { Menu, Sun, Moon } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { useTheme } from "./theme-provider";

export function MobileHeader({ alertCount }: { alertCount: number }): React.ReactElement {
  const { toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 w-full items-center justify-between gap-4 border-b border-border/50 bg-background/85 px-4 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground transition-colors hover:bg-muted/80"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 flex-shrink-0" />
          {alertCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
          )}
        </button>
        <span className="overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xl font-bold text-white">
          StockWise
        </span>
      </div>

      <button
        onClick={toggleTheme}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-foreground transition-colors hover:bg-muted/80 shadow-sm"
        aria-label={theme === "dark" ? "Activate Light Theme" : "Activate Dark Theme"}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-amber-500" />
        ) : (
          <Moon className="h-5 w-5 text-slate-500" />
        )}
      </button>
    </header>
  );
}