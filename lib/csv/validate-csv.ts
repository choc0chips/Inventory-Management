import { CSV_IMPORT_HEADERS } from "@/lib/validators";
import type { ImportRowError } from "@/types/import";
import type { ParsedCsvRow } from "@/types/import";

export type ValidateCsvStructureResult =
  | { success: true; headers: string[] }
  | { success: false; errors: ImportRowError[] };

export function validateCsvStructure(
  rows: ParsedCsvRow[],
  headers: string[]
): ValidateCsvStructureResult {
  const errors: ImportRowError[] = [];

  if (rows.length === 0) {
    return {
      success: false,
      errors: [{ row: 0, field: "file", message: "No data rows found in CSV." }],
    };
  }

  const duplicateHeaders = headers.filter(
    (header, index) => headers.indexOf(header) !== index
  );
  if (duplicateHeaders.length > 0) {
    errors.push({
      row: 1,
      field: "headers",
      message: `Duplicate column headers: ${[...new Set(duplicateHeaders)].join(", ")}`,
    });
  }

  const expected = [...CSV_IMPORT_HEADERS];
  if (headers.length !== expected.length) {
    errors.push({
      row: 1,
      field: "headers",
      message: `Expected ${expected.length} columns but found ${headers.length}.`,
    });
  }

  for (let i = 0; i < expected.length; i++) {
    if (headers[i] !== expected[i]) {
      errors.push({
        row: 1,
        field: "headers",
        message: `Column ${i + 1} must be "${expected[i]}" but found "${headers[i] ?? "(missing)"}".`,
      });
    }
  }

  const unexpected = headers.filter((h) => !expected.includes(h as (typeof expected)[number]));
  if (unexpected.length > 0) {
    errors.push({
      row: 1,
      field: "headers",
      message: `Unexpected columns: ${unexpected.join(", ")}`,
    });
  }

  const missing = expected.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    errors.push({
      row: 1,
      field: "headers",
      message: `Missing required columns: ${missing.join(", ")}`,
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, headers };
}

export function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? "import.csv";
  return base.replace(/[^\w.\-() ]+/g, "_").slice(0, 200) || "import.csv";
}

export const MAX_CSV_FILE_BYTES = 5 * 1024 * 1024;

export function validateCsvFileMeta(file: File): ImportRowError | null {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { row: 0, field: "file", message: "Only .csv files are allowed." };
  }
  if (file.size === 0) {
    return { row: 0, field: "file", message: "The uploaded file is empty." };
  }
  if (file.size > MAX_CSV_FILE_BYTES) {
    return { row: 0, field: "file", message: "File size must not exceed 5MB." };
  }
  return null;
}
