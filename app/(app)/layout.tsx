"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
  { href: "/products", label: "Products", icon: "ti-box" },
  { href: "/categories", label: "Categories", icon: "ti-tags" },
  { href: "/suppliers", label: "Suppliers & payments", icon: "ti-truck" },
  { href: "/sales", label: "Sales", icon: "ti-receipt" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  useEffect(() => setNavOpen(false), [pathname]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-crate-50">
        <p className="font-mono-tag text-sm text-ink-900/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crate-50 lg:flex">
      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-crate-100 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crate-600 text-white">
            <i className="ti ti-package text-base" aria-hidden="true" />
          </div>
          <span className="font-display text-sm font-semibold">Stocklane</span>
        </div>
        <button
          onClick={() => setNavOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="rounded-md p-2 text-ink-900/70 hover:bg-crate-50"
        >
          <i className={`ti ${navOpen ? "ti-x" : "ti-menu-2"} text-xl`} aria-hidden="true" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          navOpen ? "block" : "hidden"
        } border-b border-crate-100 bg-white lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:border-b-0 lg:border-r`}
      >
        <div className="hidden items-center gap-2 border-b border-crate-100 px-5 py-5 lg:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-crate-600 text-white">
            <i className="ti ti-package text-lg" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-tight">Stocklane</p>
            <p className="text-[11px] text-ink-900/50">Offline-first IMS</p>
          </div>
        </div>

        <nav className="space-y-1 p-3">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-crate-600 text-white"
                    : "text-ink-900/70 hover:bg-crate-50 hover:text-ink-900"
                }`}
              >
                <i className={`ti ${item.icon} text-lg`} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-crate-100 p-3">
          <div className="mb-2 flex items-center gap-2 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-crate-100 text-xs font-semibold text-crate-700">
              {(profile?.full_name || session.user.email || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-ink-900">
                {profile?.full_name || session.user.email}
              </p>
              <p className="text-[11px] capitalize text-ink-900/50">{profile?.role || "staff"}</p>
            </div>
          </div>
          <button onClick={signOut} className="btn-secondary w-full">
            <i className="ti ti-logout text-base" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
