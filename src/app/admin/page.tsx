import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: categories }, { data: products }, { data: pendingOrders }, heroSlidesRes] = await Promise.all([
    supabase.from("categories").select("id"),
    supabase.from("products").select("id,is_featured"),
    supabase.from("orders").select("id").eq("status", "pending"),
    supabase.from("hero_slides").select("id"),
  ]);

  const heroSlidesCount = heroSlidesRes.error ? 0 : (heroSlidesRes.data?.length ?? 0);
  const featuredCount = products?.filter((r: { is_featured?: boolean }) => r.is_featured).length ?? 0;

  const cards = [
    { label: "Categories", value: categories?.length ?? 0, href: "/admin/categories" },
    { label: "Featured picks", value: featuredCount, href: "/admin/featured" },
    { label: "Hero slides", value: heroSlidesCount, href: "/admin/hero" },
    { label: "Products (total)", value: products?.length ?? 0, href: "/products" },
    { label: "Pending orders", value: pendingOrders?.length ?? 0, href: "/admin/orders" },
  ];

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Manage categories uploaded by admin and track COD orders. This panel is responsive on phones too.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.label}</div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">{c.value}</div>
              <div className="mt-3 text-sm font-semibold text-blue-800">Open →</div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
          Tip: add categories here — they appear instantly in the storefront header dropdown.
        </div>
      </div>
    </main>
  );
}
