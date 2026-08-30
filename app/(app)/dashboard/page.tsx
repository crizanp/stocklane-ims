"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

interface Stats {
  productCount: number;
  lowStock: Product[];
  expiring: Product[];
  todaySales: number;
  todaySalesCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: products } = await supabase.from("products").select("*");
    const all = (products || []) as Product[];

    const lowStock = all.filter((p) => p.quantity <= p.low_stock_threshold);

    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    const expiring = all.filter(
      (p) => p.expiry_date && new Date(p.expiry_date) <= threeMonths
    );

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data: sales } = await supabase
      .from("sales")
      .select("total")
      .gte("sold_at", startOfDay.toISOString());

    const todaySales = (sales || []).reduce((sum, s) => sum + Number(s.total), 0);

    setStats({
      productCount: all.length,
      lowStock,
      expiring,
      todaySales,
      todaySalesCount: sales?.length || 0,
    });
    setLoading(false);
  }

  if (loading || !stats) {
    return <p className="font-mono-tag text-sm text-ink-900/50">Loading dashboard…</p>;
  }

  const cards = [
    { label: "Total products", value: stats.productCount, icon: "ti-box", color: "crate" },
    { label: "Low stock alerts", value: stats.lowStock.length, icon: "ti-alert-triangle", color: "signal" },
    { label: "Expiring soon", value: stats.expiring.length, icon: "ti-calendar-exclamation", color: "rust" },
    { label: "Today's sales", value: `Rs ${stats.todaySales.toFixed(2)}`, icon: "ti-receipt-2", color: "crate" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-900/50">
          Live view of your shop. Works offline — this dashboard reflects synced data.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div
              className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
                c.color === "signal" ? "bg-signal-50 text-signal-600" : c.color === "rust" ? "bg-rust-50 text-rust-600" : "bg-crate-50 text-crate-600"
              }`}
            >
              <i className={`ti ${c.icon} text-lg`} aria-hidden="true" />
            </div>
            <p className="font-display text-xl font-semibold text-ink-900">{c.value}</p>
            <p className="text-xs text-ink-900/50">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-ink-900">
            <i className="ti ti-alert-triangle text-signal-600" aria-hidden="true" />
            Low stock
          </h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-ink-900/40">Nothing low on stock right now.</p>
          ) : (
            <ul className="divide-y divide-crate-100">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-ink-900">{p.name}</span>
                  <span className="rounded-full bg-signal-50 px-2 py-0.5 text-xs font-medium text-signal-600">
                    {p.quantity} {p.unit} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-ink-900">
            <i className="ti ti-calendar-exclamation text-rust-600" aria-hidden="true" />
            Expiring within 3 months
          </h2>
          {stats.expiring.length === 0 ? (
            <p className="text-sm text-ink-900/40">No products expiring soon.</p>
          ) : (
            <ul className="divide-y divide-crate-100">
              {stats.expiring.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-ink-900">{p.name}</span>
                  <span className="rounded-full bg-rust-50 px-2 py-0.5 text-xs font-medium text-rust-600">
                    {p.expiry_date}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
