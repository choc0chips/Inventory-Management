import React from "react";
import { db } from "@/lib/db";
import { SupplierClient } from "@/components/suppliers/supplier-client";

export default async function SuppliersPage(): Promise<React.ReactElement> {
  const suppliers = await db.supplier.findMany({
    include: {
      _count: { select: { products: true } },
      products: { select: { id: true, name: true, sku: true, quantity: true, price: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-indigo-700 md:text-3xl dark:text-indigo-300">Suppliers</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-indigo-400/70">Manage your supplier directory and contacts</p>
      </div>
      <SupplierClient suppliers={suppliers} />
    </div>
  );
}
