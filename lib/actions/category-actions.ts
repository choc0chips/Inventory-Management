"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categorySchema } from "@/lib/validators";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const raw = { name: formData.get("name") as string };
  const parsed = categorySchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await db.category.create({ data: { name: parsed.data.name } });
    revalidatePath("/categories");
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { success: false, error: "A category with this name already exists." };
  }
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult> {
  const raw = { name: formData.get("name") as string };
  const parsed = categorySchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await db.category.update({
      where: { id },
      data: { name: parsed.data.name },
    });
    revalidatePath("/categories");
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { success: false, error: "A category with this name already exists." };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await db.category.delete({ where: { id } });
    revalidatePath("/categories");
    revalidatePath("/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete category. It may have associated products." };
  }
}
