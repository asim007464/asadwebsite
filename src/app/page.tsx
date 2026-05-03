import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Category, HeroSlideRow, HomeReviewsBannerRow, ProductListing } from "@/lib/store-types";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { DemoProductSection } from "@/components/DemoProductSection";
import { FALLBACK_HERO_BACKDROP_SLIDES } from "@/lib/site-visuals";
import { HeroCarouselDots, HeroCarouselProvider } from "@/components/HeroBackdropCarousel";
import { FeaturedProductsCarousel } from "@/components/FeaturedProductsCarousel";
import { ReviewsBannerSection } from "@/components/ReviewsBannerSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FAQSection } from "@/components/FAQSection";
import { StatCountUp } from "@/components/StatCountUp";
import { BrowseCategoriesGrid } from "@/components/BrowseCategoriesGrid";
import { getHomeSectionListings } from "@/lib/home-section-products";
import { getStorefrontPayload } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export default function Home() {
  return <HomeServer />;
}

async function HomeServer() {
  const supabase = createSupabaseAdminClient();

  const [
    categoriesRes,
    featuredBlock,
    gadgetsBlock,
    heroSlidesResult,
    catalogCountRes,
    reviewsBannerRes,
    storefront,
  ] = await Promise.all([
    supabase.from("categories").select("id,name,slug,parent_id,thumbnail_url,hero_icon_hint").order("name"),
    getHomeSectionListings("featured", 48),
    getHomeSectionListings("gadgets", 48),
    supabase.from("hero_slides").select("id,url,alt,sort_order,is_active").eq("is_active", true).order("sort_order"),
    supabase.from("product_listings").select("id", { count: "exact", head: true }),
    supabase
      .from("home_reviews_banner")
      .select("id,background_image_url,heading,paragraph,button_label,button_href,is_active")
      .eq("id", 1)
      .maybeSingle(),
    getStorefrontPayload(),
  ]);

  const { data: categories } = categoriesRes;
  const featuredProducts = featuredBlock.rows;
  const featuredSource = featuredBlock.source;
  const hasLiveProducts = (catalogCountRes.count ?? 0) > 0;
  const allCategoriesList = ((categories as Category[] | null) ?? []);
  const gadgetsProducts = gadgetsBlock.rows;
  const rb = !reviewsBannerRes.error && reviewsBannerRes.data ? (reviewsBannerRes.data as HomeReviewsBannerRow) : null;
  const rbBg = rb?.background_image_url?.trim() ?? "";
  const rbHead = rb?.heading?.trim() ?? "";
  const rbPara = rb?.paragraph?.trim() ?? "";
  const rbLbl = rb?.button_label?.trim() ?? "";
  const showReviewsBannerStrip =
    Boolean(rb?.is_active) &&
    rbBg.length > 0 &&
    /^https:\/\//i.test(rbBg) &&
    (rbHead.length > 0 || rbPara.length > 0 || rbLbl.length > 0);

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
              {(storefront.heroTitle ?? "").trim() ? (
                <h1 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.45rem] lg:leading-[1.15]">
                  {storefront.heroTitle!.trim()}
                </h1>
              ) : (
                <h1 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.45rem] lg:leading-[1.15]">
                  Straight answers on specs — then{" "}
                  <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent [-webkit-background-clip:text]">
                    cash on delivery
                  </span>{" "}
                  you can rely on.
                </h1>
              )}

              <p className="mt-5 max-w-lg text-sm leading-relaxed text-blue-50/90 sm:text-[15px]">
                {(storefront.heroLeadParagraph ?? "").trim().length ? (
                  storefront.heroLeadParagraph
                ) : (
                  <>
                    Fans, LED lighting, heaters, coolers, kitchen helpers, grooming tools, wiring and electrical accessories. Pick your variant —
                    we confirm each order by phone or WhatsApp before anything leaves the warehouse.
                  </>
                )}
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
          </div>

          {/* Bottom-center on full hero width (not tied to the left text column). */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4 sm:bottom-8 lg:bottom-12">
            <div className="pointer-events-auto">
              <HeroCarouselDots />
            </div>
          </div>
        </HeroCarouselProvider>
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Browse categories</h2>
              <p className="mt-1 text-sm text-slate-600">Quick links to the same categories in the navbar dropdown.</p>
            </div>
            <Link href="/products" className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800">
              View all
            </Link>
          </div>

          <BrowseCategoriesGrid categories={allCategoriesList} />
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
                  <span className="font-semibold">No curated homepage list yet.</span> Showing newest catalog SKUs instead. Assign products in{" "}
                  <Link href="/admin/home-sections" className="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-900">
                    Admin → Homepage strips
                  </Link>{" "}
                  or flag items in{" "}
                  <Link href="/admin/featured" className="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-900">
                    Featured picks
                  </Link>
                  .
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

        {showReviewsBannerStrip && rb ? <ReviewsBannerSection banner={rb} /> : null}

        <section
          className={`relative left-1/2 w-[100dvw] -translate-x-1/2 border-y border-slate-200 bg-white py-14 text-slate-900 sm:py-16 -mb-12 ${showReviewsBannerStrip ? "mt-8 sm:mt-10" : "mt-16"}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <TestimonialsSection
              intro={storefront.testimonialsLead}
              testimonials={(storefront.testimonials ?? []).length > 0 ? storefront.testimonials : undefined}
            />
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
