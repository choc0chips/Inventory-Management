"use client";

import React from "react";
import { CategoryDonutChart } from "./category-donut-chart";
import { MovementBarChart } from "./movement-bar-chart";
import { TrendLineChart } from "./trend-line-chart";
import { CsvExportButton } from "./csv-export-button";
import { formatCurrency } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Package, DollarSign, Percent, TrendingUp, BarChart3 } from "lucide-react";

type ValuationRow = {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  costPrice: number;
  totalValue: number;
  totalCost: number;
  profit: number;
};

type ActiveProduct = {
  name: string;
  sku: string;
  totalMovements: number;
};

type CategoryDataPoint = {
  name: string;
  value: number;
  products: { name: string }[];
};

type Props = {
  categoryData: CategoryDataPoint[];
  movementData: { month: string; RESTOCK: number; SALE: number; DAMAGE: number; ADJUSTMENT: number; RETURN: number }[];
  trendData: { month: string; value: number }[];
  valuationData: ValuationRow[];
  activeProducts: ActiveProduct[];
};

export function ReportsClient({
  categoryData,
  movementData,
  trendData,
  valuationData,
  activeProducts,
}: Props): React.ReactElement {
  const totalRetailValue = valuationData.reduce((s, r) => s + r.totalValue, 0);
  const totalCostValue = valuationData.reduce((s, r) => s + r.totalCost, 0);
  const profitMarginPercent =
    totalRetailValue > 0
      ? ((totalRetailValue - totalCostValue) / totalRetailValue) * 100
      : 0;

  return (
    <Tabs defaultValue="charts" className="space-y-6">
      {/* Premium Tabs Menu */}
      <TabsList className="bg-muted p-1 rounded-xl border border-border/50 shadow-sm flex inline-flex">
        <TabsTrigger 
          value="charts" 
          className="px-4 py-2 text-xs font-bold rounded-lg transition-all data-[state=active]:bg-card data-[state=active]:text-indigo-500 data-[state=active]:shadow-sm"
        >
          <BarChart3 className="h-3.5 w-3.5 mr-1.5 inline-block text-indigo-500" />
          Analytics Dashboard
        </TabsTrigger>
        <TabsTrigger 
          value="tables" 
          className="px-4 py-2 text-xs font-bold rounded-lg transition-all data-[state=active]:bg-card data-[state=active]:text-indigo-500 data-[state=active]:shadow-sm"
        >
          <TrendingUp className="h-3.5 w-3.5 mr-1.5 inline-block text-indigo-500" />
          Valuation Ledgers
        </TabsTrigger>
      </TabsList>

      <TabsContent value="charts" className="space-y-6 text-foreground">
        {/* Charts Panel */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-border/80">
            <h3 className="mb-4 text-base font-bold text-foreground">Products by Category</h3>
            <CategoryDonutChart data={categoryData} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-border/80">
            <h3 className="mb-4 text-base font-bold text-foreground">Movement Volume by Month</h3>
            <MovementBarChart data={movementData} />
          </div>
        </div>

        {/* Trend Chart */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-border/80">
          <h3 className="mb-4 text-base font-bold text-foreground">6-Month Stock Value Trend</h3>
          <TrendLineChart data={trendData} />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* retail card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/40 hover:shadow-indigo-500/10">
            <div className="flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Current Retail Value
                </span>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/20 text-white">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {formatCurrency(totalRetailValue)}
                </h3>
                <span className="text-[10px] text-muted-foreground font-medium">Retail Price &times; Qty</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          {/* cost card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/40 hover:shadow-emerald-500/10">
            <div className="flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Inventory Cost Basis
                </span>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 text-white">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {formatCurrency(totalCostValue)}
                </h3>
                <span className="text-[10px] text-muted-foreground font-medium">Cost Price &times; Qty</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          {/* profit card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-amber-500/40 hover:shadow-amber-500/10">
            <div className="flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Gross Profit Margin
                </span>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 text-white">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {profitMarginPercent.toFixed(1)}%
                </h3>
                <span className="text-[10px] text-muted-foreground font-medium">(Retail - Cost) / Retail</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="tables" className="space-y-6 text-foreground">
        {/* Inventory Valuation Ledger */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between bg-muted/10">
            <div>
              <h3 className="text-lg font-bold text-foreground">Inventory Valuation</h3>
              <p className="text-xs text-muted-foreground">Complete monetary breakdown by catalog product</p>
            </div>
            <CsvExportButton
              data={valuationData.map((r) => ({
                Name: r.name,
                SKU: r.sku,
                Category: r.category,
                Quantity: r.quantity,
                "Sell Price": r.price,
                "Cost Price": r.costPrice,
                "Total Value": r.totalValue,
                "Total Cost": r.totalCost,
                Profit: r.profit,
              }))}
              filename="inventory-valuation"
              label="Export Valuation CSV"
            />
          </div>
          <div className="table-wrapper">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="border-b border-border/40 bg-muted/40">
                  <TableHead className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Product Details</TableHead>
                  <TableHead className="hidden px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60 sm:table-cell">Category</TableHead>
                  <TableHead className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">In Stock Qty</TableHead>
                  <TableHead className="hidden px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60 md:table-cell">Retail Unit Price</TableHead>
                  <TableHead className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Cumulative Value</TableHead>
                  <TableHead className="hidden px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60 lg:table-cell">Profit Potential</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {valuationData.map((row) => (
                  <TableRow key={row.sku} className="transition-all duration-200 hover:bg-muted/40 hover:scale-[1.001]">
                    <TableCell className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground">{row.name}</p>
                      <p className="text-xs text-muted-foreground/80 font-semibold">{row.sku}</p>
                    </TableCell>
                    <TableCell className="hidden px-6 py-4 text-xs font-bold text-muted-foreground/95 sm:table-cell">{row.category}</TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm font-bold text-foreground/85">{row.quantity}</TableCell>
                    <TableCell className="hidden px-6 py-4 text-right text-xs font-semibold text-muted-foreground/80 md:table-cell">{formatCurrency(row.price)}</TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm font-bold text-foreground">{formatCurrency(row.totalValue)}</TableCell>
                    <TableCell className="hidden px-6 py-4 text-right text-xs font-extrabold text-emerald-600 dark:text-emerald-400 lg:table-cell">{formatCurrency(row.profit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Most Active Products */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between bg-muted/10">
            <div>
              <h3 className="text-lg font-bold text-foreground">Most Active Products</h3>
              <p className="text-xs text-muted-foreground">Products with the highest movement frequency</p>
            </div>
            <CsvExportButton
              data={activeProducts.map((r) => ({
                Name: r.name,
                SKU: r.sku,
                "Total Movements": r.totalMovements,
              }))}
              filename="active-products"
              label="Export Active CSV"
            />
          </div>
          <div className="table-wrapper">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="border-b border-border/40 bg-muted/40">
                  <TableHead className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60 w-24">Rank</TableHead>
                  <TableHead className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Product</TableHead>
                  <TableHead className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Total Movements</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {activeProducts.map((row, idx) => (
                  <TableRow key={row.sku} className="transition-all duration-200 hover:bg-muted/40 hover:scale-[1.001]">
                    <TableCell className="px-6 py-4">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm border border-border/20 ${
                          idx === 0
                            ? "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20"
                            : idx === 1
                            ? "bg-slate-100 text-slate-700 border-slate-200/50 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20"
                            : idx === 2
                            ? "bg-orange-50/70 text-orange-700 border-orange-200/40 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20"
                            : "bg-muted text-muted-foreground border-border/10"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground">{row.name}</p>
                      <p className="text-xs text-muted-foreground/80 font-semibold">{row.sku}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm font-bold text-foreground">{row.totalMovements} entries</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}