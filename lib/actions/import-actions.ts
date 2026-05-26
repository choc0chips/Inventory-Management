"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseCsvContent } from "@/lib/csv/parse-csv";
import { validateCsvStructure, sanitizeFileName, validateCsvFileMeta } from "@/lib/csv/validate-csv";
import { validateImportRows } from "@/lib/csv/normalize-row";
import { applyStockMovement, normalizeMovementType } from "@/lib/inventory/movement-core";
import { checkAuth } from "@/lib/actions/auth-actions";
import type { ImportRowError, ImportStockMovementsResult } from "@/types/import";
import type { ValidatedImportRow } from "@/types/import";
import type { MovementTypeValue } from "@/lib/validators";

const IMPORT_PLACEHOLDER_EMAIL_DOMAIN = "import.stockwise.local";
const IMPORT_PLACEHOLDER_PHONE = "0000000";
const IMPORT_PLACEHOLDER_ADDRESS = "Imported via CSV — update supplier details in Suppliers.";

function revalidateAfterImport(): void {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/reports");
  revalidatePath("/alerts");
  revalidatePath("/categories");
  revalidatePath("/suppliers");
  revalidatePath("/import");
}

async function resolveCategoryId(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  categoryName: string,
  categoryMap: Map<string, string>
): Promise<string> {
  const key = categoryName.toLowerCase();
  const existing = categoryMap.get(key);
  if (existing) {
    return existing;
  }
  const created = await tx.category.create({
    data: { name: categoryName },
  });
  categoryMap.set(key, created.id);
  return created.id;
}

async function resolveSupplierId(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  supplierName: string | null,
  supplierMap: Map<string, string>
): Promise<string | null> {
  if (!supplierName) {
    return null;
  }
  const key = supplierName.toLowerCase();
  const existing = supplierMap.get(key);
  if (existing) {
    return existing;
  }
  const slug = supplierName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 30);
  const created = await tx.supplier.create({
    data: {
      name: supplierName,
      email: `import+${slug}@${IMPORT_PLACEHOLDER_EMAIL_DOMAIN}`,
      phone: IMPORT_PLACEHOLDER_PHONE,
      address: IMPORT_PLACEHOLDER_ADDRESS,
    },
  });
  supplierMap.set(key, created.id);
  return created.id;
}

async function processImportRow(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  row: ValidatedImportRow,
  productBySku: Map<
    string,
    {
      id: string;
      isArchived: boolean;
      categoryId: string;
      supplierId: string | null;
      name: string;
    }
  >,
  categoryMap: Map<string, string>,
  supplierMap: Map<string, string>
): Promise<"created" | "updated"> {
  const skuKey = row.sku.toLowerCase();
  let product = productBySku.get(skuKey);
  let action: "created" | "updated" = "updated";

  const categoryId = await resolveCategoryId(tx, row.category, categoryMap);
  const supplierId = await resolveSupplierId(tx, row.supplier, supplierMap);

  if (!product) {
    const created = await tx.product.create({
      data: {
        name: row.productName,
        sku: row.sku,
        productType: row.productType,
        price: row.price,
        costPrice: row.costPrice,
        quantity: 0,
        unit: row.unit,
        categoryId,
        supplierId,
      },
    });
    product = {
      id: created.id,
      isArchived: false,
      categoryId,
      supplierId,
      name: row.productName,
    };
    productBySku.set(skuKey, product);
    action = "created";
  } else {
    if (product.isArchived) {
      throw new Error(
        `SKU "${row.sku}" belongs to an archived product. Restore or remove it before importing.`
      );
    }

    if (!product.supplierId && supplierId) {
      await tx.product.update({
        where: { id: product.id },
        data: { supplierId },
      });
      product = { ...product, supplierId };
      productBySku.set(skuKey, product);
    }
  }

  const movementType = normalizeMovementType(row.movementType) as MovementTypeValue;
  const movementQuantity =
    row.movementType === "ADJUSTMENT" ? row.quantity : Math.abs(row.quantity);

  await applyStockMovement(tx, {
    productId: product.id,
    type: movementType,
    quantity: movementQuantity,
    note: row.note,
    date: row.date,
  });

  return action;
}

