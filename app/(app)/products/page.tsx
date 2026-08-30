"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Product, Category, Supplier } from "@/lib/types";

const emptyForm = {
  name: "",
  sku: "",
  barcode: "",
  category_id: "",
  supplier_id: "",
  unit: "pcs",
  price: "",
  cost: "",
  quantity: "0",
  low_stock_threshold: "5",
  expiry_date: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: prod }, { data: cats }, { data: sups }] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(name), suppliers(name)")
        .order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("suppliers").select("*").order("name"),
    ]);
    setProducts((prod || []) as Product[]);
    setCategories((cats || []) as Category[]);
    setSuppliers((sups || []) as Supplier[]);
    setLoading(false);
  }

  function generateSku() {
    const code = "SKU" + Math.floor(100000 + Math.random() * 900000);
    setForm((f) => ({ ...f, sku: code }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) return;

    const payload = {
      name: form.name,
      sku: form.sku,
      barcode: form.barcode || null,
      category_id: form.category_id || null,
      supplier_id: form.supplier_id || null,
      unit: form.unit,
      price: Number(form.price) || 0,
      cost: form.cost ? Number(form.cost) : null,
      quantity: Number(form.quantity) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 0,
      expiry_date: form.expiry_date || null,
    };

    if (editingId) {
      await supabase.from("products").update(payload).eq("id", editingId);
    } else {
      await supabase.from("products").insert(payload);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode || "",
      category_id: p.category_id || "",
      supplier_id: p.supplier_id || "",
      unit: p.unit,
      price: String(p.price),
      cost: p.cost != null ? String(p.cost) : "",
      quantity: String(p.quantity),
      low_stock_threshold: String(p.low_stock_threshold),
      expiry_date: p.expiry_date || "",
    });
    setShowForm(true);
  }

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Products</h1>
          <p className="text-sm text-ink-900/50">Add, edit, and track every item in your shop.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm((v) => !v);
            setEditingId(null);
            setForm(emptyForm);
          }}
        >
          <i className="ti ti-plus text-base" aria-hidden="true" />
          Add product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-5 grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">Product name</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Coca-Cola 500ml"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">SKU</label>
            <div className="flex gap-1.5">
              <input
                className="input-field"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Unique code"
              />
              <button type="button" className="btn-secondary px-2.5" onClick={generateSku} aria-label="Generate SKU">
                <i className="ti ti-refresh text-base" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">Barcode</label>
            <div className="flex gap-1.5">
              <input
                className="input-field"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                placeholder="Scan or type"
              />
              <span className="flex items-center rounded-lg border border-crate-200 px-2.5 text-ink-900/40">
                <i className="ti ti-barcode text-lg" aria-hidden="true" />
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">Category</label>
            <select
              className="input-field"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">Supplier / brand</label>
            <select
              className="input-field"
              value={form.supplier_id}
              onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
            >
              <option value="">None</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">Unit</label>
            <input
              className="input-field"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="pcs, kg, box…"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">Expiry date</label>
            <input
              type="date"
              className="input-field"
              value={form.expiry_date}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">Selling price</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">Cost price</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">Quantity in stock</label>
            <input
              type="number"
              className="input-field"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-900/70">Low stock alert below</label>
            <input
              type="number"
              className="input-field"
              value={form.low_stock_threshold}
              onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
            />
          </div>

          <div className="flex gap-2 md:col-span-4">
            <button type="submit" className="btn-primary">
              {editingId ? "Save changes" : "Add product"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/30" aria-hidden="true" />
            <input
              className="input-field pl-9"
              placeholder="Search by name, SKU, or barcode"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-ink-900/40">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ink-900/40">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-crate-100 text-xs uppercase tracking-wide text-ink-900/40">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">SKU</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">Stock</th>
                  <th className="py-2 pr-3">Expiry</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crate-100">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 pr-3 font-medium text-ink-900">{p.name}</td>
                    <td className="py-2.5 pr-3 font-mono-tag text-xs text-ink-900/60">{p.sku}</td>
                    <td className="py-2.5 pr-3 text-ink-900/70">{p.categories?.name || "—"}</td>
                    <td className="py-2.5 pr-3 text-ink-900/70">Rs {Number(p.price).toFixed(2)}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.quantity <= p.low_stock_threshold
                            ? "bg-signal-50 text-signal-600"
                            : "bg-crate-50 text-crate-700"
                        }`}
                      >
                        {p.quantity} {p.unit}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-ink-900/60">{p.expiry_date || "—"}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex justify-end gap-2">
                        <button
                          className="text-ink-900/50 hover:text-crate-600"
                          onClick={() => openEdit(p)}
                          aria-label="Edit"
                        >
                          <i className="ti ti-edit text-lg" aria-hidden="true" />
                        </button>
                        <button
                          className="text-ink-900/50 hover:text-signal-600"
                          onClick={() => handleDelete(p.id)}
                          aria-label="Delete"
                        >
                          <i className="ti ti-trash text-lg" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
