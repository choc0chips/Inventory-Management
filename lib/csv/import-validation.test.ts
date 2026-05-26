import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseCsvContent } from "@/lib/csv/parse-csv";
import { validateCsvStructure, validateCsvFileMeta } from "@/lib/csv/validate-csv";
import { validateImportRows } from "@/lib/csv/normalize-row";
import { hasFormulaInjection } from "@/lib/validators";
import { CSV_IMPORT_HEADERS } from "@/lib/validators";

const VALID_HEADER = CSV_IMPORT_HEADERS.join(",");

function buildCsv(dataRows: string[]): string {
  return [VALID_HEADER, ...dataRows].join("\n");
}

describe("CSV import validation", () => {
  it("rejects missing columns", () => {
    const content = "sku,productName\nABC,Widget";
    const parsed = parseCsvContent(content);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const structure = validateCsvStructure(parsed.rows, parsed.headers);
    expect(structure.success).toBe(false);
  });

  it("rejects unexpected columns", () => {
    const headers = [...CSV_IMPORT_HEADERS, "extra"].join(",");
    const content = `${headers}\n${"x,".repeat(CSV_IMPORT_HEADERS.length)}extra`;
    const parsed = parseCsvContent(content);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const structure = validateCsvStructure(parsed.rows, parsed.headers);
    expect(structure.success).toBe(false);
  });

  it("rejects invalid movement types", () => {
    const row =
      'BAD-SKU,Bad Product,Cat,,TRADING,pcs,1,2,INVALID,5,,2025-01-01';
    const parsed = parseCsvContent(buildCsv([row]));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const { errors } = validateImportRows(parsed.rows);
    expect(errors.some((e) => e.field === "movementType")).toBe(true);
  });

  it("rejects formula injection in sku", () => {
    expect(hasFormulaInjection("=CMD()")).toBe(true);
    const row =
      '=CMD(),Injected,Cat,,TRADING,pcs,1,2,PURCHASE,1,,2025-01-01';
    const parsed = parseCsvContent(buildCsv([row]));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const { errors } = validateImportRows(parsed.rows);
    expect(errors.some((e) => e.field === "sku")).toBe(true);
  });

  it("allows negative quantity for ADJUSTMENT only", () => {
    const adjustRow =
      'ADJ-1,Adjust Prod,Cat,,TRADING,pcs,1,2,ADJUSTMENT,-3,,2025-01-01';
    const saleRow =
      'SALE-1,Sale Prod,Cat,,TRADING,pcs,1,2,SALE,-1,,2025-01-01';
    const parsed = parseCsvContent(buildCsv([adjustRow, saleRow]));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const { validated, errors } = validateImportRows(parsed.rows);
    expect(validated).toHaveLength(1);
    expect(errors.some((e) => e.field === "quantity")).toBe(true);
  });

  it("rejects invalid dates", () => {
    const row =
      'DATE-1,Date Prod,Cat,,TRADING,pcs,1,2,PURCHASE,1,,not-a-date';
    const parsed = parseCsvContent(buildCsv([row]));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const { errors } = validateImportRows(parsed.rows);
    expect(errors.some((e) => e.field === "date")).toBe(true);
  });

  it("ignores completely blank rows", () => {
    const row =
      'GOOD-1,Good,Cat,,TRADING,pcs,1,2,PURCHASE,1,,2025-01-01';
    const content = buildCsv([row, ",,,,,,,,,,,"]);
    const parsed = parseCsvContent(content);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.rows).toHaveLength(1);
  });

  it("validates non-csv file extension", () => {
    const file = new File(["a"], "data.txt", { type: "text/plain" });
    const error = validateCsvFileMeta(file);
    expect(error?.message).toContain(".csv");
  });

  it("validates sample-import-valid.csv (all rows pass)", () => {
    const content = readFileSync(
      join(process.cwd(), "sample-data", "sample-import-valid.csv"),
      "utf-8"
    );
    const parsed = parseCsvContent(content);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const structure = validateCsvStructure(parsed.rows, parsed.headers);
    expect(structure.success).toBe(true);
    const { validated, errors } = validateImportRows(parsed.rows);
    expect(errors).toHaveLength(0);
    expect(validated).toHaveLength(20);
  });

  it("rejects sample-import-invalid.csv rows", () => {
    const content = readFileSync(
      join(process.cwd(), "sample-data", "sample-import-invalid.csv"),
      "utf-8"
    );
    const parsed = parseCsvContent(content);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const structure = validateCsvStructure(parsed.rows, parsed.headers);
    expect(structure.success).toBe(true);
    const { errors } = validateImportRows(parsed.rows);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects sample-import-invalid-structure.csv (missing column)", () => {
    const content = readFileSync(
      join(process.cwd(), "sample-data", "sample-import-invalid-structure.csv"),
      "utf-8"
    );
    const parsed = parseCsvContent(content);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const structure = validateCsvStructure(parsed.rows, parsed.headers);
    expect(structure.success).toBe(false);
  });

  it("parses quoted commas", () => {
    const row =
      '"SKU-1","Product, Deluxe",Cat,,TRADING,pcs,1,2,PURCHASE,1,Note,2025-01-01';
    const parsed = parseCsvContent(buildCsv([row]));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const { validated } = validateImportRows(parsed.rows);
    expect(validated[0]?.productName).toBe("Product, Deluxe");
  });
});
