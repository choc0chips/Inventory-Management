import React from "react";
import { db } from "@/lib/db";
import { CategoryClient } from "@/components/categories/category-client";

export default async function CategoriesPage(): Promise<React.ReactElement> {
  const categories = await db.category.findMany({
    include: {
      _count: { select: { products: true } },
      products: {
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
          price: true,
          lowStockAlert: true,
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-indigo-700 md:text-3xl dark:text-indigo-300">Categories</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-indigo-400/70">Manage product classification groups</p>
      </div>
      <CategoryClient categories={categories} />
    </div>
  );
}