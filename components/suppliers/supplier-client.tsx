"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, Truck, Mail, Phone, MapPin, ChevronDown, ChevronUp, Package, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createSupplier, updateSupplier, deleteSupplier } from "@/lib/actions/supplier-actions";
import { formatCurrency } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SupplierProduct = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
};

type SupplierWithData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  _count: { products: number };
  products: SupplierProduct[];
};

export function SupplierClient({ suppliers }: { suppliers: SupplierWithData[] }): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierWithData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  function handleOpenCreate(): void {
    setEditingSupplier(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(supplier: SupplierWithData): void {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  }

  function handleClose(): void {
    setIsFormOpen(false);
    setEditingSupplier(null);
  }

  function toggleExpand(id: string): void {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = editingSupplier
      ? await updateSupplier(editingSupplier.id, formData)
      : await createSupplier(formData);

    if (result.success) {
      toast.success(editingSupplier ? "Supplier updated successfully" : "Supplier registered successfully");
      handleClose();
    } else {
      toast.error(result.error ?? "An error occurred");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setIsDeleting(id);
    const result = await deleteSupplier(id);
    if (result.success) {
      toast.success("Supplier deleted successfully");
    } else {
      toast.error(result.error ?? "Failed to delete supplier");
    }
    setIsDeleting(null);
  }

  return (
    <div className="space-y-6">
      {/* Top action */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 min-h-[44px] text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/80 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      {/* Suppliers list */}
      <div className="space-y-4">
        {suppliers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground/60 shadow-sm border border-border/50">
              <Truck className="h-6 w-6" />
            </div>
            <h4 className="mt-4 text-sm font-bold text-foreground/90">No suppliers registered</h4>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Your logistic pipeline has no partners registered. Register your first supply partner to link products.
            </p>
          </div>
        ) : (
          suppliers.map((sup) => (
            <div
              key={sup.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/80"
            >
              <div className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20 flex-shrink-0">
                      <Truck className="h-5 w-5 text-violet-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-foreground leading-tight">{sup.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-medium">
                        <span className="inline-flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground/60" /> {sup.email}
                        </span>
                        <span className="inline-flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground/60" /> {sup.phone}
                        </span>
                        <span className="inline-flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" /> {sup.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <Badge className="bg-violet-50 text-violet-700 border border-violet-100 shadow-sm shadow-violet-500/5 hover:bg-violet-100/50 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/25 font-bold" variant="secondary">
                      {sup._count.products} linked {sup._count.products === 1 ? "product" : "products"}
                    </Badge>
                    <button
                      onClick={() => toggleExpand(sup.id)}
                      className="rounded-lg p-1.5 text-muted-foreground/80 hover:bg-muted hover:text-foreground border border-transparent hover:border-border transition-all shadow-sm hover:shadow"
                      aria-label="Toggle products"
                      title="Expand Products"
                    >
                      {expandedId === sup.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(sup)}
                      className="rounded-lg p-1.5 text-muted-foreground/80 hover:bg-indigo-500/10 hover:text-indigo-400 border border-transparent hover:border-indigo-500/20 transition-all shadow-sm hover:shadow"
                      aria-label={`Edit ${sup.name}`}
                      title="Edit Supplier"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sup.id)}
                      disabled={isDeleting === sup.id}
                      className="rounded-lg p-1.5 text-muted-foreground/80 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all shadow-sm hover:shadow disabled:opacity-50"
                      aria-label={`Delete ${sup.name}`}
                      title="Delete Supplier"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded associated products list */}
              {expandedId === sup.id && sup.products.length > 0 && (
                <div className="border-t border-border/40 bg-muted/10 p-5 border-l-2 border-l-violet-500/70">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                    <Package className="h-3.5 w-3.5" /> Linked Supply Catalog
                  </h4>
                  <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-inner">
                    <div className="table-wrapper">
                      <Table className="w-full text-sm">
                        <TableHeader>
                          <TableRow className="border-b border-border/40 bg-muted/30">
                            <TableHead className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Product Name</TableHead>
                            <TableHead className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">SKU Code</TableHead>
                            <TableHead className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Stock Qty</TableHead>
                            <TableHead className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-border/20">
                          {sup.products.map((prod) => (
                            <TableRow key={prod.id} className="transition-colors hover:bg-muted/10">
                              <TableCell className="px-5 py-3 font-bold text-foreground/90">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground/50" />
                                  <span>{prod.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-5 py-3 font-mono text-muted-foreground/80 font-semibold">{prod.sku}</TableCell>
                              <TableCell className="px-5 py-3 text-right font-bold text-foreground/80">{prod.quantity}</TableCell>
                              <TableCell className="px-5 py-3 text-right font-bold text-foreground/80">{formatCurrency(prod.price)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
              {expandedId === sup.id && sup.products.length === 0 && (
                <div className="border-t border-border/40 bg-muted/20 p-8 text-center text-xs text-muted-foreground font-semibold flex flex-col items-center gap-1.5 border-l-2 border-l-violet-500/70">
                  <Package className="h-5 w-5 text-muted-foreground/50" />
                  No products linked to this supply partner.
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Supplier Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="sm:max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              {editingSupplier ? "Modify Supply Partner" : "Register New Supply Partner"}
            </DialogTitle>
          </DialogHeader>
          <form
            key={editingSupplier?.id ?? "new"}
            onSubmit={handleSubmit}
            className="mt-4 space-y-4"
          >
            <div>
              <Label htmlFor="sup-name" className="block text-xs font-bold text-muted-foreground mb-1.5">Supplier / Company Name</Label>
              <Input id="sup-name" name="name" type="text" required defaultValue={editingSupplier?.name ?? ""}
                className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. Acme Corp, Global Tech..." />
            </div>
            <div>
              <Label htmlFor="sup-email" className="block text-xs font-bold text-muted-foreground mb-1.5">Business Email Address</Label>
              <Input id="sup-email" name="email" type="email" required defaultValue={editingSupplier?.email ?? ""}
                className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. contact@acme.com" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sup-phone" className="block text-xs font-bold text-muted-foreground mb-1.5">Phone Number</Label>
                <Input id="sup-phone" name="phone" type="tel" required defaultValue={editingSupplier?.phone ?? ""}
                  className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="+1 (555) 019-2834" />
              </div>
              <div>
                <Label htmlFor="sup-address" className="block text-xs font-bold text-muted-foreground mb-1.5">Physical / HQ Address</Label>
                <Input id="sup-address" name="address" type="text" required defaultValue={editingSupplier?.address ?? ""}
                  className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="123 Logistics Way, Suite A" />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-4 border-t border-border/40">
              <button 
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button type="submit"
                className="rounded-lg bg-primary px-4 py-2 min-h-[44px] text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/80 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all">
                {editingSupplier ? "Apply Changes" : "Register Partner"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
