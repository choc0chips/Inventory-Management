"use server";

import { revalidatePath } from "next/cache";
import { PrismaClientKnownRequestError } from "@/app/generated/prisma/internal/prismaNamespace";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    sku: formData.get("sku") as string,
    productType: formData.get("productType") as string,
    price: formData.get("price") as string,
    costPrice: formData.get("costPrice") as string,
    quantity: formData.get("quantity") as string,
    lowStockAlert: formData.get("lowStockAlert") as string,
    unit: formData.get("unit") as string,
    categoryId: formData.get("categoryId") as string,
    supplierId: formData.get("supplierId") as string,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await db.product.create({
      data: {
        name: parsed.data.name,
        sku: parsed.data.sku,
        productType: parsed.data.productType,
        price: parsed.data.price,
        costPrice: parsed.data.costPrice,
        quantity: parsed.data.quantity,
        lowStockAlert: parsed.data.lowStockAlert,
        unit: parsed.data.unit,
        categoryId: parsed.data.categoryId,
        supplierId: parsed.data.supplierId,
      },
    });
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Error: A product with this SKU already exists." };
      }
    }
    return { success: false, error: "Failed to create product. Please try again." };
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    sku: formData.get("sku") as string,
    productType: formData.get("productType") as string,
    price: formData.get("price") as string,
    costPrice: formData.get("costPrice") as string,
    quantity: formData.get("quantity") as string,
    lowStockAlert: formData.get("lowStockAlert") as string,
    unit: formData.get("unit") as string,
    categoryId: formData.get("categoryId") as string,
    supplierId: formData.get("supplierId") as string,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await db.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        sku: parsed.data.sku,
        productType: parsed.data.productType,
        price: parsed.data.price,
        costPrice: parsed.data.costPrice,
        quantity: parsed.data.quantity,
        lowStockAlert: parsed.data.lowStockAlert,
        unit: parsed.data.unit,
        categoryId: parsed.data.categoryId,
        supplierId: parsed.data.supplierId,
      },
    });
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Error: A product with this SKU already exists." };
      }
    }
    return { success: false, error: "Failed to update product. Please try again." };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await db.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        select: { quantity: true, name: true },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.quantity > 0) {
        await tx.stockMovement.create({
          data: {
            productId: id,
            type: "SALE",
            quantity: product.quantity,
            note: "Automated clearing of remaining inventory upon product decommissioning.",
          },
        });
      }

      await tx.product.update({
        where: { id },
        data: { quantity: 0, isArchived: true },
      });
    });

    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Error: A product with this SKU already exists." };
      }
    }
    const message = error instanceof Error ? error.message : "Failed to delete product. Please try again.";
    return { success: false, error: message };
  }
}