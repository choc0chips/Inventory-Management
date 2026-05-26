import React from "react";
import { db } from "@/lib/db";
import { ProductClient } from "@/components/products/product-client";

export default async function ProductsPage(): Promise<React.ReactElement> {
  const [products, categories, suppliers] = await Promise.all([
    db.product.findMany({
      where: { isArchived: false },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-indigo-700 md:text-3xl dark:text-indigo-300">Products</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-indigo-400/70">Manage your complete product catalog</p>
      </div>
      <ProductClient
        products={products}
        categories={categories}
        suppliers={suppliers}
      />
    </div>
  );
}
