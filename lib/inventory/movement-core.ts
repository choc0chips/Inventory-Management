import type { MovementTypeValue } from "@/lib/validators";

export type MovementTx = {
  product: {
    findUniqueOrThrow: (args: {
      where: { id: string };
      select: { quantity: true; name: true };
    }) => Promise<{ quantity: number; name: string }>;
    update: (args: {
      where: { id: string };
      data: { quantity: number };
    }) => Promise<unknown>;
  };
  stockMovement: {
    create: (args: {
      data: {
        productId: string;
        type: string;
        quantity: number;
        note: string | null;
        date?: Date;
      };
    }) => Promise<unknown>;
  };
};

/** Maps CSV alias PURCHASE to RESTOCK for persistence (reports/dashboard compatibility). */
export function normalizeMovementType(type: string): MovementTypeValue {
  if (type === "PURCHASE") {
    return "RESTOCK";
  }
  return type as MovementTypeValue;
}

export function calculateNewQuantity(
  currentQuantity: number,
  type: MovementTypeValue,
  quantity: number
): number {
  let newQuantity = currentQuantity;
  if (type === "RESTOCK" || type === "RETURN") {
    newQuantity += quantity;
  } else if (type === "SALE" || type === "DAMAGE") {
    newQuantity -= quantity;
  } else if (type === "ADJUSTMENT") {
    newQuantity += quantity;
  }
  return newQuantity;
}

export async function applyStockMovement(
  tx: MovementTx,
  params: {
    productId: string;
    type: MovementTypeValue;
    quantity: number;
    note: string | null;
    date?: Date;
  }
): Promise<void> {
  const { productId, quantity, note, date } = params;
  const persistedType = normalizeMovementType(params.type);

  const product = await tx.product.findUniqueOrThrow({
    where: { id: productId },
    select: { quantity: true, name: true },
  });

  const newQuantity = calculateNewQuantity(product.quantity, persistedType, quantity);

  if (newQuantity < 0) {
    throw new Error(
      `Insufficient stock for "${product.name}". Current stock: ${product.quantity}, requested deduction: ${Math.abs(quantity)}.`
    );
  }

  await tx.product.update({
    where: { id: productId },
    data: { quantity: newQuantity },
  });

  await tx.stockMovement.create({
    data: {
      productId,
      type: persistedType,
      quantity: Math.abs(quantity),
      note,
      ...(date ? { date } : {}),
    },
  });
}
