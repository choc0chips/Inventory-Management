"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { supplierSchema } from "@/lib/validators";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createSupplier(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
  };
  const parsed = supplierSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await db.supplier.create({ data: parsed.data });
    revalidatePath("/suppliers");
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create supplier." };
  }
}

export async function updateSupplier(id: string, formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
  };
  const parsed = supplierSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await db.supplier.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/suppliers");
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update supplier." };
  }
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  try {
    await db.supplier.delete({ where: { id } });
    revalidatePath("/suppliers");
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete supplier." };
  }
}
