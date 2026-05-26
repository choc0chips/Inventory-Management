"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { SidebarProvider } from "./sidebar-context";
import { MobileHeader } from "./mobile-header";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./theme-provider";

function ThemeAwareToaster(): React.ReactElement {
  const { theme } = useTheme();
  return <Toaster theme={theme as "light" | "dark" | "system"} position="top-right" richColors closeButton />;
}

export function AppShell({
  children,
  isAuthenticated,
  alertCount,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  alertCount: number;
}): React.ReactElement {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/auth";

  if (isAuthRoute) {
    return (
      <ThemeProvider>
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar isAuthenticated={isAuthenticated} alertCount={alertCount} />
          <main className="flex-1 overflow-y-auto">
            <MobileHeader alertCount={alertCount} />
            <div className="mx-auto max-w-7xl px-4 py-6 pt-20 md:px-6 md:pt-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        <ThemeAwareToaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}
