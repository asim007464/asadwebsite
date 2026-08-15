import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Category,
  HeroSlideRow,
  HomeAfterBrowseBannerRow,
  HomeReviewsBannerRow,
  ProductListing,
} from "@/lib/store-types";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { DemoProductSection } from "@/components/DemoProductSection";
import { FALLBACK_HERO_BACKDROP_SLIDES } from "@/lib/site-visuals";
import {
  HeroCarouselArrows,
  HeroCarouselDots,
  HeroCarouselImagePanel,
  HeroCarouselProvider,
} from "@/components/HeroBackdropCarousel";
import { FeaturedProductsCarousel } from "@/components/FeaturedProductsCarousel";
import { HomeAfterBrowseBanner } from "@/components/HomeAfterBrowseBanner";
import { ReviewsBannerSection } from "@/components/ReviewsBannerSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FAQSection } from "@/components/FAQSection";
import { StatCountUp } from "@/components/StatCountUp";
import { BrowseCategoriesGrid } from "@/components/BrowseCategoriesGrid";
import { HomeBrowseShowcaseGrid } from "@/components/HomeBrowseShowcaseGrid";
import { getHomeBrowseShowcasePayload } from "@/lib/home-browse-showcase";
import { getHomeSectionListings } from "@/lib/home-section-products";
import { getStorefrontPayload } from "@/lib/storefront";
import {
  HOME_PROMO_BANNER_AFTER_HERO_ID,
  HOME_PROMO_BANNER_BEFORE_REVIEWS_ID,
  isHomePromoBannerVisible,
  parseHomePromoBannerRow,
} from "@/lib/home-promo-banner";

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
    promoBannersRes,
    browseShowcaseBlock,
    afterBrowseBannerRes,
    storefront,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug,parent_id,thumbnail_url,hero_icon_hint")
      .order("name"),
    getHomeSectionListings("featured", 48),
    getHomeSectionListings("gadgets", 48),
    supabase
      .from("hero_slides")
      .select("id,url,alt,sort_order,is_active")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("product_listings")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("home_reviews_banner")
      .select(
        "id,background_image_url,heading,paragraph,button_label,button_href,is_active",
      )
      .in("id", [
        HOME_PROMO_BANNER_AFTER_HERO_ID,
        HOME_PROMO_BANNER_BEFORE_REVIEWS_ID,
      ]),
    getHomeBrowseShowcasePayload(),
    supabase
      .from("home_after_browse_banner")
      .select("id,image_url,link_href,alt_text,is_active")
      .eq("id", 1)
      .maybeSingle(),
    getStorefrontPayload(),
  ]);

  const { data: categories } = categoriesRes;
  const featuredProducts = featuredBlock.rows;
  const featuredSource = featuredBlock.source;
  const hasLiveProducts = (catalogCountRes.count ?? 0) > 0;
  const allCategoriesList = (categories as Category[] | null) ?? [];
  const gadgetsProducts = gadgetsBlock.rows;
  const promoById = new Map<number, HomeReviewsBannerRow>();
  if (!promoBannersRes.error && promoBannersRes.data) {
    for (const row of promoBannersRes.data) {
      const id = Number((row as HomeReviewsBannerRow).id);
      if (
        id === HOME_PROMO_BANNER_AFTER_HERO_ID ||
        id === HOME_PROMO_BANNER_BEFORE_REVIEWS_ID
      ) {
        promoById.set(id, parseHomePromoBannerRow(row, id));
      }
    }
  }
  const promoAfterHero = promoById.get(HOME_PROMO_BANNER_AFTER_HERO_ID) ?? null;
  const promoBeforeReviews =
    promoById.get(HOME_PROMO_BANNER_BEFORE_REVIEWS_ID) ?? null;
  const showPromoAfterHero = isHomePromoBannerVisible(promoAfterHero);
  const showPromoBeforeReviews = isHomePromoBannerVisible(promoBeforeReviews);

  const {
    showcase: browseShowcase,
    category: browseShowcaseCategory,
    products: browseShowcaseProducts,
  } = browseShowcaseBlock;
  const useBrowseShowcase =
    Boolean(browseShowcase?.is_active) &&
    browseShowcaseCategory != null &&
    browseShowcaseProducts.length > 0;

  const afterBrowseBanner =
    !afterBrowseBannerRes.error && afterBrowseBannerRes.data
      ? (afterBrowseBannerRes.data as HomeAfterBrowseBannerRow)
      : null;
  const afterBrowseImg = afterBrowseBanner?.image_url?.trim() ?? "";
  const showAfterBrowseBanner =
    Boolean(afterBrowseBanner?.is_active) &&
    afterBrowseImg.length > 0 &&
    (/^https:\/\//i.test(afterBrowseImg) || afterBrowseImg.startsWith("/"));
  const heroSlideRows =
    heroSlidesResult.error || !heroSlidesResult.data
      ? []
      : (heroSlidesResult.data as HeroSlideRow[]);
  const dbHero = heroSlideRows.filter(
    (r) => r.is_active && r.url.trim().length > 0,
  );
  const heroBackdropSlides =
    dbHero.length > 0
      ? dbHero.map((r) => ({ id: r.id, url: r.url.trim(), alt: r.alt }))
      : FALLBACK_HERO_BACKDROP_SLIDES.map((s, i) => ({
          id: `fallback-${i}`,
          url: s.url,
          alt: s.alt,
        }));

  const demoComfortPower = DEMO_PRODUCTS.slice(0, 3);
  const demoKitchenCooling = DEMO_PRODUCTS.slice(3, 6);
  const demoPersonalKitchen = DEMO_PRODUCTS.slice(6, 10);

  return (
    <>
      {/* Image-only hero carousel (slides: /admin/hero). */}
      <section className="relative h-[38vh] min-h-[14rem] w-full border-b border-slate-200 sm:h-[48vh] sm:min-h-[16rem] lg:h-[55vh]">
        <HeroCarouselProvider slides={heroBackdropSlides}>
          <HeroCarouselImagePanel variant="banner" className="h-full" />
          <HeroCarouselArrows />
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center sm:bottom-6">
            <div className="pointer-events-auto">
              <HeroCarouselDots tone="onImage" />
            </div>
          </div>
        </HeroCarouselProvider>
      </section>

      {showPromoAfterHero && promoAfterHero ? (
        <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <ReviewsBannerSection
            banner={promoAfterHero}
            layout="contained"
            headingId="home-promo-banner-1-heading"
          />
        </div>
      ) : null}

      <main
        className={`mx-auto w-full max-w-7xl px-3 pb-10 sm:px-4 sm:pb-12 ${showPromoAfterHero ? "pt-6 sm:pt-8" : "pt-7 sm:pt-10"}`}
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8">
          {useBrowseShowcase && browseShowcaseCategory ? (
            <HomeBrowseShowcaseGrid
              category={browseShowcaseCategory}
              products={browseShowcaseProducts}
              sectionTitle={browseShowcase?.section_title}
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 sm:items-end sm:gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Browse categories
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Quick links to the same categories in the navbar dropdown.
                  </p>
                </div>
                <Link
                  href="/products"
                  className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  View all
                </Link>
              </div>

              <BrowseCategoriesGrid categories={allCategoriesList} />
            </>
          )}
        </section>

        {showAfterBrowseBanner && afterBrowseBanner ? (
          <HomeAfterBrowseBanner banner={afterBrowseBanner} />
        ) : null}

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Featured picks
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Hot-selling highlights chosen by admin — four across on
                extra-wide screens; step through one SKU at a time.
              </p>
            </div>
            <Link
              href="/products"
              className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Browse more
            </Link>
          </div>
          {featuredProducts.length ? (
            <>
              {featuredSource === "catalog" ? (
                <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <span className="font-semibold">
                    No curated homepage list yet.
                  </span>{" "}
                  Showing newest catalog SKUs instead. Assign products in{" "}
                  <Link
                    href="/admin/home-sections"
                    className="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-900"
                  >
                    Admin → Homepage strips
                  </Link>{" "}
                  or flag items in{" "}
                  <Link
                    href="/admin/featured"
                    className="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-900"
                  >
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
              <div className="font-semibold text-slate-900">
                Your catalog is empty right now
              </div>
              <p className="mt-2 leading-relaxed">
                Seed demo data with{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                  supabase/seed.sql
                </code>{" "}
                or add products in Supabase. In the meantime, scroll down for{" "}
                <span className="font-semibold text-blue-800">
                  three demo sections
                </span>{" "}
                so your client can review layout and content density.
              </p>
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Gadget section
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                More popular items — same layout as Featured picks.
              </p>
            </div>
            <Link
              href="/products"
              className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
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
              {storefront.homeStatsTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              {storefront.homeStatsLead}
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
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Years experience
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                <StatCountUp value={15_000} />
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Happy customers
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                <StatCountUp value={560} format="number" />
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Orders shipped
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                <StatCountUp value={2_000} />
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Positive reviews
              </div>
            </div>
          </div>
        </section>

        {showPromoBeforeReviews && promoBeforeReviews ? (
          <ReviewsBannerSection
            banner={promoBeforeReviews}
            layout="fullBleed"
            headingId="home-promo-banner-2-heading"
            className={showPromoAfterHero ? "mt-8 sm:mt-10" : "mt-12"}
          />
        ) : null}

        <section
          className={`-mx-3 border-y border-slate-200 bg-white py-10 text-slate-900 sm:-mx-4 sm:py-14 lg:mx-0 lg:rounded-none -mb-12 ${showPromoBeforeReviews ? "mt-8 sm:mt-10" : "mt-12 sm:mt-16"}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <TestimonialsSection
              intro={storefront.testimonialsLead}
              testimonials={
                (storefront.testimonials ?? []).length > 0
                  ? storefront.testimonials
                  : undefined
              }
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
