"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

export type ChatActionResult = {
  success: boolean;
  answer?: string;
  error?: string;
};

export async function askInventoryQuestion(question: string): Promise<ChatActionResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY is not configured." };
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return { success: false, error: "Please enter a question." };
    }

    const [products, recentMovements, zeroStockProducts] = await Promise.all([
      db.product.findMany({
        where: { isArchived: false },
        include: { category: true, supplier: true },
        orderBy: { name: "asc" },
      }),
      db.stockMovement.findMany({
        orderBy: { date: "desc" },
        take: 200,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      }),
      db.product.findMany({
        where: { isArchived: false, quantity: 0 },
        select: { name: true, sku: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const movementTotals = new Map<string, { name: string; sku: string; total: number }>();
    for (const movement of recentMovements) {
      const existing = movementTotals.get(movement.product.id);
      const amount = Math.abs(movement.quantity);

      if (existing) {
        existing.total += amount;
        continue;
      }

      movementTotals.set(movement.product.id, {
        name: movement.product.name,
        sku: movement.product.sku,
        total: amount,
      });
    }

    const topMovedProducts = [...movementTotals.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const systemPrompt = `
You are StockWise Assistant, an AI inventory expert. Answer questions strictly based on the live inventory data below.
If the user asks for unavailable information, clearly say that it is not available in the current snapshot.
Keep responses concise and practical for inventory decisions.

INVENTORY SNAPSHOT
Generated at: ${new Date().toISOString()}

PRODUCTS (active, not archived):
${products
  .map((product) => {
    return `- ${product.name} (SKU: ${product.sku})
  Quantity: ${product.quantity} ${product.unit}
  Price: ${product.price}
  Cost Price: ${product.costPrice}
  Category: ${product.category.name}
  Supplier: ${product.supplier?.name ?? "Unassigned"}
  Low Stock Alert Threshold: ${product.lowStockAlert}`;
  })
  .join("\n")}

TOP 10 MOST MOVED PRODUCTS (from last 200 stock movements):
${topMovedProducts.length > 0
  ? topMovedProducts
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} (SKU: ${item.sku}) — Total Moved Quantity: ${item.total}`
      )
      .join("\n")
  : "No movement data available."}

ZERO STOCK ALERTS:
${zeroStockProducts.length > 0
  ? zeroStockProducts.map((product) => `- ${product.name} (SKU: ${product.sku})`).join("\n")
  : "No products are currently out of stock."}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const response = await model.generateContent(trimmedQuestion);
    const answer = response.response.text().trim();

    if (!answer) {
      return { success: false, error: "No answer was generated." };
    }

    return { success: true, answer };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process inventory question.";
    return { success: false, error: message };
  }
}
