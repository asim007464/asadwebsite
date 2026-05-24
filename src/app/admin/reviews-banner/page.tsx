import Link from "next/link";
import { updateHomeReviewsBanner } from "@/app/admin/actions";
import { PromoBannerAdminFields } from "@/components/admin/PromoBannerAdminFields";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  HOME_PROMO_BANNER_AFTER_HERO_ID,
  HOME_PROMO_BANNER_BEFORE_REVIEWS_ID,
  parseHomePromoBannerRow,
} from "@/lib/home-promo-banner";
import type { HomeReviewsBannerRow } from "@/lib/store-types";

export const dynamic = "force-dynamic";

function emptyRow(id: number): HomeReviewsBannerRow {
  return {
    id,
    background_image_url: "",
    heading: "",
    paragraph: "",
    button_label: "",
    button_href: "/products",
    is_active: false,
  };
}

function PromoBannerFormBlock({
  title,
  description,
  row,
}: {
  title: string;
  description: string;
  row: HomeReviewsBannerRow;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <form action={updateHomeReviewsBanner} className="mt-8 grid grid-cols-1 gap-5 border-t border-slate-100 pt-8 md:gap-6">
        <PromoBannerAdminFields row={row} />
        <button
          type="submit"
          className="inline-flex h-12 max-w-xs items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Save banner {row.id}
        </button>
      </form>
    </section>
  );
}

export default async function AdminReviewsBannerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const savedRaw = typeof sp.saved === "string" ? sp.saved : undefined;
  const saved = savedRaw === "1" || savedRaw === "2" ? savedRaw : undefined;

  const supabase = createSupabaseAdminClient();
  const { data, error: loadError } = await supabase
    .from("home_reviews_banner")
    .select("id,background_image_url,heading,paragraph,button_label,button_href,is_active")
    .in("id", [HOME_PROMO_BANNER_AFTER_HERO_ID, HOME_PROMO_BANNER_BEFORE_REVIEWS_ID]);

  const byId = new Map<number, HomeReviewsBannerRow>();
  for (const row of data ?? []) {
    const id = Number((row as { id: number }).id);
    if (id === 1 || id === 2) {
      byId.set(id, parseHomePromoBannerRow(row, id));
    }
  }

  const afterHero = byId.get(HOME_PROMO_BANNER_AFTER_HERO_ID) ?? emptyRow(HOME_PROMO_BANNER_AFTER_HERO_ID);
  const beforeReviews = byId.get(HOME_PROMO_BANNER_BEFORE_REVIEWS_ID) ?? emptyRow(HOME_PROMO_BANNER_BEFORE_REVIEWS_ID);

  return (
    <main className="space-y-8 py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Home promo banners</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Two independent strips on the homepage — each with its own image, copy, and button. Turn on{" "}
              <span className="font-semibold">Active</span> per banner when ready.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {loadError ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
            Could not load settings ({loadError.message}). Run{" "}
            <span className="font-mono text-xs">supabase/migrations/20260523160000_home_reviews_banner_second_slot.sql</span>{" "}
            in Supabase, then refresh.
          </div>
        ) : null}

        {saved ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            Banner {saved} saved.
          </div>
        ) : null}

        {error === "invalid-bg-url" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Background URL must start with <span className="font-mono text-xs">https://</span>, a site path like{" "}
            <span className="font-mono text-xs">/photo.jpg</span>, or be left blank if you upload instead.
          </div>
        ) : null}
        {error === "invalid-button-href" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Button link must be a site path (<span className="font-mono text-xs">/products</span>) or{" "}
            <span className="font-mono text-xs">https://…</span> URL.
          </div>
        ) : null}
        {error === "invalid-banner" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Unknown banner slot.
          </div>
        ) : null}
        {error && !["invalid-bg-url", "invalid-button-href", "invalid-banner"].includes(error) ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}
      </div>

      <PromoBannerFormBlock
        title="Banner 1 — After hero carousel"
        description="Shown after the homepage carousel and before Browse categories."
        row={afterHero}
      />

      <PromoBannerFormBlock
        title="Banner 2 — Before customer reviews"
        description="Shown after the stats section and directly above testimonials / FAQ."
        row={beforeReviews}
      />
    </main>
  );
}
