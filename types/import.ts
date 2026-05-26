export type ImportRowError = {
  row: number;
  field: string;
  message: string;
};

export type ImportSummary = {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  createdProducts: number;
  updatedProducts: number;
};

export type ImportStockMovementsResult =
  | {
      success: true;
      batchId: string;
      summary: ImportSummary;
      errors: ImportRowError[];
    }
  | {
      success: false;
      errors: ImportRowError[];
      summary?: ImportSummary;
      duplicateFile?: boolean;
    };

export type ParsedCsvRow = Record<string, string>;

export type ValidatedImportRow = {
  rowNumber: number;
  sku: string;
  productName: string;
  category: string;
  supplier: string | null;
  productType: "TRADING" | "ASSET" | "CONSUMABLE";
  unit: string;
  costPrice: number;
  price: number;
  movementType: "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN" | "RESTOCK";
  quantity: number;
  note: string | null;
  date: Date;
};
