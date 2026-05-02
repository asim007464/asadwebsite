"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { adminLogout } from "@/app/admin/actions";

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

function NavItem({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "sidebar" | "pill";
}) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  if (variant === "pill") {
    return (
      <Link
        href={href}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition",
          active
            ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
            : "border border-white/15 bg-white/10 text-white hover:bg-white/20",
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl px-3 py-2.5 text-sm font-medium transition",
        active ? "bg-white/15 text-white shadow-inner shadow-black/20" : "text-slate-400 hover:bg-white/10 hover:text-white",
      )}
    >
      {label}
    </Link>
  );
}

export function AdminChrome({ owner, shopName, children }: { owner: boolean; shopName: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-10">
        <aside className="hidden w-[15.5rem] shrink-0 lg:block">
          <div className="sticky top-[calc(var(--site-header-height)+1rem)] overflow-hidden rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/25 ring-1 ring-slate-800">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100/90">Control center</div>
              <div className="mt-2 line-clamp-2 text-base font-bold leading-snug text-white">{shopName}</div>
            </div>
            <nav className="flex flex-col gap-0.5 p-3 pb-4" aria-label="Admin navigation">
              <NavItem href="/admin" label="Dashboard" variant="sidebar" />
              <NavItem href="/admin/orders" label="Orders" variant="sidebar" />
              <NavItem href="/admin/products" label="Products" variant="sidebar" />
              <NavItem href="/admin/products/seo" label="SEO snippets" variant="sidebar" />
              <NavItem href="/admin/featured" label="Featured picks" variant="sidebar" />
              <NavItem href="/admin/home-sections" label="Homepage strips" variant="sidebar" />
              <div className="my-2 border-t border-white/10" />
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Site</p>
              <NavItem href="/admin/hero" label="Hero slides" variant="sidebar" />
              <NavItem href="/admin/reviews-banner" label="Reviews banner" variant="sidebar" />
              <NavItem href="/admin/site" label="Site & payments" variant="sidebar" />
              {owner ? (
                <>
                  <div className="my-2 border-t border-white/10" />
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Owner</p>
                  <NavItem href="/admin/team" label="Users & admins" variant="sidebar" />
                </>
              ) : null}
              <div className="my-2 border-t border-white/10" />
              <NavItem href="/" label="View storefront" variant="sidebar" />
              <form action={adminLogout} className="mt-1">
                <button
                  type="submit"
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                >
                  Log out
                </button>
              </form>
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="lg:hidden">
            <div className="sticky top-[calc(var(--site-header-height)+0.25rem)] z-40 -mx-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg shadow-slate-900/30">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300/90">Admin</div>
                  <div className="truncate text-sm font-bold text-white">{shopName}</div>
                </div>
                <form action={adminLogout}>
                  <button type="submit" className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15">
                    Log out
                  </button>
                </form>
              </div>
              <div className="border-t border-white/10 bg-slate-900/95 px-3 py-3">
                <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <NavItem href="/admin" label="Home" variant="pill" />
                  <NavItem href="/admin/orders" label="Orders" variant="pill" />
                  <NavItem href="/admin/categories" label="Categories" variant="pill" />
                  <NavItem href="/admin/products" label="Products" variant="pill" />
                  <NavItem href="/admin/featured" label="Featured" variant="pill" />
                  <NavItem href="/admin/hero" label="Hero" variant="pill" />
                  <NavItem href="/admin/site" label="Site" variant="pill" />
                  <NavItem href="/admin/home-sections" label="Strips" variant="pill" />
                  <NavItem href="/admin/products/seo" label="SEO" variant="pill" />
                  <NavItem href="/admin/reviews-banner" label="Reviews" variant="pill" />
                  {owner ? <NavItem href="/admin/team" label="Users" variant="pill" /> : null}
                  <NavItem href="/" label="Store" variant="pill" />
                </div>
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
