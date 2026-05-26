import { buildCsvContent, downloadCsv } from "@/lib/utils/csv-export";
import { CSV_IMPORT_HEADERS } from "@/lib/validators";

const SAMPLE_ROWS = [
  [
    "ELEC-SPK-001",
    "Wireless Bluetooth Speaker",
    "Electronics",
    "TechSupply Co",
    "TRADING",
    "pcs",
    "28.50",
    "49.99",
    "PURCHASE",
    "50",
    "Initial stock purchase",
    "2025-01-15",
  ],
  [
    "OFFC-PEN-002",
    "Ballpoint Pens (Box of 50)",
    "Office Supplies",
    "",
    "CONSUMABLE",
    "boxes",
    "7.80",
    "14.99",
    "SALE",
    "10",
    "Customer order",
    "2025-02-20",
  ],
  [
    "RAW-BLT-001",
    "Steel Bolts M8x50",
    "Raw Materials",
    "MetalWorks Ltd",
    "TRADING",
    "packs",
    "12.40",
    "24.99",
    "ADJUSTMENT",
    "-5",
    "Inventory count correction",
    "2025-03-01",
  ],
];

export function buildImportTemplateCsv(): string {
  const rows = SAMPLE_ROWS.map((row) => {
    const record: Record<string, string> = {};
    CSV_IMPORT_HEADERS.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
  return `\uFEFF${buildCsvContent(rows)}`;
}

export function downloadImportTemplate(): void {
  const rows = SAMPLE_ROWS.map((row) => {
    const record: Record<string, string> = {};
    CSV_IMPORT_HEADERS.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
  downloadCsv(rows, "stockwise-import-template.csv");
}