export async function importStockMovements(formData: FormData): Promise<ImportStockMovementsResult> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return {
      success: false,
      errors: [{ row: 0, field: "auth", message: "You must be logged in to import stock movements." }],
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return {
      success: false,
      errors: [{ row: 0, field: "file", message: "No CSV file was uploaded." }],
    };
  }

  const fileMetaError = validateCsvFileMeta(file);
  if (fileMetaError) {
    return { success: false, errors: [fileMetaError] };
  }

  const safeFileName = sanitizeFileName(file.name);
  const content = await file.text();
  const checksum = createHash("sha256").update(content).digest("hex");

  const existingBatch = await db.importBatch.findUnique({
    where: { checksum },
  });
  if (existingBatch) {
    return {
      success: false,
      duplicateFile: true,
      errors: [
        {
          row: 0,
          field: "file",
          message: `This file was already imported on ${existingBatch.createdAt.toISOString()} as "${existingBatch.fileName}".`,
        },
      ],
    };
  }

  const parsed = parseCsvContent(content);
  if (!parsed.success) {
    return {
      success: false,
      errors: [{ row: 0, field: "file", message: parsed.error }],
    };
  }

  const structure = validateCsvStructure(parsed.rows, parsed.headers);
  if (!structure.success) {
    return { success: false, errors: structure.errors };
  }

  const { validated, errors: validationErrors } = validateImportRows(parsed.rows);

  const skuNameConflicts = new Map<string, string>();
  for (const row of validated) {
    const key = row.sku.toLowerCase();
    const prior = skuNameConflicts.get(key);
    if (prior && prior !== row.productName) {
      validationErrors.push({
        row: row.rowNumber,
        field: "productName",
        message: `SKU "${row.sku}" has conflicting product names in this file.`,
      });
    } else {
      skuNameConflicts.set(key, row.productName);
    }
  }

  const invalidRows = new Set(validationErrors.map((e) => e.row));
  const rowsToProcess = validated.filter((row) => !invalidRows.has(row.rowNumber));

  if (rowsToProcess.length === 0) {
    return { success: false, errors: validationErrors };
  }

  const uniqueSkus = [...new Set(rowsToProcess.map((r) => r.sku))];

  const [existingProducts, allCategories, allSuppliers] = await Promise.all([
    db.product.findMany({
      where: { sku: { in: uniqueSkus } },
      select: {
        id: true,
        sku: true,
        name: true,
        isArchived: true,
        categoryId: true,
        supplierId: true,
      },
    }),
    db.category.findMany({ select: { id: true, name: true } }),
    db.supplier.findMany({ select: { id: true, name: true } }),
  ]);

  const productBySku = new Map(
    existingProducts.map((p) => [
      p.sku.toLowerCase(),
      {
        id: p.id,
        isArchived: p.isArchived,
        categoryId: p.categoryId,
        supplierId: p.supplierId,
        name: p.name,
      },
    ])
  );

  const categoryMap = new Map(allCategories.map((c) => [c.name.toLowerCase(), c.id]));
  const supplierMap = new Map(allSuppliers.map((s) => [s.name.toLowerCase(), s.id]));

  let createdProducts = 0;
  let updatedProducts = 0;
  let successfulRows = 0;
  const processingErrors: ImportRowError[] = [...validationErrors];

  const batch = await db.importBatch.create({
    data: {
      fileName: safeFileName,
      checksum,
      importedBy: "authenticated",
      rowCount: parsed.rows.length,
    },
  });

  for (const row of rowsToProcess) {
    try {
      const action = await db.$transaction(async (tx) =>
        processImportRow(tx, row, productBySku, categoryMap, supplierMap)
      );

      if (action === "created") {
        createdProducts += 1;
      } else {
        updatedProducts += 1;
      }
      successfulRows += 1;

      await db.importLog.create({
        data: {
          batchId: batch.id,
          rowNumber: row.rowNumber,
          sku: row.sku,
          action: action === "created" ? "PRODUCT_CREATED" : "MOVEMENT_APPLIED",
          status: "SUCCESS",
          message: `${row.movementType} × ${row.quantity}`,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to process import row.";
      processingErrors.push({
        row: row.rowNumber,
        field: "processing",
        message,
      });

      await db.importLog.create({
        data: {
          batchId: batch.id,
          rowNumber: row.rowNumber,
          sku: row.sku,
          action: "IMPORT_FAILED",
          status: "FAILED",
          message,
        },
      });
    }
  }

  if (successfulRows > 0) {
    revalidateAfterImport();
  }

  const summary = {
    totalRows: parsed.rows.length,
    successfulRows,
    failedRows: parsed.rows.length - successfulRows,
    createdProducts,
    updatedProducts,
  };

  if (successfulRows === 0) {
    return {
      success: false,
      errors: processingErrors,
      summary,
    };
  }

  return {
    success: true,
    batchId: batch.id,
    summary,
    errors: processingErrors,
  };
}

export async function getImportTemplateContent(): Promise<string> {
  const { buildImportTemplateCsv } = await import("@/lib/utils/export-import-template");
  return buildImportTemplateCsv();
}
