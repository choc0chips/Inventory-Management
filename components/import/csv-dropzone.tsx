"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";

type CsvDropzoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
};

export function CsvDropzone({ file, onFileChange, disabled }: CsvDropzoneProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (next: File | null) => {
      if (!next) {
        onFileChange(null);
        return;
      }
      if (!next.name.toLowerCase().endsWith(".csv")) {
        return;
      }
      onFileChange(next);
    },
    [onFileChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files[0];
      if (dropped) {
        handleFile(dropped);
      }
    },
    [disabled, handleFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        "relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300",
        isDragging 
          ? "border-primary bg-primary/10 shadow-inner" 
          : file 
          ? "border-emerald-400 bg-emerald-500/10 shadow-sm"
          : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 shadow-sm text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75 duration-300">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-foreground">{file.name}</p>
          <p className="text-[10px] font-bold text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · CSV Format</p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onFileChange(null);
              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Remove File
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-600/10 border border-primary/20 shadow-sm text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Drag and drop your stock movements CSV here</p>
            <p className="text-xs text-muted-foreground font-medium">Accepts CSV spreadsheets up to 5MB in size</p>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">or</p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/95 transition-all hover:-translate-y-0.5"
          >
            Browse Local Files
          </button>
        </div>
      )}
    </div>
  );
}
