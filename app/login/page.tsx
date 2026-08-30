"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName || email,
          role: "owner",
        });
      }
    }
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-crate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-crate-600 text-white">
            <i className="ti ti-package text-xl" aria-hidden="true" />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Stocklane</h1>
          <p className="mt-1 text-sm text-ink-900/60">Offline-first inventory management</p>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex rounded-lg bg-crate-50 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-md py-1.5 font-medium transition ${
                mode === "signin" ? "bg-white shadow-panel text-ink-900" : "text-ink-900/50"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md py-1.5 font-medium transition ${
                mode === "signup" ? "bg-white shadow-panel text-ink-900" : "text-ink-900/50"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-900/70">
                  Shop owner name
                </label>
                <input
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Shrestha"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@shop.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-signal-50 px-3 py-2 text-xs text-signal-600">{error}</p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-ink-900/40">
          Works fully offline once synced. Cloud sync and web dashboard need internet.
        </p>
      </div>
    </div>
  );
}
