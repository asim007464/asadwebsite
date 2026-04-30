import Link from "next/link";
import type { ReactNode } from "react";
import { adminLogout } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { SITE_SHOP_NAME } from "@/lib/site-brand";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const ok = await isAdminAuthenticated();
  if (!ok) return children;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-10">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-[calc(var(--site-header-height)+1rem)] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin</div>
            <div className="mt-2 text-base font-semibold text-slate-900">{SITE_SHOP_NAME}</div>
            <nav className="mt-4 flex flex-col gap-1 text-sm font-semibold">
              <Link href="/admin" className="rounded-xl px-3 py-2 text-blue-800 hover:bg-blue-50">
                Dashboard
              </Link>
              <Link href="/admin/categories" className="rounded-xl px-3 py-2 text-blue-800 hover:bg-blue-50">
                Categories
              </Link>
              <Link href="/admin/featured" className="rounded-xl px-3 py-2 text-blue-800 hover:bg-blue-50">
                Featured picks
              </Link>
              <Link href="/admin/hero" className="rounded-xl px-3 py-2 text-blue-800 hover:bg-blue-50">
                Hero slides
              </Link>
              <Link href="/admin/reviews-banner" className="rounded-xl px-3 py-2 text-blue-800 hover:bg-blue-50">
                Reviews banner
              </Link>
              <Link href="/admin/site" className="rounded-xl px-3 py-2 text-blue-800 hover:bg-blue-50">
                Site & payments
              </Link>
              <Link href="/admin/home-sections" className="rounded-xl px-3 py-2 text-blue-800 hover:bg-blue-50">
                Homepage strips
              </Link>
              <Link href="/admin/products/seo" className="rounded-xl px-3 py-2 text-blue-800 hover:bg-blue-50">
                SEO snippets
              </Link>
              <Link href="/admin/orders" className="rounded-xl px-3 py-2 text-blue-800 hover:bg-blue-50">
                Orders
              </Link>
              <Link href="/" className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50">
                View storefront
              </Link>
              <form action={adminLogout} className="mt-2">
                <button type="submit" className="w-full rounded-xl px-3 py-2 text-left text-red-700 hover:bg-red-50">
                  Log out
                </button>
              </form>
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="lg:hidden">
            <div className="sticky top-[calc(var(--site-header-height)+0.25rem)] z-40 -mx-4 border-y border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">Admin</div>
                <form action={adminLogout}>
                  <button type="submit" className="text-sm font-semibold text-red-700">
                    Log out
                  </button>
                </form>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Link href="/admin" className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
                  Home
                </Link>
                <Link href="/admin/categories" className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-blue-800">
                  Categories
                </Link>
                <Link href="/admin/featured" className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-blue-800">
                  Featured
                </Link>
                <Link href="/admin/hero" className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-blue-800">
                  Hero
                </Link>
                <Link href="/admin/reviews-banner" className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-blue-800">
                  Reviews banner
                </Link>
                <Link href="/admin/site" className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-blue-800">
                  Site CMS
                </Link>
                <Link href="/admin/home-sections" className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-blue-800">
                  Strips
                </Link>
                <Link href="/admin/products/seo" className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-blue-800">
                  SEO
                </Link>
                <Link href="/admin/orders" className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-blue-800">
                  Orders
                </Link>
                <Link href="/" className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
                  Store
                </Link>
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
