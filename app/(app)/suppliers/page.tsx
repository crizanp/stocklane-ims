"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Supplier, SupplierPayment } from "@/lib/types";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  const [payForm, setPayForm] = useState({ supplier_id: "", amount: "", note: "" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: sup }, { data: pay }] = await Promise.all([
      supabase.from("suppliers").select("*").order("name"),
      supabase
        .from("supplier_payments")
        .select("*, suppliers(name)")
        .order("paid_at", { ascending: false })
        .limit(15),
    ]);
    setSuppliers((sup || []) as Supplier[]);
    setPayments((pay || []) as SupplierPayment[]);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      await supabase.from("suppliers").update(form).eq("id", editingId);
    } else {
      await supabase.from("suppliers").insert(form);
    }
    setForm({ name: "", phone: "", email: "", address: "" });
    setEditingId(null);
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this supplier?")) return;
    await supabase.from("suppliers").delete().eq("id", id);
    load();
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!payForm.supplier_id || !payForm.amount) return;
    await supabase.from("supplier_payments").insert({
      supplier_id: payForm.supplier_id,
      amount: Number(payForm.amount),
      note: payForm.note || null,
    });
    setPayForm({ supplier_id: "", amount: "", note: "" });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Suppliers &amp; payments
          </h1>
          <p className="text-sm text-ink-900/50">Manage suppliers and track what you've paid them.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm((v) => !v);
            setEditingId(null);
            setForm({ name: "", phone: "", email: "", address: "" });
          }}
        >
          <i className="ti ti-plus text-base" aria-hidden="true" />
          Add supplier
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4 grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
          <input
            className="input-field"
            placeholder="Supplier name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div className="md:col-span-4">
            <button type="submit" className="btn-primary">
              {editingId ? "Save changes" : "Add supplier"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-3 font-display text-sm font-semibold text-ink-900">
            All suppliers ({suppliers.length})
          </h2>
          {loading ? (
            <p className="text-sm text-ink-900/40">Loading…</p>
          ) : suppliers.length === 0 ? (
            <p className="text-sm text-ink-900/40">No suppliers yet.</p>
          ) : (
            <ul className="divide-y divide-crate-100">
              {suppliers.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{s.name}</p>
                    <p className="text-xs text-ink-900/50">{s.phone || s.email || "No contact info"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-ink-900/50 hover:text-crate-600"
                      onClick={() => {
                        setEditingId(s.id);
                        setForm({
                          name: s.name,
                          phone: s.phone || "",
                          email: s.email || "",
                          address: s.address || "",
                        });
                        setShowForm(true);
                      }}
                      aria-label="Edit"
                    >
                      <i className="ti ti-edit text-lg" aria-hidden="true" />
                    </button>
                    <button
                      className="text-ink-900/50 hover:text-signal-600"
                      onClick={() => handleDelete(s.id)}
                      aria-label="Delete"
                    >
                      <i className="ti ti-trash text-lg" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-display text-sm font-semibold text-ink-900">Record a payment</h2>
          <form onSubmit={handlePayment} className="space-y-3">
            <select
              className="input-field"
              value={payForm.supplier_id}
              onChange={(e) => setPayForm({ ...payForm, supplier_id: e.target.value })}
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="Amount"
              value={payForm.amount}
              onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="Note (optional)"
              value={payForm.note}
              onChange={(e) => setPayForm({ ...payForm, note: e.target.value })}
            />
            <button type="submit" className="btn-primary w-full">
              Save payment
            </button>
          </form>

          <h3 className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-ink-900/40">
            Recent payments
          </h3>
          <ul className="space-y-2">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-900/70">{p.suppliers?.name}</span>
                <span className="font-mono-tag text-xs font-medium text-crate-700">
                  Rs {Number(p.amount).toFixed(2)}
                </span>
              </li>
            ))}
            {payments.length === 0 && (
              <p className="text-sm text-ink-900/40">No payments recorded yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
