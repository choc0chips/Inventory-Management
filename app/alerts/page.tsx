import React from "react";
import { db } from "@/lib/db";
import { AlertTriangle, Package, Sparkles } from "lucide-react";
import { QuickRestockButton } from "@/components/alerts/quick-restock-button";
import { formatCurrency } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

async function getOutOfStockProducts() {
  return db.product.findMany({
    where: { quantity: 0, isArchived: false },
    include: {
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AlertsPage(): Promise<React.ReactElement> {
  const outOfStockProducts = await getOutOfStockProducts();

  return (
    <div className="space-y-6">
      {/* Alert Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/10 to-red-600/10 border border-rose-100 dark:border-rose-500/25 flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-rose-600 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-indigo-700 md:text-3xl dark:text-indigo-300">Critical Inventory Alerts</h1>
            <p className="text-xs text-muted-foreground dark:text-indigo-400/70 font-semibold">
              {outOfStockProducts.length} depleted {outOfStockProducts.length === 1 ? "item" : "items"} require immediate restocking
            </p>
          </div>
        </div>
      </div>

      {outOfStockProducts.length === 0 ? (
        <Alert className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/25 shadow-inner">
            <Package className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <AlertTitle className="text-base font-extrabold text-foreground flex items-center justify-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-emerald-500 dark:text-emerald-400" />
            All Stocked Up!
          </AlertTitle>
          <AlertDescription className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-sm mx-auto">
            No products are currently out of stock. Your supply lines and warehouse shelves are perfectly balanced!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="table-wrapper">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/40">
                  <TableHead className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Depleted Product
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    SKU Code
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Assigned Supplier
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Selling Price
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quick Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {outOfStockProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="transition-colors duration-200 hover:bg-rose-50/20 dark:hover:bg-rose-500/5"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/25">
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-rose-500 font-extrabold tracking-wider">
                            DEPLETED (0 QUANTITY)
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs font-mono font-semibold text-muted-foreground">
                      {product.sku}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs font-bold text-muted-foreground hidden md:table-cell">
                      {product.category.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs font-bold text-muted-foreground hidden md:table-cell">
                      {product.supplier?.name ?? "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm font-bold text-foreground">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <QuickRestockButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}