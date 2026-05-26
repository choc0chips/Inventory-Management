import Papa from "papaparse";
import type { ParsedCsvRow } from "@/types/import";

export type ParseCsvResult =
  | { success: true; rows: ParsedCsvRow[]; headers: string[] }
  | { success: false; error: string };

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export function parseCsvContent(content: string): ParseCsvResult {
  const normalized = stripBom(content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim());

  if (!normalized) {
    return { success: false, error: "The uploaded file is empty." };
  }

  const result = Papa.parse<Record<string, string>>(normalized, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
    transform: (value) => (typeof value === "string" ? value.trim() : value),
  });

  if (result.errors.length > 0) {
    const first = result.errors[0];
    return {
      success: false,
      error: `CSV parse error at row ${first.row ?? "?"}: ${first.message}`,
    };
  }

  const rows = (result.data ?? []).filter((row) =>
    Object.values(row).some((cell) => String(cell ?? "").trim() !== "")
  ) as ParsedCsvRow[];

  if (rows.length === 0) {
    return { success: false, error: "The CSV file contains no data rows." };
  }

  const headers = result.meta.fields ?? Object.keys(rows[0] ?? {});

  return { success: true, rows, headers };
}
