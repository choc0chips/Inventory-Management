"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  Filter,
  X,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/product-actions";
import { createMovement } from "@/lib/actions/movement-actions";
import { formatCurrency } from "@/lib/utils";
import { PRODUCT_TYPES, MOVEMENT_TYPES } from "@/lib/validators";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Category = { id: string; name: string };
type Supplier = { id: string; name: string };
type ProductData = {
  id: string;
  name: string;
  sku: string;
  productType: string;
  price: number;
  costPrice: number;
  quantity: number;
  lowStockAlert: number;
  unit: string;
  categoryId: string;
  supplierId: string | null;
  category: { id: string; name: string };
  supplier: { id: string; name: string } | null;
};

const typeBadgeColors: Record<string, string> = {
  TRADING: "bg-blue-100/60 text-blue-700 border border-blue-200/50 shadow-sm shadow-blue-500/5 hover:bg-blue-100/80 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/25",
  ASSET: "bg-purple-100/60 text-purple-700 border border-purple-200/50 shadow-sm shadow-purple-500/5 hover:bg-purple-100/80 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/25",
  CONSUMABLE: "bg-amber-100/60 text-amber-700 border border-amber-200/50 shadow-sm shadow-amber-500/5 hover:bg-amber-100/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25",
};

export function ProductClient({
  products,
  categories,
  suppliers,
}: {
  products: ProductData[];
  categories: Category[];
  suppliers: Supplier[];
}): React.ReactElement {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<ProductData | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchType = !filterType || p.productType === filterType;
      const matchCategory = !filterCategory || p.categoryId === filterCategory;
      const matchSupplier = !filterSupplier || p.supplierId === filterSupplier;
      const matchStock =
        !filterStock ||
        (filterStock === "low" && p.quantity <= p.lowStockAlert) ||
        (filterStock === "ok" && p.quantity > p.lowStockAlert) ||
        (filterStock === "out" && p.quantity === 0);
      return matchSearch && matchType && matchCategory && matchSupplier && matchStock;
    });
  }, [products, search, filterType, filterCategory, filterSupplier, filterStock]);

  const hasActiveFilters = Boolean(filterType || filterCategory || filterSupplier || filterStock);

  function clearFilters(): void {
    setFilterType("");
    setFilterCategory("");
    setFilterSupplier("");
    setFilterStock("");
  }

  function handleOpenCreate(): void {
    setEditingProduct(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(product: ProductData): void {
    setEditingProduct(product);
    setIsFormOpen(true);
  }

  function handleOpenStock(product: ProductData): void {
    setStockProduct(product);
    setIsStockOpen(true);
  }

  async function handleProductSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = editingProduct
      ? await updateProduct(editingProduct.id, formData)
      : await createProduct(formData);

    if (result.success) {
      toast.success(editingProduct ? "Product updated successfully" : "Product created successfully");
      setIsFormOpen(false);
      setEditingProduct(null);
    } else {
      toast.error(result.error ?? "An error occurred");
    }
  }

  async function handleStockSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createMovement(formData);
    if (result.success) {
      toast.success("Stock adjusted successfully");
      setIsStockOpen(false);
      setStockProduct(null);
    } else {
      toast.error(result.error ?? "Failed to adjust stock");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setIsDeleting(id);
    const result = await deleteProduct(id);
    if (result.success) {
      toast.success("Product deleted successfully");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete product");
    }
    setIsDeleting(null);
  }

  return (
    <div className="space-y-6">
      {/* Search & Actions Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            type="text"
            placeholder="Search catalog by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:bg-muted hover:border-border/80 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm transition-all ${
              showFilters || hasActiveFilters
                ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 hover:bg-indigo-100/60 dark:hover:bg-indigo-500/20"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:border-border/80 hover:text-foreground"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 min-h-[44px] text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/80 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Animated Filters Drawer Panel */}
      <div 
        className={`transition-all duration-300 ease-in-out border border-border/60 rounded-2xl bg-muted/20 overflow-hidden ${
          showFilters ? "max-h-[500px] opacity-100 py-5 px-6" : "max-h-0 opacity-0 py-0 px-6 border-transparent bg-transparent"
        }`}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              Classification
            </Label>
            <Select value={filterType || "all"} onValueChange={(v) => setFilterType(v === "all" || !v ? "" : v)}>
              <SelectTrigger className="w-full bg-card border border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <SelectValue placeholder="All Classifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              Category
            </Label>
            <Select value={filterCategory || "all"} onValueChange={(v) => setFilterCategory(v === "all" || !v ? "" : v)}>
              <SelectTrigger className="w-full bg-card border border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              Supplier
            </Label>
            <Select value={filterSupplier || "all"} onValueChange={(v) => setFilterSupplier(v === "all" || !v ? "" : v)}>
              <SelectTrigger className="w-full bg-card border border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              Stock Status
            </Label>
            <Select value={filterStock || "all"} onValueChange={(v) => setFilterStock(v === "all" || !v ? "" : v)}>
              <SelectTrigger className="w-full bg-card border border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <SelectValue placeholder="All Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Status</SelectItem>
                <SelectItem value="ok">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Ledger Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="table-wrapper">
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow className="border-b border-border/40 bg-muted/40">
                <TableHead className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Product Details</TableHead>
                <TableHead className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Classification</TableHead>
                <TableHead className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground/60 hidden md:table-cell">Category</TableHead>
                <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Unit Price</TableHead>
                <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Stock Levels</TableHead>
                <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground/60 shadow-sm border border-border/50">
                        <Package className="h-6 w-6" />
                      </div>
                      <h4 className="mt-4 text-sm font-bold text-foreground/90">No products found</h4>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        We couldn&apos;t find any catalog items matching your selected criteria. Try adjusting your query or resetting filters.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 transition-all hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const isLow = p.quantity <= p.lowStockAlert;
                  const isOut = p.quantity === 0;
                  return (
                    <TableRow key={p.id} className="transition-all duration-200 hover:bg-muted/40 hover:scale-[1.001]">
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name}</p>
                          <p className="text-xs text-muted-foreground/80 font-semibold">{p.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={`${typeBadgeColors[p.productType] ?? "bg-muted text-foreground"} font-bold`} variant="secondary">
                          {p.productType}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-muted-foreground font-semibold hidden md:table-cell">{p.category.name}</TableCell>
                      <TableCell className="px-6 py-4 text-right text-sm font-bold text-foreground">{formatCurrency(p.price)}</TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-sm font-bold ${isOut ? "text-rose-600 dark:text-rose-400 animate-pulse" : isLow ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {p.quantity} {p.unit}
                          </span>
                          {isLow && !isOut && (
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200/50 shadow-sm shadow-amber-500/5 hover:bg-amber-100/50 flex gap-1 items-center font-bold dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25" variant="secondary">
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                              Low
                            </Badge>
                          )}
                          {isOut && (
                            <Badge className="bg-rose-50 text-rose-700 border border-rose-200/50 shadow-sm shadow-rose-500/5 hover:bg-rose-100/50 font-bold dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25" variant="destructive">
                              Depleted
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenStock(p)} 
                            className="rounded-lg p-1.5 text-muted-foreground/80 hover:bg-indigo-500/10 hover:text-indigo-400 border border-transparent hover:border-indigo-500/20 shadow-sm hover:shadow transition-all" 
                            aria-label="Adjust stock"
                            title="Adjust Stock"
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(p)} 
                            className="rounded-lg p-1.5 text-muted-foreground/80 hover:bg-indigo-500/10 hover:text-indigo-400 border border-transparent hover:border-indigo-500/20 shadow-sm hover:shadow transition-all" 
                            aria-label="Edit product"
                            title="Edit Product"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)} 
                            disabled={isDeleting === p.id} 
                            className="rounded-lg p-1.5 text-muted-foreground/80 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 shadow-sm hover:shadow transition-all disabled:opacity-50" 
                            aria-label="Delete product"
                            title="Archive Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Product Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditingProduct(null); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              {editingProduct ? "Modify Product catalog" : "Register New Product"}
            </DialogTitle>
          </DialogHeader>
          <form
            key={editingProduct?.id ?? "new"}
            onSubmit={handleProductSubmit}
            className="mt-4 space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="prod-name" className="block text-xs font-bold text-muted-foreground mb-1.5">Product Name</Label>
                <Input id="prod-name" name="name" type="text" required defaultValue={editingProduct?.name ?? ""} className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <Label htmlFor="prod-sku" className="block text-xs font-bold text-muted-foreground mb-1.5">SKU Code</Label>
                <Input id="prod-sku" name="sku" type="text" required defaultValue={editingProduct?.sku ?? ""} className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="prod-type" className="block text-xs font-bold text-muted-foreground mb-1.5">Asset Classification</Label>
                <select id="prod-type" name="productType" required defaultValue={editingProduct?.productType ?? ""} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="" disabled className="bg-card text-foreground">Select Classification</option>
                  {PRODUCT_TYPES.map((t) => <option key={t} value={t} className="bg-card text-foreground">{t}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="prod-unit" className="block text-xs font-bold text-muted-foreground mb-1.5">Measurement Unit</Label>
                <Input id="prod-unit" name="unit" type="text" required defaultValue={editingProduct?.unit ?? ""} placeholder="pcs, kg, units, etc." className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="prod-price" className="block text-xs font-bold text-muted-foreground mb-1.5">Selling Price ($)</Label>
                <Input id="prod-price" name="price" type="number" step="0.01" min="0" required defaultValue={editingProduct?.price ?? ""} className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <Label htmlFor="prod-cost" className="block text-xs font-bold text-muted-foreground mb-1.5">Cost Price ($)</Label>
                <Input id="prod-cost" name="costPrice" type="number" step="0.01" min="0" required defaultValue={editingProduct?.costPrice ?? ""} className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="prod-qty" className="block text-xs font-bold text-muted-foreground mb-1.5">Initial Quantity</Label>
                <Input id="prod-qty" name="quantity" type="number" min="0" required defaultValue={editingProduct?.quantity ?? 0} className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <Label htmlFor="prod-alert" className="block text-xs font-bold text-muted-foreground mb-1.5">Low Stock Alarm Threshold</Label>
                <Input id="prod-alert" name="lowStockAlert" type="number" min="0" required defaultValue={editingProduct?.lowStockAlert ?? 10} className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="prod-cat" className="block text-xs font-bold text-muted-foreground mb-1.5">Product Category</Label>
                <select id="prod-cat" name="categoryId" required defaultValue={editingProduct?.categoryId ?? ""} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="" disabled className="bg-card text-foreground">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="prod-sup" className="block text-xs font-bold text-muted-foreground mb-1.5">Supply Partner (Optional)</Label>
                <select id="prod-sup" name="supplierId" defaultValue={editingProduct?.supplierId ?? ""} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="" className="bg-card text-foreground">No Supplier Assigned</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id} className="bg-card text-foreground">{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-4 border-t border-border/40">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/80 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all">
                {editingProduct ? "Apply Changes" : "Register Product"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Stock Adjustment Modal */}
      <Dialog open={isStockOpen && !!stockProduct} onOpenChange={(open) => { if (!open) { setIsStockOpen(false); setStockProduct(null); } }}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-indigo-500" />
              Adjust Stock Levels
            </DialogTitle>
          </DialogHeader>
          {stockProduct && (
            <>
              <p className="mt-1 text-xs text-muted-foreground bg-muted border border-border/50 p-3 rounded-xl">
                Product: <span className="font-bold text-foreground/90">{stockProduct.name}</span> <br/>
                Current Quantity: <span className="font-bold text-foreground/90">{stockProduct.quantity} {stockProduct.unit}</span>
              </p>
              <form
                key={stockProduct.id}
                onSubmit={handleStockSubmit}
                className="mt-4 space-y-4"
              >
                <input type="hidden" name="productId" value={stockProduct.id} />
                <div>
                  <Label htmlFor="stock-type" className="block text-xs font-bold text-muted-foreground mb-1.5">Action Type</Label>
                  <select id="stock-type" name="type" required className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="" disabled className="bg-card text-foreground">Select Movement Type</option>
                    {MOVEMENT_TYPES.map((t) => <option key={t} value={t} className="bg-card text-foreground">{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="stock-qty" className="block text-xs font-bold text-muted-foreground mb-1.5">Quantity to Adjust</Label>
                  <Input id="stock-qty" name="quantity" type="number" min="1" required className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div>
                  <Label htmlFor="stock-note" className="block text-xs font-bold text-muted-foreground mb-1.5">Adjustment Reason / Note</Label>
                  <Textarea id="stock-note" name="note" rows={2} placeholder="Reference document, customer order, damage description..." className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="flex justify-end gap-2.5 pt-4 border-t border-border/40">
                  <button 
                    type="button"
                    onClick={() => { setIsStockOpen(false); setStockProduct(null); }}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/80 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all">
                    Record Adjustment
                  </button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
