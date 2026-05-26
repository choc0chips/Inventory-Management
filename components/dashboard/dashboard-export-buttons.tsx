"use client";

import React, { useState, useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getDashboardExportData } from "@/lib/actions/dashboard-export-actions";
import { downloadCsv } from "@/lib/utils/csv-export";
import type { DashboardExportFilters } from "@/types/dashboard-export";

type ExportKind = "inventory" | "movements" | "everything";

export function DashboardExportButtons({
  filters,
}: {
  filters: DashboardExportFilters;
}): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [activeExport, setActiveExport] = useState<ExportKind | null>(null);

  function runExport(kind: ExportKind): void {
    setActiveExport(kind);
    startTransition(async () => {
      const result = await getDashboardExportData(filters);

      if (!result.success) {
        toast.error(result.error);
        setActiveExport(null);
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 10);

      if (kind === "inventory" || kind === "everything") {
        if (result.data.inventory.length === 0) {
          toast.error("No inventory data to export.");
        } else {
          downloadCsv(result.data.inventory, `stockwise-inventory-${timestamp}`);
        }
      }

      if (kind === "movements" || kind === "everything") {
        if (result.data.movements.length === 0) {
          toast.error("No stock movements to export.");
        } else {
          downloadCsv(result.data.movements, `stockwise-movements-${timestamp}`);
        }
      }

      if (kind === "everything") {
        const invOk = result.data.inventory.length > 0;
        const movOk = result.data.movements.length > 0;
        if (invOk && movOk) {
          toast.success("Exported inventory and stock movements.");
        } else if (invOk || movOk) {
          toast.success("Partial export completed.");
        }
      } else if (kind === "inventory" && result.data.inventory.length > 0) {
        toast.success("Inventory summary exported.");
      } else if (kind === "movements" && result.data.movements.length > 0) {
        toast.success("Stock movements exported.");
      }

      setActiveExport(null);
    });
  }

  const buttonClass =
    "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-all hover:bg-muted hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm sm:px-4";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => runExport("inventory")}
        className={buttonClass}
      >
        {isPending && activeExport === "inventory" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export Inventory
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => runExport("movements")}
        className={buttonClass}
      >
        {isPending && activeExport === "movements" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export Stock Movements
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => runExport("everything")}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/80 hover:shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm sm:px-4"
      >
        {isPending && activeExport === "everything" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export Everything
      </button>
    </div>
  );
}
