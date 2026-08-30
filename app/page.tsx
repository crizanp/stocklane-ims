"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? "/dashboard" : "/login");
  }, [session, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-crate-50">
      <p className="font-mono-tag text-sm text-ink-900/50">Loading…</p>
    </div>
  );
}
