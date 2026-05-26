"use client";

import React from "react";
import type { ImportRowError } from "@/types/import";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export function ImportErrorTable({ errors }: { errors: ImportRowError[] }): React.ReactElement | null {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Validation &amp; Import Errors</h3>
        <p className="text-xs text-muted-foreground">{errors.length} issue{errors.length !== 1 ? "s" : ""} found</p>
      </div>
      <div className="table-wrapper max-h-80 overflow-y-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-border/40 bg-muted/40">
              <TableHead className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Row
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Field
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Error Message
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {errors.map((error, index) => (
              <TableRow key={`${error.row}-${error.field}-${index}`} className="hover:bg-muted/40">
                <TableCell className="px-4 py-2 text-sm text-foreground/90">{error.row || "—"}</TableCell>
                <TableCell className="px-4 py-2 text-sm font-semibold text-foreground">{error.field}</TableCell>
                <TableCell className="px-4 py-2 text-sm text-red-600 dark:text-red-400">{error.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

