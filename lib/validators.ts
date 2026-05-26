import { z } from "zod";

// ── Enums ──────────────────────────────────────────────
export const ProductType = {
  TRADING: "TRADING",
  ASSET: "ASSET",
  CONSUMABLE: "CONSUMABLE",
} as const;

export type ProductTypeValue = (typeof ProductType)[keyof typeof ProductType];

export const MovementType = {
  RESTOCK: "RESTOCK",
  SALE: "SALE",
  DAMAGE: "DAMAGE",
  ADJUSTMENT: "ADJUSTMENT",
  RETURN: "RETURN",
} as const;

export type MovementTypeValue = (typeof MovementType)[keyof typeof MovementType];

export const PRODUCT_TYPES = Object.values(ProductType);
export const MOVEMENT_TYPES = Object.values(MovementType);

// ── Category Schema ────────────────────────────────────
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be at most 50 characters"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ── Supplier Schema ────────────────────────────────────
export const supplierSchema = z.object({
  name: z
    .string()
    .min(2, "Supplier name must be at least 2 characters")
    .max(100, "Supplier name must be at most 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must be at most 20 characters"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(300, "Address must be at most 300 characters"),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

// ── Product Schema ─────────────────────────────────────
// Fix #1: supplierId uses .transform() to convert empty string → null
export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be at most 100 characters"),
  sku: z
    .string()
    .min(2, "SKU must be at least 2 characters")
    .max(50, "SKU must be at most 50 characters"),
  productType: z.enum(["TRADING", "ASSET", "CONSUMABLE"], {
    message: "Please select a product type",
  }),
  price: z.coerce
    .number()
    .positive("Price must be a positive number"),
  costPrice: z.coerce
    .number()
    .positive("Cost price must be a positive number"),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  lowStockAlert: z.coerce
    .number()
    .int("Low stock alert must be a whole number")
    .min(0, "Low stock alert cannot be negative"),
  unit: z
    .string()
    .min(1, "Unit is required")
    .max(20, "Unit must be at most 20 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  supplierId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// ── Stock Movement Schema ──────────────────────────────
export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  type: z.enum(["RESTOCK", "SALE", "DAMAGE", "ADJUSTMENT", "RETURN"], {
    message: "Please select a movement type",
  }),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than zero"),
  note: z
    .string()
    .max(500, "Note must be at most 500 characters")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
});

export type StockMovementFormValues = z.infer<typeof stockMovementSchema>;

// ── Login Schema ───────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Register Schema ────────────────────────────────────
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Username must contain only alphanumeric characters"
    ),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ── CSV Import ─────────────────────────────────────────
export const CSV_IMPORT_HEADERS = [
  "sku",
  "productName",
  "category",
  "supplier",
  "productType",
  "unit",
  "costPrice",
  "price",
  "movementType",
  "quantity",
  "note",
  "date",
] as const;

export type CsvImportHeader = (typeof CSV_IMPORT_HEADERS)[number];

export const CSV_MOVEMENT_TYPES = [
  "PURCHASE",
  "SALE",
  "ADJUSTMENT",
  "RETURN",
  "RESTOCK",
] as const;

export type CsvMovementTypeValue = (typeof CSV_MOVEMENT_TYPES)[number];

const formulaInjectionPattern = /^[=+\-@]/;

export function hasFormulaInjection(value: string): boolean {
  const trimmed = value.trim();
  return formulaInjectionPattern.test(trimmed);
}

export const csvImportRowSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .min(2, "SKU must be at least 2 characters")
      .max(50, "SKU must be at most 50 characters"),
    productName: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .max(100, "Product name must be at most 100 characters"),
    category: z
      .string()
      .trim()
      .min(2, "Category must be at least 2 characters")
      .max(50, "Category must be at most 50 characters"),
    supplier: z
      .string()
      .trim()
      .max(100, "Supplier must be at most 100 characters")
      .optional()
      .or(z.literal(""))
      .transform((val) => (val === "" ? null : val)),
    productType: z.enum(["TRADING", "ASSET", "CONSUMABLE"], {
      message: "Product type must be TRADING, ASSET, or CONSUMABLE",
    }),
    unit: z
      .string()
      .trim()
      .min(1, "Unit is required")
      .max(20, "Unit must be at most 20 characters"),
    costPrice: z.coerce.number().positive("Cost price must be a positive number"),
    price: z.coerce.number().positive("Price must be a positive number"),
    movementType: z.enum(CSV_MOVEMENT_TYPES, {
      message: "Movement type must be PURCHASE, SALE, ADJUSTMENT, RETURN, or RESTOCK",
    }),
    quantity: z.coerce.number().int("Quantity must be a whole number"),
    note: z
      .string()
      .max(500, "Note must be at most 500 characters")
      .optional()
      .or(z.literal(""))
      .transform((val) => (val === "" ? null : val)),
    date: z.coerce.date({ message: "Date must be a valid ISO or parseable date" }),
  })
  .superRefine((data, ctx) => {
    const fieldsToCheck: (keyof typeof data)[] = [
      "sku",
      "productName",
      "category",
      "unit",
      "note",
    ];
    if (data.supplier) {
      fieldsToCheck.push("supplier" as keyof typeof data);
    }
    for (const field of fieldsToCheck) {
      const value = data[field];
      if (typeof value === "string" && hasFormulaInjection(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `Value cannot start with =, +, -, or @ (formula injection prevention)`,
        });
      }
    }

    if (data.movementType === "ADJUSTMENT") {
      if (data.quantity === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quantity"],
          message: "Adjustment quantity cannot be zero",
        });
      }
    } else if (data.quantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity"],
        message: "Quantity must be a positive integer",
      });
    }
  });

export type CsvImportRowValues = z.infer<typeof csvImportRowSchema>;

