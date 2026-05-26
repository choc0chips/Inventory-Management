"use client";

import React from "react";
import { exportToCsv } from "@/lib/utils";
import { Download } from "lucide-react";

export function CsvExportButton({
  data,
  filename,
  label,
}: {
  data: Record<string, unknown>[];
  filename: string;
  label: string;
}): React.ReactElement {
  function handleExport(): void {
    exportToCsv(data, filename);
  }

  return (
    <button
      onClick={handleExport}
      disabled={data.length === 0}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-sm transition-all hover:bg-muted hover:border-border/80 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
