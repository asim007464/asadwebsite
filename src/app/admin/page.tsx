import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminOwner } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const cardAccent = [
  "from-violet-500/15 to-transparent border-violet-200/60 hover:border-violet-300",
  "from-blue-500/15 to-transparent border-blue-200/60 hover:border-blue-300",
  "from-cyan-500/15 to-transparent border-cyan-200/60 hover:border-cyan-300",
  "from-emerald-500/15 to-transparent border-emerald-200/60 hover:border-emerald-300",
  "from-amber-500/15 to-transparent border-amber-200/60 hover:border-amber-300",
  "from-rose-500/15 to-transparent border-rose-200/60 hover:border-rose-300",
] as const;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ownerOnly = sp.notice === "owner-only";
  const owner = await isAdminOwner();

  const supabase = createSupabaseAdminClient();

  const [
    { data: categories },
    { data: products },
    { data: pendingOrders },
    heroSlidesRes,
    reviewsBannerRes,
    homepageRowsRes,
  ] = await Promise.all([
      supabase.from("categories").select("id"),
      supabase.from("products").select("id,is_featured"),
      supabase.from("orders").select("id").eq("status", "pending"),
      supabase.from("hero_slides").select("id"),
      supabase.from("home_reviews_banner").select("is_active,id").eq("id", 1).maybeSingle(),
      supabase.from("homepage_section_products").select("id", { count: "exact", head: true }),
    ]);

  const heroSlidesCount = heroSlidesRes.error ? 0 : (heroSlidesRes.data?.length ?? 0);
  const reviewsBannerOn =
    !reviewsBannerRes.error &&
    Boolean(reviewsBannerRes.data?.is_active) &&
    reviewsBannerRes.data != null;

  const featuredCount = products?.filter((r: { is_featured?: boolean }) => r.is_featured).length ?? 0;
  const homepageCuratedCount = homepageRowsRes.error ? 0 : (homepageRowsRes.count ?? 0);
  const pending = pendingOrders?.length ?? 0;

  const cards = [
    ...(owner ? ([{ label: "Users & admins", value: "Manage", href: "/admin/team", hint: "Accounts & access" }] as const) : []),
    { label: "Pending orders", value: pending, href: "/admin/orders", hint: "COD queue" },
    { label: "Categories", value: categories?.length ?? 0, href: "/admin/categories", hint: "Catalog structure" },
    { label: "Products", value: products?.length ?? 0, href: "/admin/products", hint: "Add & edit catalog" },
    { label: "Featured picks", value: featuredCount, href: "/admin/featured", hint: "Home carousel" },
    { label: "Hero slides", value: heroSlidesCount, href: "/admin/hero", hint: "Home backgrounds" },
    {
      label: "Reviews banner",
      value: reviewsBannerOn ? "Live" : "Off",
      href: "/admin/reviews-banner",
      hint: "Home promo strip",
    },
    { label: "Homepage rows", value: homepageCuratedCount, href: "/admin/home-sections", hint: "Curated SKUs" },
    { label: "Site CMS", value: "Edit", href: "/admin/site", hint: "Copy & payments" },
    { label: "SEO snippets", value: products?.length ?? 0, href: "/admin/products/seo", hint: "Meta & titles" },
  ] as const;

  return (
    <main className="py-6 lg:py-0">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-200/60">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-8 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600/80">Overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">Dashboard</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Run the store from here — orders, catalog, homepage content, and SEO. Works on your phone too.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {ownerOnly ? (
            <div className="mb-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 px-4 py-3 text-sm font-medium text-amber-950 shadow-sm">
              Only the <span className="font-semibold">site owner</span> can open Users &amp; admins. Staff can use everything else.
            </div>
          ) : null}

          {pending > 0 ? (
            <Link
              href="/admin/orders"
              className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-500 hover:to-indigo-500"
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-100">Action needed</div>
                <div className="mt-1 text-lg font-bold">
                  {pending} pending order{pending !== 1 ? "s" : ""}
                </div>
                <div className="mt-0.5 text-sm text-blue-100">Review and update statuses →</div>
              </div>
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold ring-1 ring-white/30">Open</span>
            </Link>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((c, i) => (
              <Link
                key={c.label}
                href={c.href}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition ${cardAccent[i % cardAccent.length]} hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{c.label}</div>
                    <div className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{c.value}</div>
                    {"hint" in c && c.hint ? (
                      <div className="mt-1 text-xs font-medium text-slate-500">{c.hint}</div>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-blue-700 opacity-0 shadow-sm ring-1 ring-slate-200/80 transition group-hover:opacity-100">
                    Open →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-indigo-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium leading-relaxed text-blue-950">
              <span className="font-semibold">Tip:</span> New categories show up instantly in the storefront header dropdown.
            </p>
            <Link
              href="/admin/categories"
              className="shrink-0 rounded-full bg-blue-600 px-5 py-2.5 text-center text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
            >
              Manage categories
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
