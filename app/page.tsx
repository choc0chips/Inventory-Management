import React from "react";
import { db } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

type MovementWhereClause = {
  product?: { name: { contains: string } };
  type?: string;
  date?: { gte?: Date; lte?: Date };
};

type SearchParams = Promise<{
  product?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}>;

async function getDashboardData(filters: {
  product?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  supplierCount: number;
  recentMovements: {
    id: string;
    type: string;
    quantity: number;
    note: string | null;
    date: Date;
    product: { name: string; sku: string };
  }[];
  products: { id: string; name: string }[];
}> {
  const { product, type, startDate, endDate } = filters;

  const whereClause: MovementWhereClause = {};

  if (product) {
    whereClause.product = { name: { contains: product } };
  }
  if (type) {
    whereClause.type = type;
  }
  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) {
      whereClause.date.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.date.lte = end;
    }
  }

  const [totalProducts, suppliers, products, recentMovements] = await Promise.all([
    db.product.count({ where: { isArchived: false } }),
    db.supplier.count(),
    db.product.findMany({
      where: { isArchived: false },
      select: { price: true, quantity: true, lowStockAlert: true },
    }),
    db.stockMovement.findMany({
      where: whereClause,
      take: 50,
      orderBy: { date: "desc" },
      include: { product: { select: { name: true, sku: true } } },
    }),
  ]);

  const productList = await db.product.findMany({
    where: { isArchived: false },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const lowStockCount = products.filter((p) => p.quantity <= p.lowStockAlert).length;

  return {
    totalProducts,
    totalValue,
    lowStockCount,
    supplierCount: suppliers,
    recentMovements,
    products: productList,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<React.ReactElement> {
  const params = await searchParams;
  const data = await getDashboardData({
    product: params.product,
    type: params.type,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return (
    <DashboardClient
      kpiData={{
        totalProducts: data.totalProducts,
        totalValue: data.totalValue,
        lowStockCount: data.lowStockCount,
        supplierCount: data.supplierCount,
      }}
      movements={data.recentMovements}
      products={data.products}
    />
  );
}