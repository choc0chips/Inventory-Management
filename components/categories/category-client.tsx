"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, FolderTree, ChevronDown, ChevronRight, Package, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/category-actions";
import { formatCurrency } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Product = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  lowStockAlert: number;
};

type CategoryWithProducts = {
  id: string;
  name: string;
  _count: { products: number };
  products: Product[];
};

export function CategoryClient({ categories }: { categories: CategoryWithProducts[] }): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithProducts | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  function toggleExpanded(categoryId: string): void {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  }

  function handleOpenCreate(): void {
    setEditingCategory(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(category: CategoryWithProducts, e: React.MouseEvent): void {
    e.stopPropagation();
    setEditingCategory(category);
    setIsFormOpen(true);
  }

  function handleClose(): void {
    setIsFormOpen(false);
    setEditingCategory(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = editingCategory
      ? await updateCategory(editingCategory.id, formData)
      : await createCategory(formData);

    if (result.success) {
      toast.success(editingCategory ? "Category updated successfully" : "Category created successfully");
      handleClose();
    } else {
      toast.error(result.error ?? "An error occurred");
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent): Promise<void> {
    e.stopPropagation();
    setIsDeleting(id);
    const result = await deleteCategory(id);
    if (result.success) {
      toast.success("Category deleted successfully");
      const newExpanded = new Set(expandedCategories);
      newExpanded.delete(id);
      setExpandedCategories(newExpanded);
    } else {
      toast.error(result.error ?? "Failed to delete category");
    }
    setIsDeleting(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 min-h-[44px] text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/80 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Main Categories Ledger Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="table-wrapper">
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow className="border-b border-border/40 bg-muted/40">
                <TableHead className="w-12 px-4 py-3.5"></TableHead>
                <TableHead className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Category details</TableHead>
                <TableHead className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Linked Products</TableHead>
                <TableHead className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground shadow-sm border border-border/50">
                        <FolderTree className="h-6 w-6" />
                      </div>
                      <h4 className="mt-4 text-sm font-bold text-foreground">No categories found</h4>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        There are no product categories registered. Add your first category to start organizing inventory.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => {
                  const isExpanded = expandedCategories.has(cat.id);
                  return (
                    <React.Fragment key={cat.id}>
                      <TableRow
                        className="cursor-pointer transition-all duration-200 hover:bg-muted/40 hover:scale-[1.001]"
                        onClick={() => toggleExpanded(cat.id)}
                      >
                        <TableCell className="px-4 py-4">
                          <div className="flex justify-center">
                            {isExpanded ? (
                              <ChevronDown className="h-4.5 w-4.5 text-indigo-500 animate-in fade-in zoom-in-75 duration-250" />
                            ) : (
                              <ChevronRight className="h-4.5 w-4.5 text-muted-foreground/60" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                              <FolderTree className="h-4 w-4 text-indigo-500" />
                            </div>
                            <span className="text-sm font-bold text-foreground">{cat.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Badge className="bg-muted text-muted-foreground border border-border/40 font-bold hover:bg-muted/80" variant="secondary">
                            {cat._count.products} products
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={(e) => handleOpenEdit(cat, e)}
                              className="rounded-lg p-1.5 text-muted-foreground/80 hover:bg-indigo-500/10 hover:text-indigo-400 border border-transparent hover:border-indigo-500/20 shadow-sm hover:shadow transition-all"
                              aria-label={`Edit ${cat.name}`}
                              title="Edit Category"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(cat.id, e)}
                              disabled={isDeleting === cat.id}
                              className="rounded-lg p-1.5 text-muted-foreground/80 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 shadow-sm hover:shadow transition-all disabled:opacity-50"
                              aria-label={`Delete ${cat.name}`}
                              title="Delete Category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={4} className="bg-muted/10 px-6 py-3 border-l-2 border-l-indigo-500/70">
                            <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-inner">
                              {cat.products.length === 0 ? (
                                <div className="px-6 py-8 text-center text-xs text-muted-foreground/80 font-semibold flex flex-col items-center gap-1.5">
                                  <Package className="h-5 w-5 text-muted-foreground/55" />
                                  No products registered in this category
                                </div>
                              ) : (
                                <Table className="w-full">
                                  <TableHeader>
                                    <TableRow className="border-b border-border/40 bg-muted/30">
                                      <TableHead className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Product Name</TableHead>
                                      <TableHead className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">SKU Code</TableHead>
                                      <TableHead className="px-5 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Stock Qty</TableHead>
                                      <TableHead className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Selling Price</TableHead>
                                      <TableHead className="px-5 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody className="divide-y divide-border/20">
                                    {cat.products.map((product) => {
                                      const isLowStock = product.quantity <= product.lowStockAlert;
                                      return (
                                        <TableRow key={product.id} className="transition-colors hover:bg-muted/10">
                                          <TableCell className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                              <Package className="h-4 w-4 text-muted-foreground/50" />
                                              <span className="text-xs font-bold text-foreground/90">{product.name}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell className="px-5 py-3">
                                            <span className="text-xs font-mono text-muted-foreground/80 font-semibold">{product.sku}</span>
                                          </TableCell>
                                          <TableCell className="px-5 py-3 text-center">
                                            <span className={`text-xs font-bold ${isLowStock ? "text-rose-600 dark:text-rose-400 animate-pulse" : "text-foreground/80"}`}>
                                              {product.quantity}
                                            </span>
                                          </TableCell>
                                          <TableCell className="px-5 py-3 text-right">
                                            <span className="text-xs text-muted-foreground font-bold">{formatCurrency(product.price)}</span>
                                          </TableCell>
                                          <TableCell className="px-5 py-3 text-center">
                                            {isLowStock ? (
                                              <Badge className="bg-rose-50 text-rose-700 border border-rose-200/50 shadow-sm shadow-rose-500/5 hover:bg-rose-100/50 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25 gap-1 text-[10px] font-bold" variant="destructive">
                                                <AlertTriangle className="h-2.5 w-2.5 text-rose-500" />
                                                Low Stock
                                              </Badge>
                                            ) : (
                                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm shadow-emerald-500/5 hover:bg-emerald-100/50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 gap-1 text-[10px] font-bold" variant="secondary">
                                                ✓ In Stock
                                              </Badge>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Categories Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              {editingCategory ? "Modify Category Details" : "Register New Category"}
            </DialogTitle>
          </DialogHeader>
          <form
            key={editingCategory?.id ?? "new"}
            onSubmit={handleSubmit}
            className="mt-4 space-y-4"
          >
            <div>
              <Label htmlFor="cat-name" className="block text-xs font-bold text-muted-foreground mb-1.5">
                Category Name
              </Label>
              <Input
                id="cat-name"
                name="name"
                type="text"
                required
                defaultValue={editingCategory?.name ?? ""}
                className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. Components, Finished Goods, Raw Materials..."
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-4 border-t border-border/40">
              <button 
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 min-h-[44px] text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/80 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {editingCategory ? "Apply Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}