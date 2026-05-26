"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { applyStockMovement } from "@/lib/inventory/movement-core";
import { stockMovementSchema } from "@/lib/validators";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createMovement(formData: FormData): Promise<ActionResult> {
  const raw = {
    productId: formData.get("productId") as string,
    type: formData.get("type") as string,
    quantity: formData.get("quantity") as string,
    note: formData.get("note") as string,
  };

  const parsed = stockMovementSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { productId, type, quantity, note } = parsed.data;

  try {
    // Execute as atomic transaction
    await db.$transaction(async (tx) => {
      await applyStockMovement(tx, {
        productId,
        type,
        quantity,
        note: note ?? null,
      });
    });

    revalidatePath("/products");
    revalidatePath("/movements");
    revalidatePath("/");
    revalidatePath("/reports");
    revalidatePath("/alerts");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create stock movement.";
    return { success: false, error: message };
  }
}
