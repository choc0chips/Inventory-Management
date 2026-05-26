import { csvImportRowSchema } from "@/lib/validators";
import type { ImportRowError, ValidatedImportRow } from "@/types/import";
import type { ParsedCsvRow } from "@/types/import";
import { CSV_IMPORT_HEADERS } from "@/lib/validators";

export function normalizeRowForValidation(
  row: ParsedCsvRow,
  rowNumber: number
): { data: Record<string, string | number>; rowNumber: number } {
  const data: Record<string, string> = {};
  for (const header of CSV_IMPORT_HEADERS) {
    data[header] = String(row[header] ?? "").trim();
  }
  return { data, rowNumber };
}

export function validateImportRows(
  rows: ParsedCsvRow[]
): { validated: ValidatedImportRow[]; errors: ImportRowError[] } {
  const validated: ValidatedImportRow[] = [];
  const errors: ImportRowError[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const { data } = normalizeRowForValidation(row, rowNumber);
    const parsed = csvImportRowSchema.safeParse(data);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString() ?? "row";
        errors.push({
          row: rowNumber,
          field,
          message: issue.message,
        });
      }
      return;
    }

    validated.push({
      rowNumber,
      sku: parsed.data.sku,
      productName: parsed.data.productName,
      category: parsed.data.category,
      supplier: parsed.data.supplier ?? null,
      productType: parsed.data.productType,
      unit: parsed.data.unit,
      costPrice: parsed.data.costPrice,
      price: parsed.data.price,
      movementType: parsed.data.movementType,
      quantity: parsed.data.quantity,
      note: parsed.data.note ?? null,
      date: parsed.data.date,
    });
  });

  return { validated, errors };
}
