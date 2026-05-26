"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createMovement } from "@/lib/actions/movement-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function QuickRestockButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}): React.ReactElement {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  function handleRestock(): void {
    if (quantity < 1) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("type", "RESTOCK");
      formData.set("quantity", quantity.toString());
      formData.set("note", `Quick restock from alerts page`);

      const result = await createMovement(formData);

      if (result.success) {
        toast.success(`Restocked ${quantity} unit${quantity !== 1 ? "s" : ""} of "${productName}"`);
        setQuantity(1);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to restock");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
        disabled={isPending}
        className={cn(
          "w-16 rounded-lg border border-input bg-card px-2 py-1.5 text-xs text-center font-bold text-foreground",
          "focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />
      <button
        onClick={handleRestock}
        disabled={isPending || quantity < 1}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20",
          "bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
          "transition-all disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        Restock
      </button>
    </div>
  );
}