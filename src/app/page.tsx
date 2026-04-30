import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Category, HeroSlideRow, ProductListing } from "@/lib/store-types";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { DemoProductSection } from "@/components/DemoProductSection";
import { CategorySlider } from "@/components/CategorySlider";
import { SITE_SHOP_NAME, SITE_SHORT_TAGLINE } from "@/lib/site-brand";
import { FALLBACK_HERO_BACKDROP_SLIDES } from "@/lib/site-visuals";
import { HeroCarouselDots, HeroCarouselProvider } from "@/components/HeroBackdropCarousel";
import { FeaturedProductsCarousel } from "@/components/FeaturedProductsCarousel";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FAQSection } from "@/components/FAQSection";
import { StatCountUp } from "@/components/StatCountUp";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import { getCategoryThumb } from "@/lib/category-thumbs";

export const dynamic = "force-dynamic";

export default function Home() {
  return <HomeServer />;
}

async function HomeServer() {
  const supabase = createSupabaseAdminClient();

  const [{ data: categories }, featuredBlock, heroSlidesResult, catalogCountRes, gadgetsRes] = await Promise.all([
    supabase.from("categories").select("id,name,slug,parent_id").order("name"),
    (async () => {
      const featured = await supabase
        .from("product_listings")
        .select(
          "id,name,slug,description,min_price_pkr,image_url,is_featured,featured_sort_order,default_variant_id,default_variant_sku,default_variant_title,default_variant_price_pkr",
        )
        .eq("is_featured", true)
        .order("featured_sort_order", { ascending: true })
        .order("name", { ascending: true })
        .limit(48);
      if (!featured.error && featured.data?.length) {
        return { rows: featured.data as ProductListing[], source: "featured" as const };
      }
      const fb = await supabase
        .from("product_listings")
        .select(
          "id,name,slug,description,min_price_pkr,image_url,default_variant_id,default_variant_sku,default_variant_title,default_variant_price_pkr",
        )
        .order("name", { ascending: true })
        .limit(12);
      return {
        rows: ((fb.data as ProductListing[] | null) ?? []) as ProductListing[],
        source: "catalog" as const,
      };
    })(),
    supabase.from("hero_slides").select("id,url,alt,sort_order,is_active").eq("is_active", true).order("sort_order"),
    supabase.from("product_listings").select("id", { count: "exact", head: true }),
    supabase
      .from("product_listings")
      .select("id,name,slug,description,min_price_pkr,image_url,default_variant_id,default_variant_sku,default_variant_title,default_variant_price_pkr")
      .order("name")
      .limit(12),
  ]);

  const featuredProducts = featuredBlock.rows;
  const featuredSource = featuredBlock.source;
  const hasLiveProducts = (catalogCountRes.count ?? 0) > 0;
  const dropdownCategories = ((categories as Category[] | null) ?? []).slice(0, 10);
  const gadgetsProducts = ((gadgetsRes.data as ProductListing[] | null) ?? []) as ProductListing[];

  const heroSlideRows =
    heroSlidesResult.error || !heroSlidesResult.data ? [] : (heroSlidesResult.data as HeroSlideRow[]);
  const dbHero = heroSlideRows.filter((r) => r.is_active && r.url.trim().length > 0);
  const heroBackdropSlides =
    dbHero.length > 0
      ? dbHero.map((r) => ({ id: r.id, url: r.url.trim(), alt: r.alt }))
      : FALLBACK_HERO_BACKDROP_SLIDES.map((s, i) => ({ id: `fallback-${i}`, url: s.url, alt: s.alt }));

  const demoComfortPower = DEMO_PRODUCTS.slice(0, 3);
  const demoKitchenCooling = DEMO_PRODUCTS.slice(3, 6);
  const demoPersonalKitchen = DEMO_PRODUCTS.slice(6, 10);

  return (
    <>
      {/* Edge-to-edge carousel + scrims; copy constrained inside (slide URLs: /admin/hero). */}
      <section className="relative w-full overflow-hidden bg-slate-950 min-h-[28rem] lg:min-h-[min(36rem,78vh)]">
        <HeroCarouselProvider slides={heroBackdropSlides}>
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/25" aria-hidden />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-blue-950/92 via-blue-900/82 to-slate-950/94" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-blue-950/72 via-blue-950/25 to-slate-950/55"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] opacity-[0.62]"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 95% 75% at 18% 28%, rgba(15,23,42,0.55), transparent 50%), radial-gradient(ellipse 70% 60% at 90% 75%, rgba(15,23,42,0.45), transparent 48%)",
            }}
            aria-hidden
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-100 ring-1 ring-white/15 backdrop-blur-md">
                {SITE_SHOP_NAME}
              </span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-100 ring-1 ring-emerald-400/25">
                COD · Lahore & nationwide
              </span>
              </div>

              <p className="mt-5 text-sm font-semibold leading-snug text-blue-200/95">{SITE_SHORT_TAGLINE}</p>

              <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.45rem] lg:leading-[1.15]">
              Straight answers on specs — then{" "}
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent [-webkit-background-clip:text]">
                cash on delivery
              </span>{" "}
              you can rely on.
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-relaxed text-blue-50/90 sm:text-[15px]">
              Fans, LED lighting, heaters, coolers, kitchen helpers, grooming tools, wiring and electrical accessories. Pick your variant — we confirm each order by phone or WhatsApp before anything leaves the warehouse.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="inline-flex h-12 min-w-[11rem] items-center justify-center rounded-full bg-white px-7 text-sm font-bold text-blue-800 shadow-lg shadow-blue-950/30 transition hover:bg-blue-50"
              >
                Shop catalog
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 min-w-[11rem] items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/18"
              >
                Directions & contact
              </Link>
              </div>
            </div>

            <div className="mt-8 flex w-full justify-center">
              <HeroCarouselDots />
            </div>
          </div>
        </HeroCarouselProvider>
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-10">
        <section className="rounded-3xl border border-slate-200/80 bg-slate-50/80 px-3 py-6 shadow-inner sm:px-5 sm:py-7">
          <div className="flex items-end justify-between gap-4 px-1">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Shop by category</h2>
              <p className="mt-1 text-sm text-slate-600">Curated sections for faster browsing — auto-scrolls; pause by hovering.</p>
            </div>
            <Link href="/products" className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="mt-5 px-0">
            <CategorySlider categories={(categories as Category[] | null) ?? []} />
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Featured picks</h2>
              <p className="mt-1 text-sm text-slate-600">
                Hot-selling highlights chosen by admin — four across on extra-wide screens; step through one SKU at a time.
              </p>
            </div>
            <Link href="/products" className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800">
              Browse more
            </Link>
          </div>
          {featuredProducts.length ? (
            <>
              {featuredSource === "catalog" ? (
                <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <span className="font-semibold">None marked as featured yet.</span> Showing catalog items instead. Open{" "}
                  <Link href="/admin/featured" className="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-900">
                    Admin → Featured picks
                  </Link>{" "}
                  to flag hot sellers for this strip.
                </p>
              ) : null}
              <div className="mt-5">
                <FeaturedProductsCarousel products={featuredProducts} />
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">Your catalog is empty right now</div>
              <p className="mt-2 leading-relaxed">
                Seed demo data with <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">supabase/seed.sql</code> or add products in Supabase. In the meantime, scroll down for{" "}
                <span className="font-semibold text-blue-800">three demo sections</span> so your client can review layout and content density.
              </p>
            </div>
          )}
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Browse categories</h2>
              <p className="mt-1 text-sm text-slate-600">Quick links to the same categories in the navbar dropdown.</p>
            </div>
            <Link href="/products" className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800">
              View all
            </Link>
          </div>

          {dropdownCategories.length ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {dropdownCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${encodeURIComponent(c.slug)}`}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md motion-reduce:hover:translate-y-0"
                >
                  <div className="relative aspect-[16/10] w-full bg-slate-100">
                    <div
                      aria-hidden
                      className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-[2px]"
                      style={{ backgroundImage: `url(${getCategoryThumb(c.slug).url})` }}
                    />
                    <SafeRemoteImage
                      src={getCategoryThumb(c.slug).url}
                      alt={getCategoryThumb(c.slug).alt}
                      fill
                      className="z-10 object-cover transition-transform duration-200 ease-smooth-out motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                    />
                  </div>
                  <div className="p-4">
                    <div className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-800">{c.name}</div>
                    <div className="mt-1 text-xs font-medium text-slate-500">Explore →</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              No categories yet. Add them in <span className="font-semibold text-blue-800">Admin → Categories</span>.
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Gadget section</h2>
              <p className="mt-1 text-sm text-slate-600">More popular items — same layout as Featured picks.</p>
            </div>
            <Link href="/products" className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800">
              Browse more
            </Link>
          </div>
          <div className="mt-5">
            <FeaturedProductsCarousel products={gadgetsProducts} />
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-white p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Trusted home appliances & electrical accessories — with transparent pricing.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              Cash on delivery, phone confirmation, and nationwide dispatch. These figures are placeholders — swap to real business stats anytime.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                <span className="tabular-nums">
                  <StatCountUp value={25} format="number" />
                </span>
                +
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Years experience</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                <StatCountUp value={15_000} />
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Happy customers</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                <StatCountUp value={560} format="number" />
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Orders shipped</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                <StatCountUp value={2_000} />
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Positive reviews</div>
            </div>
          </div>
        </section>

        <section className="relative left-1/2 mt-16 w-[100dvw] -translate-x-1/2 border-y border-slate-200 bg-white py-14 text-slate-900 sm:py-16 -mb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <TestimonialsSection />
            <FAQSection />
          </div>
        </section>

        {!hasLiveProducts ? (
          <>
            <DemoProductSection
              eyebrow="Design preview 01"
              title="Comfort & power — ceiling fans, LEDs, heaters"
              subtitle="Demo SKUs show how fans, bulbs, and heaters read online: wattage, finishes, remote bundles, and PKR pricing chips."
              products={demoComfortPower}
            />

            <DemoProductSection
              eyebrow="Design preview 02"
              title="Cooling & kitchen — coolers, extensions, juicers"
              subtitle="Air coolers, heavy-duty reels, and blender/juicer combos with bundle-friendly storytelling."
              products={demoKitchenCooling}
            />

            <DemoProductSection
              eyebrow="Design preview 03"
              title="Grooming & breakfast — dryers, clippers, grills, curlers"
              subtitle="Hair tools plus sandwich presses — heat ratings, guards, and attachments listed like real catalog rows."
              products={demoPersonalKitchen}
            />
          </>
        ) : null}
      </main>
    </>
  );
}
