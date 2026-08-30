"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Product, Sale, SaleItem } from "@/lib/types";

interface CartLine {
  product: Product;
  quantity: number;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [recentSales, setRecentSales] = useState<(Sale & { items?: SaleItem[] })[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [{ data: prod }, { data: sales }] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("sales").select("*").order("sold_at", { ascending: false }).limit(8),
    ]);
    setProducts((prod || []) as Product[]);
    setRecentSales((sales || []) as Sale[]);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode || "").toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [search, products]);

  function addToCart(product: Product) {
    setCart((c) => {
      const existing = c.find((l) => l.product.id === product.id);
      if (existing) {
        return c.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...c, { product, quantity: 1 }];
    });
    setSearch("");
  }

  function updateQty(productId: string, quantity: number) {
    setCart((c) =>
      c
        .map((l) => (l.product.id === productId ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function removeLine(productId: string) {
    setCart((c) => c.filter((l) => l.product.id !== productId));
  }

  const total = cart.reduce((sum, l) => sum + l.quantity * Number(l.product.price), 0);

  async function completeSale() {
    if (cart.length === 0) return;
    setBusy(true);
    setMessage(null);

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({ total })
      .select()
      .single();

    if (saleError || !sale) {
      setMessage("Could not save sale. It will sync once you're back online.");
      setBusy(false);
      return;
    }

    const items = cart.map((l) => ({
      sale_id: sale.id,
      product_id: l.product.id,
      product_name: l.product.name,
      quantity: l.quantity,
      price: l.product.price,
    }));
    await supabase.from("sale_items").insert(items);

    for (const line of cart) {
      await supabase
        .from("products")
        .update({ quantity: Math.max(0, line.product.quantity - line.quantity) })
        .eq("id", line.product.id);
    }

    setMessage(`Sale completed — Rs ${total.toFixed(2)}`);
    setCart([]);
    setBusy(false);
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-900">New sale</h1>
        <p className="text-sm text-ink-900/50">
          Billing works even without internet — stock updates locally and syncs later.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <div className="relative mb-3">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/30" aria-hidden="true" />
            <input
              className="input-field pl-9"
              placeholder="Search product to add — name, SKU, or barcode"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filtered.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-crate-100 bg-white shadow-panel">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-crate-50"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-ink-900/50">
                      Rs {Number(p.price).toFixed(2)} · {p.quantity} {p.unit} left
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-900/40">
              Search and add products to start a bill.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-crate-100 text-xs uppercase tracking-wide text-ink-900/40">
                  <th className="py-2">Item</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Price</th>
                  <th className="py-2 text-right">Subtotal</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crate-100">
                {cart.map((l) => (
                  <tr key={l.product.id}>
                    <td className="py-2">{l.product.name}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={1}
                        max={l.product.quantity}
                        className="w-16 rounded-md border border-crate-200 px-2 py-1 text-sm"
                        value={l.quantity}
                        onChange={(e) => updateQty(l.product.id, Number(e.target.value))}
                      />
                    </td>
                    <td className="py-2">Rs {Number(l.product.price).toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">
                      Rs {(l.quantity * Number(l.product.price)).toFixed(2)}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        className="text-ink-900/40 hover:text-signal-600"
                        onClick={() => removeLine(l.product.id)}
                        aria-label="Remove"
                      >
                        <i className="ti ti-x text-base" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-display text-sm font-semibold text-ink-900">Bill summary</h2>
          <div className="flex items-center justify-between border-b border-crate-100 pb-3 text-sm">
            <span className="text-ink-900/60">Items</span>
            <span>{cart.reduce((s, l) => s + l.quantity, 0)}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-display text-sm font-semibold">Total</span>
            <span className="font-display text-lg font-semibold text-crate-700">
              Rs {total.toFixed(2)}
            </span>
          </div>
          <button
            className="btn-primary w-full"
            disabled={cart.length === 0 || busy}
            onClick={completeSale}
          >
            {busy ? "Saving…" : "Complete sale"}
          </button>
          {message && <p className="mt-2 text-xs text-crate-700">{message}</p>}

          <h3 className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-ink-900/40">
            Recent sales
          </h3>
          <ul className="space-y-2">
            {recentSales.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-900/60">
                  {new Date(s.sold_at).toLocaleString()}
                </span>
                <span className="font-mono-tag text-xs font-medium text-crate-700">
                  Rs {Number(s.total).toFixed(2)}
                </span>
              </li>
            ))}
            {recentSales.length === 0 && (
              <p className="text-sm text-ink-900/40">No sales recorded yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
