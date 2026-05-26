import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies, headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { InventoryChat } from "@/components/inventory-chat";
import { AUTH_COOKIE_NAME } from "@/lib/actions/auth-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StockWise — Inventory Management",
  description:
    "Production-ready inventory management system for tracking products, stock movements, suppliers, and analytics.",
};

async function getAlertCount(): Promise<number> {
  try {
    const { db } = await import("@/lib/db");
    return await db.product.count({
      where: { quantity: 0, isArchived: false },
    });
  } catch {
    return 0;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
  const isAuthenticated = sessionCookie?.value === "authenticated";

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const alertCount = pathname === "/auth" ? 0 : await getAlertCount();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppShell isAuthenticated={isAuthenticated} alertCount={alertCount}>
          {children}
        </AppShell>
        <InventoryChat />
      </body>
    </html>
  );
}
