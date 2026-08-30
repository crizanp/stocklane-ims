"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories((data || []) as Category[]);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      await supabase.from("categories").update({ name }).eq("id", editingId);
    } else {
      await supabase.from("categories").insert({ name });
    }
    setName("");
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Categories</h1>
        <p className="text-sm text-ink-900/50">Group your products for easier browsing and reporting.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-1">
          <h2 className="mb-3 font-display text-sm font-semibold text-ink-900">
            {editingId ? "Edit category" : "Add category"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="input-field"
              placeholder="e.g. Beverages"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? "Save" : "Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-3 font-display text-sm font-semibold text-ink-900">
            All categories ({categories.length})
          </h2>
          {loading ? (
            <p className="text-sm text-ink-900/40">Loading…</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-ink-900/40">No categories yet. Add your first one.</p>
          ) : (
            <ul className="divide-y divide-crate-100">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-ink-900">{c.name}</span>
                  <div className="flex gap-2">
                    <button
                      className="text-ink-900/50 hover:text-crate-600"
                      onClick={() => {
                        setEditingId(c.id);
                        setName(c.name);
                      }}
                      aria-label="Edit"
                    >
                      <i className="ti ti-edit text-lg" aria-hidden="true" />
                    </button>
                    <button
                      className="text-ink-900/50 hover:text-signal-600"
                      onClick={() => handleDelete(c.id)}
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
      </div>
    </div>
  );
}
