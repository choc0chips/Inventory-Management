"use server";

import { db } from "@/lib/db";
import { checkAuth } from "@/lib/actions/auth-actions";
import { formatShortDate } from "@/lib/utils";
import type {
  DashboardExportData,
  DashboardExportFilters,
  InventoryExportRow,
  MovementExportRow,
} from "@/types/dashboard-export";

type MovementWhereClause = {
  product?: { name: { contains: string } };
  type?: string;
  date?: { gte?: Date; lte?: Date };
};

function buildMovementWhere(filters: DashboardExportFilters): MovementWhereClause {
  const whereClause: MovementWhereClause = {};

  if (filters.product) {
    whereClause.product = { name: { contains: filters.product } };
  }
  if (filters.type) {
    whereClause.type = filters.type;
  }
  if (filters.startDate || filters.endDate) {
    whereClause.date = {};
    if (filters.startDate) {
      whereClause.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.date.lte = end;
    }
  }

  return whereClause;
}

function mapInventoryRows(
  products: {
    sku: string;
    name: string;
    productType: string;
    quantity: number;
    unit: string;
    costPrice: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    category: { name: string };
    supplier: { name: string } | null;
  }[]
): InventoryExportRow[] {
  return products.map((p) => ({
    SKU: p.sku,
    "Product Name": p.name,
    Category: p.category.name,
    Supplier: p.supplier?.name ?? "",
    "Product Type": p.productType,
    Quantity: p.quantity,
    Unit: p.unit,
    "Cost Price": p.costPrice,
    "Selling Price": p.price,
    "Inventory Value": Math.round(p.price * p.quantity * 100) / 100,
    "Created Date": formatShortDate(p.createdAt),
    "Updated Date": formatShortDate(p.updatedAt),
  }));
}

function mapMovementRows(
  movements: {
    id: string;
    type: string;
    quantity: number;
    note: string | null;
    date: Date;
    product: { name: string; sku: string };
  }[]
): MovementExportRow[] {
  return movements.map((m) => ({
    "Movement ID": m.id,
    SKU: m.product.sku,
    "Product Name": m.product.name,
    "Movement Type": m.type,
    Quantity: m.quantity,
    Note: m.note ?? "",
    Date: formatShortDate(m.date),
  }));
}

export async function getDashboardExportData(
  filters: DashboardExportFilters = {}
): Promise<{ success: true; data: DashboardExportData } | { success: false; error: string }> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: "You must be logged in to export data." };
  }

  try {
    const [products, movements] = await Promise.all([
      db.product.findMany({
        where: { isArchived: false },
        orderBy: { name: "asc" },
        include: {
          category: { select: { name: true } },
          supplier: { select: { name: true } },
        },
      }),
      db.stockMovement.findMany({
        where: buildMovementWhere(filters),
        orderBy: { date: "desc" },
        include: {
          product: { select: { name: true, sku: true } },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        inventory: mapInventoryRows(products),
        movements: mapMovementRows(movements),
      },
    };
  } catch {
    return { success: false, error: "Failed to load export data." };
  }
}
