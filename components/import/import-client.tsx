"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Download, FileUp, Loader2, Sparkles, Info } from "lucide-react";
import { importStockMovements } from "@/lib/actions/import-actions";
import { downloadImportTemplate } from "@/lib/utils/export-import-template";
import { CSV_IMPORT_HEADERS } from "@/lib/validators";
import type { ImportStockMovementsResult } from "@/types/import";
import { CsvDropzone } from "./csv-dropzone";
import { ImportSummaryCard } from "./import-summary";
import { ImportErrorTable } from "./import-error-table";

type ImportFormValues = {
  file: FileList;
};

export function ImportClient(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportStockMovementsResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const { handleSubmit, setValue } = useForm<ImportFormValues>();

  function onSubmit(): void {
    if (!file) {
      toast.error("Please select a CSV file to import.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const importResult = await importStockMovements(formData);
      setResult(importResult);

      if (importResult.success) {
        const { summary } = importResult;
        toast.success(
          `Import complete: ${summary.successfulRows} of ${summary.totalRows} rows imported`
        );
      } else if (importResult.duplicateFile) {
        toast.error(importResult.errors[0]?.message ?? "This file was already imported.");
      } else {
        toast.error(
          importResult.errors[0]?.message ?? "Import failed. Review errors below and retry."
        );
      }
    });
  }

  function handleRetry(): void {
    setResult(null);
    setFile(null);
    setValue("file", undefined as unknown as FileList);
  }

  return (
    <div className="space-y-6">
      {/* Upload Container */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Upload Movement Ledger
            </h2>
            <p className="mt-1 text-xs text-muted-foreground font-semibold">
              Import stock transactions in bulk. Auto-creates catalog products when new SKUs are discovered.
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadImportTemplate()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-sm transition-all hover:bg-muted hover:border-border/80 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="h-3.5 w-3.5" />
            Template CSV
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <CsvDropzone
            file={file}
            disabled={isPending}
            onFileChange={(next) => {
              setFile(next);
              if (next) {
                const list = new DataTransfer();
                list.items.add(next);
                setValue("file", list.files);
              }
            }}
          />

          <button
            type="submit"
            disabled={isPending || !file}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 min-h-[44px] text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Ledger...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4" />
                Upload Movements
              </>
            )}
          </button>
        </form>
      </div>

      {/* Guide Specifications Card */}
      <div className="rounded-2xl border border-border bg-muted/20 p-5 shadow-inner">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Info className="h-4 w-4 text-indigo-500" />
          Import File Schema Specifications
        </h3>
        
        <div className="mt-3 space-y-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/60 block mb-1">
              Required headers (must follow exact order)
            </span>
            <p className="font-mono text-xs text-foreground/90 bg-muted/80 border border-border/50 p-2.5 rounded-lg overflow-x-auto">
              {CSV_IMPORT_HEADERS.join(", ")}
            </p>
          </div>
          
          <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground font-medium">
            <li>Supported movement categories: <code className="text-indigo-600 dark:text-indigo-400 font-bold">RESTOCK</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">SALE</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">DAMAGE</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">ADJUSTMENT</code>, <code className="text-indigo-600 dark:text-indigo-400 font-bold">RETURN</code>.</li>
            <li><code className="text-indigo-600 dark:text-indigo-400 font-bold">PURCHASE</code> types are automatically normalized to <code className="text-indigo-600 dark:text-indigo-400 font-bold">RESTOCK</code> on entry.</li>
            <li>Quantities must be positive integers except for <code className="text-indigo-600 dark:text-indigo-400 font-bold">ADJUSTMENT</code>, which supports signed values.</li>
            <li>File integrity check: matching SHA-256 hashes blocks importing identical files twice.</li>
          </ul>
        </div>
      </div>

      {result?.summary && <ImportSummaryCard summary={result.summary} />}

      {result && <ImportErrorTable errors={result.errors} />}

      {result && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all hover:-translate-y-0.5"
          >
            Upload Another Ledger
          </button>
        </div>
      )}
    </div>
  );
}
