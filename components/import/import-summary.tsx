"use client";

import React from "react";
import { CheckCircle2, XCircle, PackagePlus, Package } from "lucide-react";
import type { ImportSummary } from "@/types/import";

export function ImportSummaryCard({ summary }: { summary: ImportSummary }): React.ReactElement {
  const cards = [
    { label: "Total Rows", value: summary.totalRows, icon: Package, color: "text-foreground bg-muted" },
    { label: "Successful", value: summary.successfulRows, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
    { label: "Failed", value: summary.failedRows, icon: XCircle, color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20" },
    { label: "Products Created", value: summary.createdProducts, icon: PackagePlus, color: "text-primary dark:text-indigo-400 bg-primary/10 border border-primary/20" },
    { label: "Products Updated", value: summary.updatedProducts, icon: Package, color: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl bg-card p-4 border border-border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
