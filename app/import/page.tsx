import React from "react";
import { FileUp } from "lucide-react";
import { ImportClient } from "@/components/import/import-client";

export default function ImportPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
          <FileUp className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-indigo-700 md:text-3xl dark:text-indigo-300">Import Stock Movements</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-indigo-400/70">
            Bulk import products and inventory movements from a CSV file
          </p>
        </div>
      </div>
      <ImportClient />
    </div>
  );
}
