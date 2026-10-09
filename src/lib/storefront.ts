import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SocialLinkRow = { label: string; url: string; platform?: string };

export type StorefrontTestimonial = {
  quote: string;
  name: string;
  meta: string;
  initials: string;
};

export type AboutValueCard = { title: string; body: string };
export type AboutWorkStep = { step: string; title: string; body: string };
export type AboutTeamMember = {
  name: string;
  role: string;
  note: string;
  initials: string;
  /** Optional circular portrait URL. */
  imageUrl?: string;
};
export type AboutStoryBlock = { title: string; body: string };
export type StorefrontFaqItem = { q: string; a: string };
export type StorefrontBrandLogo = { name: string; imageUrl?: string };

export type StorefrontPayload = {
  socialLinks?: SocialLinkRow[];
  testimonialsLead?: string;
  headerAccent?: string;
  heroTitle?: string;
  heroBadgeCod?: string;
  heroBadgeRegion?: string;
  heroLeadParagraph?: string;
  aboutPrimaryImage?: string;
  /** About banner image for phones when aboutSeparateMobileImage is true. */
  aboutPrimaryImageMobile?: string;
  aboutSeparateMobileImage?: boolean;
  aboutSecondaryImage?: string;
  contactPrimaryImage?: string;
  contactSecondaryImage?: string;
  testimonials?: StorefrontTestimonial[];
  bankName?: string;
  bankIban?: string;
  bankAccountTitle?: string;
  jazzcashNumber?: string;
  jazzcashTitle?: string;
  /** Shown on Contact page support card, visit section, and footer (e.g. 08:00–20:00 PKT · Mon–Sat). */
  supportDeskHours?: string;
  supportEscalations?: string;
  supportCommitmentsIntro?: string;
  homeStatsTitle?: string;
  homeStatsLead?: string;
  /** Homepage Browse categories grid heading + paragraph. */
  browseCategoriesTitle?: string;
  browseCategoriesLead?: string;
  /** Homepage Featured picks carousel heading + paragraph. */
  featuredSectionTitle?: string;
  featuredSectionLead?: string;
  /** Homepage Gadget section heading + paragraph. */
  gadgetsSectionTitle?: string;
  gadgetsSectionLead?: string;
  /** Reviews block eyebrow / heading / rating-card note. */
  testimonialsEyebrow?: string;
  testimonialsHeading?: string;
  reviewsRatingNote?: string;
  /** Score shown on the rating card (e.g. "5.0"). */
  reviewsRatingScore?: string;
  /** FAQ section on the homepage (below reviews). */
  faqEyebrow?: string;
  faqHeading?: string;
  faqLead?: string;
  faqContactLabel?: string;
  faqContactHref?: string;
  faqs?: StorefrontFaqItem[];
  /** Homepage brands marquee (above reviews). */
  brandsSectionEyebrow?: string;
  brandsSectionTitle?: string;
  brandsSectionLead?: string;
  brandLogos?: StorefrontBrandLogo[];
  aboutPageTitle?: string;
  aboutPageLead?: string;
  aboutChips?: string[];
  /** Small label above the about banner title. */
  aboutEyebrow?: string;
  aboutCtaPrimaryLabel?: string;
  aboutCtaPrimaryHref?: string;
  aboutCtaSecondaryLabel?: string;
  aboutCtaSecondaryHref?: string;
  /** Team section CTA link (defaults to /contact). */
  aboutTeamCtaHref?: string;
  /** About promo banner height in px (laptop / big screens). */
  aboutBannerHeightPx?: number;
  /** About promo banner height in px (phones). */
  aboutBannerHeightMobilePx?: number;
  aboutValues?: AboutValueCard[];
  aboutHowTitle?: string;
  aboutHowLead?: string;
  aboutHowBadge?: string;
  /** Extra heading + paragraph blocks under the How we work intro. */
  aboutHowBlocks?: AboutStoryBlock[];
  aboutHowSteps?: AboutWorkStep[];
  aboutTeamEyebrow?: string;
  aboutTeamTitle?: string;
  aboutTeamLead?: string;
  aboutTeamCtaLabel?: string;
  aboutTeam?: AboutTeamMember[];
  /** “Our story” block under leadership (shop photo + repeatable text). */
  aboutStoryEyebrow?: string;
  aboutStoryTitle?: string;
  aboutStoryLead?: string;
  aboutStoryBlocks?: AboutStoryBlock[];
  contactPageTitle?: string;
  contactPageLead?: string;
  contactEmail?: string;
  contactChannel1Label?: string;
  contactChannel1Display?: string;
  contactChannel1Tel?: string;
  contactChannel1Wa?: string;
  contactChannel1Notes?: string;
  contactChannel2Label?: string;
  contactChannel2Display?: string;
  contactChannel2Tel?: string;
  contactChannel2Wa?: string;
  contactChannel2Notes?: string;
  storeLocationName?: string;
  storeLat?: number;
  storeLng?: number;
  googlePlaceFeatureRef?: string;
  googleMapsPlaceUrl?: string;
  /** When false, homepage hero carousel is hidden. */
  heroEnabled?: boolean;
  /** Homepage hero carousel height in pixels (laptop / big screens). */
  heroHeightPx?: number;
  /** Homepage hero carousel height in pixels (phones). */
  heroHeightMobilePx?: number;
  /** When false, hero is hidden on phone screens only. */
  heroVisibleOnMobile?: boolean;
};

export const DEFAULT_STOREFRONT: StorefrontPayload & { socialLinks: SocialLinkRow[] } = {
  headerAccent: "",
  heroTitle: "",
  heroBadgeCod: "",
  heroBadgeRegion: "",
  heroLeadParagraph: "",
  aboutPrimaryImage: "",
  aboutPrimaryImageMobile: "",
  aboutSeparateMobileImage: false,
  aboutSecondaryImage: "",
  contactPrimaryImage: "",
  contactSecondaryImage: "",
  testimonials: [],
  testimonialsLead:
    "COD orders with phone confirmation — shoppers tell us when specs, delivery, and pricing line up. Quotes below are sample stories you can replace with live feedback.",
  socialLinks: [
    { label: "Facebook", url: "https://facebook.com/", platform: "facebook" },
    { label: "LinkedIn", url: "https://linkedin.com/", platform: "linkedin" },
    { label: "Instagram", url: "https://instagram.com/", platform: "instagram" },
    { label: "TikTok", url: "https://www.tiktok.com/", platform: "tiktok" },
  ],
  bankName: "Bank transfer (manual verification)",
  bankIban: "Add your IBAN in Admin → Site & payments",
  bankAccountTitle: "Al Makkah Electric Traders",
  jazzcashNumber: "03XX XXXXXXX",
  jazzcashTitle: "Business JazzCash wallet",
  supportDeskHours: "08:00–20:00 PKT · Mon–Sat",
  supportEscalations: "Supervisor loop via WhatsApp label “URGENT DELIVERY ISSUE”",
  supportCommitmentsIntro:
    "Replace this block with your legal-approved SLA copy. For now it demonstrates how promise-driven messaging pairs with contact routes.",
  homeStatsTitle: "Trusted home appliances & electrical accessories — with transparent pricing.",
  homeStatsLead:
    "Cash on delivery, phone confirmation, and nationwide dispatch. These figures are placeholders — swap to real business stats anytime.",
  browseCategoriesTitle: "Browse categories",
  browseCategoriesLead: "Quick links to the same categories in the navbar dropdown.",
  featuredSectionTitle: "Featured picks",
  featuredSectionLead:
    "Hot-selling highlights chosen by admin — four across on extra-wide screens; step through one SKU at a time.",
  gadgetsSectionTitle: "Gadget section",
  gadgetsSectionLead: "More popular items — same layout as Featured picks.",
  testimonialsEyebrow: "Reviews",
  testimonialsHeading: "What customers say",
  reviewsRatingNote: "Illustrative rating · swap for real Google / Trustpilot embed when ready.",
  reviewsRatingScore: "5.0",
  faqEyebrow: "FAQs",
  faqHeading: "Frequently asked questions",
  faqLead: "Quick answers about delivery, authenticity, wholesale, and support.",
  faqContactLabel: "Contact us →",
  faqContactHref: "/contact",
  brandsSectionEyebrow: "Brands",
  brandsSectionTitle: "Brands we carry",
  brandsSectionLead:
    "Popular appliance and electrical brands stocked for everyday homes — fans, lighting, wiring, and kitchen helpers.",
  brandLogos: [
    { name: "Philips" },
    { name: "Orient" },
    { name: "GFC Fans" },
    { name: "Pak Fan" },
    { name: "Super Asia" },
    { name: "Haier" },
    { name: "Kennwood" },
    { name: "Westpoint" },
  ],
  faqs: [
    {
      q: "Do you offer delivery services?",
      a: "Yes — we offer fast and reliable delivery within our service area. Delivery options and charges may vary depending on your location and order size.",
    },
    {
      q: "Are your products original and guaranteed?",
      a: "Absolutely. We deal only in genuine and trusted brands, ensuring quality, durability, and performance. Many products also come with manufacturer warranties.",
    },
    {
      q: "Can I place bulk or wholesale orders?",
      a: "Yes — we handle both retail and wholesale supply. For bulk orders, contact us directly to get the best pricing and customized deals.",
    },
    {
      q: "How can I contact you for inquiries or support?",
      a: "You can reach us via phone, WhatsApp, or email. Visit our Contact Us page for full details, and our team will assist you promptly.",
    },
    {
      q: "Do you confirm orders before dispatch?",
      a: "Yes — we confirm orders by phone or WhatsApp before dispatch to ensure the right variant, specs, and delivery details.",
    },
  ],
  aboutPageTitle: "Home appliances & electrical accessories for everyday Pakistan households",
  aboutPageLead:
    "Al Makkah Electric Traders is built for fans, LED lighting, heaters, coolers, kitchen helpers, grooming tools, and power accessories — organized by category with variant‑level specs and COD checkout. Every listing should spell out wattage, finishes, and what's in the box before you order.",
  aboutChips: ["Genuine brands", "COD with confirmation", "Nationwide dispatch", "Specs per variant"],
  aboutEyebrow: "About Al Makkah Electric Traders",
  aboutCtaPrimaryLabel: "Browse catalog",
  aboutCtaPrimaryHref: "/products",
  aboutCtaSecondaryLabel: "Contact sales",
  aboutCtaSecondaryHref: "/contact",
  aboutBannerHeightPx: 420,
  aboutBannerHeightMobilePx: 300,
  aboutValues: [
    {
      title: "Genuine products",
      body: "Brand-backed SKUs with documented specs—ideal when warranties or voltage compatibility matter.",
    },
    {
      title: "COD-first",
      body: "Cash on delivery with human confirmation before goods leave the warehouse.",
    },
    {
      title: "Fast support",
      body: "Guidance on watt limits, plug types, cooler pads, clipper guards, and accessory pairing.",
    },
  ],
  aboutHowTitle: "How we work with shoppers",
  aboutHowLead:
    "Whether you are furnishing a new flat or restocking a shop shelf, the flow stays simple: shortlist online → confirm specs → receive picking confirmation → pay on delivery.",
  aboutHowBadge: "Straightforward onboarding",
  aboutHowBlocks: [],
  aboutHowSteps: [
    {
      step: "01",
      title: "Share your shopping list",
      body: "Tell us models, colours, wattages, or bundle counts—we mirror that structure in your cart summary.",
    },
    {
      step: "02",
      title: "Validate variants",
      body: "Voltage, plug style, remote inclusion, and jug materials are double-checked before dispatch paperwork prints.",
    },
    {
      step: "03",
      title: "COD handoff",
      body: "Courier-ready packs labeled clearly so drivers know when an item needs upright orientation or extra padding.",
    },
  ],
  aboutTeamEyebrow: "The people behind the business",
  aboutTeamTitle: "Meet Our Leadership",
  aboutTeamLead:
    "Our journey is shaped by the people who believe in honest relationships, dependable products, and long-term growth.",
  aboutTeamCtaLabel: "Talk to us",
  aboutTeamCtaHref: "/contact",
  aboutTeam: [
    {
      name: "Asad",
      role: "Owner & procurement",
      note: "Guiding the business with a focus on customer trust and lasting partnerships.",
      initials: "AS",
    },
    {
      name: "Hassan",
      role: "Sales & WhatsApp support",
      note: "Helping strengthen our product range, service, and distribution network.",
      initials: "HA",
    },
    {
      name: "Amina",
      role: "Dispatch & packing",
      note: "Keeping orders labeled, packed, and ready so deliveries stay dependable.",
      initials: "AK",
    },
    {
      name: "Bilal",
      role: "Catalog & listings",
      note: "Building clear product pages so shoppers can compare specs before they order.",
      initials: "BM",
    },
  ],
  aboutStoryEyebrow: "Our story",
  aboutStoryTitle: "From the shop floor to your doorstep",
  aboutStoryLead:
    "Al Makkah Electric Traders grew from serving nearby households to stocking fans, lighting, wiring, and kitchen helpers with clear specs and COD confirmation.",
  aboutStoryBlocks: [
    {
      title: "What we stand for",
      body: "Genuine products, honest stock checks, and phone confirmation before dispatch — so the right variant reaches you.",
    },
    {
      title: "How we serve",
      body: "Walk-in support at the shop, WhatsApp quotes for bulk lists, and nationwide dispatch for COD orders across Pakistan.",
    },
  ],
  contactPageTitle: "Call, WhatsApp, or visit us",
  contactPageLead: "Quotes, stock checks, and COD confirmation — we reply during desk hours.",
  contactEmail: "almakkahelectrictraders@gmail.com",
  contactChannel1Label: "Sales desk",
  contactChannel1Display: "0335‑744‑6353",
  contactChannel1Tel: "+923357446353",
  contactChannel1Wa: "https://wa.me/923357446353",
  contactChannel1Notes: "Quotes & stock checks",
  contactChannel2Label: "Dispatch / COD",
  contactChannel2Display: "0326‑715‑3153",
  contactChannel2Tel: "+923267153153",
  contactChannel2Wa: "https://wa.me/923267153153",
  contactChannel2Notes: "Orders & courier updates",
  storeLocationName: "Al Makkah Electric Traders",
  storeLat: 31.0658769,
  storeLng: 72.9439501,
  googlePlaceFeatureRef: "0x3922f15e62348bcf:0xd4712bb9e23c818e",
  googleMapsPlaceUrl:
    "https://www.google.com/maps/place/Al+Makkah+Electric+Traders/@31.0658769,72.9439501,17z/data=!3m1!4b1!4m6!3m5!1s0x3922f15e62348bcf:0xd4712bb9e23c818e!8m2!3d31.0658769!4d72.9439501!16s%2Fg%2F11ynf8lkz5",
  heroEnabled: true,
  heroHeightPx: 420,
  heroHeightMobilePx: 260,
  heroVisibleOnMobile: true,
};

export type ResolvedStorefront = typeof DEFAULT_STOREFRONT;

function normalizeTestimonials(raw: unknown): StorefrontTestimonial[] {
  if (!Array.isArray(raw)) return [];
  const out: StorefrontTestimonial[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const quote = String(o.quote ?? "").trim();
    const name = String(o.name ?? "").trim();
    const meta = String(o.meta ?? "").trim();
    let initials = String(o.initials ?? "").trim();
    if (!initials && name) initials = name.split(/\s/).map((x) => x[0]).join("").slice(0, 4).toUpperCase();
    if (quote.length < 4 || name.length < 2 || meta.length < 2 || !initials) continue;
    out.push({ quote, name, meta, initials: initials.slice(0, 4) });
    if (out.length >= 24) break;
  }
  return out;
}

function normalizeFaqs(raw: unknown): StorefrontFaqItem[] {
  if (!Array.isArray(raw)) return DEFAULT_STOREFRONT.faqs ?? [];
  const out: StorefrontFaqItem[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const q = String(o.q ?? "").trim();
    const a = String(o.a ?? "").trim();
    if (q.length < 3 || a.length < 3) continue;
    out.push({ q, a });
    if (out.length >= 16) break;
  }
  return out.length ? out : (DEFAULT_STOREFRONT.faqs ?? []);
}

function normalizeBrandLogos(raw: unknown): StorefrontBrandLogo[] {
  if (!Array.isArray(raw)) return DEFAULT_STOREFRONT.brandLogos ?? [];
  const out: StorefrontBrandLogo[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const name = String(o.name ?? "").trim();
    if (name.length < 2) continue;
    const imageUrl = String(o.imageUrl ?? o.image_url ?? "").trim();
    out.push(imageUrl ? { name, imageUrl } : { name });
    if (out.length >= 24) break;
  }
  return out.length ? out : (DEFAULT_STOREFRONT.brandLogos ?? []);
}

function normalizeAboutValues(raw: unknown): AboutValueCard[] {
  const fallback = DEFAULT_STOREFRONT.aboutValues ?? [];
  if (!Array.isArray(raw)) return fallback;
  const out: AboutValueCard[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const title = String(o.title ?? "").trim();
    const body = String(o.body ?? "").trim();
    if (!title || !body) continue;
    out.push({ title, body });
    if (out.length >= 6) break;
  }
  return out.length ? out : fallback;
}

function normalizeAboutHowSteps(raw: unknown): AboutWorkStep[] {
  const fallback = DEFAULT_STOREFRONT.aboutHowSteps ?? [];
  if (!Array.isArray(raw)) return fallback;
  const out: AboutWorkStep[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const step = String(o.step ?? "").trim();
    const title = String(o.title ?? "").trim();
    const body = String(o.body ?? "").trim();
    if (!step || !title || !body) continue;
    out.push({ step, title, body });
    if (out.length >= 6) break;
  }
  return out.length ? out : fallback;
}

function normalizeAboutTeam(raw: unknown): AboutTeamMember[] {
  const fallback = DEFAULT_STOREFRONT.aboutTeam ?? [];
  if (!Array.isArray(raw)) return fallback;
  const out: AboutTeamMember[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const name = String(o.name ?? "").trim();
    const role = String(o.role ?? "").trim();
    const note = String(o.note ?? "").trim();
    let initials = String(o.initials ?? "").trim();
    if (!initials && name) initials = name.split(/\s/).map((x) => x[0]).join("").slice(0, 4).toUpperCase();
    if (!name || !role || !note || !initials) continue;
    const imageUrl = String(o.imageUrl ?? o.image_url ?? "").trim();
    out.push({
      name,
      role,
      note,
      initials: initials.slice(0, 4),
      ...(imageUrl ? { imageUrl } : {}),
    });
    if (out.length >= 8) break;
  }
  return out.length ? out : fallback;
}

function normalizeAboutStoryBlocks(raw: unknown): AboutStoryBlock[] {
  if (!Array.isArray(raw)) return DEFAULT_STOREFRONT.aboutStoryBlocks ?? [];
  const out: AboutStoryBlock[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const title = String(o.title ?? "").trim();
    const body = String(o.body ?? "").trim();
    if (!title || !body) continue;
    out.push({ title, body });
    if (out.length >= 12) break;
  }
  return out.length ? out : (DEFAULT_STOREFRONT.aboutStoryBlocks ?? []);
}

/** Empty array is valid (no extra blocks) — do not force defaults. */
function normalizeAboutHowBlocks(raw: unknown): AboutStoryBlock[] {
  if (!Array.isArray(raw)) return DEFAULT_STOREFRONT.aboutHowBlocks ?? [];
  const out: AboutStoryBlock[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    const title = String(o.title ?? "").trim();
    const body = String(o.body ?? "").trim();
    if (!body) continue;
    out.push({ title, body });
    if (out.length >= 12) break;
  }
  return out;
}

export async function getStorefrontPayload(): Promise<ResolvedStorefront> {
  // Always read live admin edits — never serve a build-time / cached snapshot.
  noStore();
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("storefront_settings").select("data").eq("id", 1).maybeSingle();
    if (error || !data?.data) return DEFAULT_STOREFRONT;
    const patch = (data.data as StorefrontPayload) ?? {};
    const social =
      Array.isArray(patch.socialLinks) && patch.socialLinks.filter((l) => l.label && l.url).length
        ? patch.socialLinks!.filter((l) => l.label && l.url)
        : DEFAULT_STOREFRONT.socialLinks;
    const testimonials = normalizeTestimonials(patch.testimonials);
    const defaultChips = DEFAULT_STOREFRONT.aboutChips ?? [];
    const aboutChips = Array.isArray(patch.aboutChips)
      ? patch.aboutChips.map((c) => String(c).trim()).filter(Boolean).slice(0, 12)
      : defaultChips;
    const parseBannerH = (raw: unknown, fallback: number, min: number, max: number): number => {
      const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
      if (!Number.isFinite(n)) return fallback;
      return Math.min(max, Math.max(min, Math.round(n)));
    };
    const aboutBannerHeightPx = parseBannerH(
      patch.aboutBannerHeightPx,
      DEFAULT_STOREFRONT.aboutBannerHeightPx ?? 420,
      280,
      720,
    );
    const aboutBannerHeightMobilePx = parseBannerH(
      patch.aboutBannerHeightMobilePx,
      DEFAULT_STOREFRONT.aboutBannerHeightMobilePx ?? 300,
      200,
      720,
    );
    const heroHeightPx =
      typeof patch.heroHeightPx === "number" && Number.isFinite(patch.heroHeightPx)
        ? Math.min(720, Math.max(200, Math.round(patch.heroHeightPx)))
        : DEFAULT_STOREFRONT.heroHeightPx;
    const heroHeightMobilePx =
      typeof patch.heroHeightMobilePx === "number" && Number.isFinite(patch.heroHeightMobilePx)
        ? Math.min(720, Math.max(160, Math.round(patch.heroHeightMobilePx)))
        : DEFAULT_STOREFRONT.heroHeightMobilePx;
    /** Empty admin saves must not wipe built-in homepage copy. */
    const text = (key: keyof StorefrontPayload, fallback: string | undefined) => {
      const v = patch[key];
      if (typeof v === "string" && v.trim()) return v.trim();
      return fallback ?? "";
    };

    return {
      ...DEFAULT_STOREFRONT,
      ...patch,
      socialLinks: social,
      testimonials,
      aboutChips: aboutChips.length ? aboutChips : defaultChips,
      aboutBannerHeightPx,
      aboutBannerHeightMobilePx,
      heroHeightPx,
      heroHeightMobilePx,
      aboutValues: normalizeAboutValues(patch.aboutValues),
      aboutHowSteps: normalizeAboutHowSteps(patch.aboutHowSteps),
      aboutHowBlocks: normalizeAboutHowBlocks(patch.aboutHowBlocks),
      aboutTeam: normalizeAboutTeam(patch.aboutTeam),
      aboutStoryBlocks: normalizeAboutStoryBlocks(patch.aboutStoryBlocks),
      faqs: normalizeFaqs(patch.faqs),
      brandLogos: normalizeBrandLogos(patch.brandLogos),
      homeStatsTitle: text("homeStatsTitle", DEFAULT_STOREFRONT.homeStatsTitle),
      brandsSectionEyebrow: text("brandsSectionEyebrow", DEFAULT_STOREFRONT.brandsSectionEyebrow),
      brandsSectionTitle: text("brandsSectionTitle", DEFAULT_STOREFRONT.brandsSectionTitle),
      brandsSectionLead: text("brandsSectionLead", DEFAULT_STOREFRONT.brandsSectionLead),
      aboutStoryEyebrow: text("aboutStoryEyebrow", DEFAULT_STOREFRONT.aboutStoryEyebrow),
      aboutStoryTitle: text("aboutStoryTitle", DEFAULT_STOREFRONT.aboutStoryTitle),
      aboutStoryLead: text("aboutStoryLead", DEFAULT_STOREFRONT.aboutStoryLead),
      homeStatsLead: text("homeStatsLead", DEFAULT_STOREFRONT.homeStatsLead),
      browseCategoriesTitle: text("browseCategoriesTitle", DEFAULT_STOREFRONT.browseCategoriesTitle),
      browseCategoriesLead: text("browseCategoriesLead", DEFAULT_STOREFRONT.browseCategoriesLead),
      featuredSectionTitle: text("featuredSectionTitle", DEFAULT_STOREFRONT.featuredSectionTitle),
      featuredSectionLead: text("featuredSectionLead", DEFAULT_STOREFRONT.featuredSectionLead),
      gadgetsSectionTitle: text("gadgetsSectionTitle", DEFAULT_STOREFRONT.gadgetsSectionTitle),
      gadgetsSectionLead: text("gadgetsSectionLead", DEFAULT_STOREFRONT.gadgetsSectionLead),
      testimonialsEyebrow: text("testimonialsEyebrow", DEFAULT_STOREFRONT.testimonialsEyebrow),
      testimonialsHeading: text("testimonialsHeading", DEFAULT_STOREFRONT.testimonialsHeading),
      testimonialsLead: text("testimonialsLead", DEFAULT_STOREFRONT.testimonialsLead),
      reviewsRatingNote: text("reviewsRatingNote", DEFAULT_STOREFRONT.reviewsRatingNote),
      reviewsRatingScore: text("reviewsRatingScore", DEFAULT_STOREFRONT.reviewsRatingScore),
      faqEyebrow: text("faqEyebrow", DEFAULT_STOREFRONT.faqEyebrow),
      faqHeading: text("faqHeading", DEFAULT_STOREFRONT.faqHeading),
      faqLead: text("faqLead", DEFAULT_STOREFRONT.faqLead),
      faqContactLabel: text("faqContactLabel", DEFAULT_STOREFRONT.faqContactLabel),
      faqContactHref: text("faqContactHref", DEFAULT_STOREFRONT.faqContactHref),
      aboutEyebrow: text("aboutEyebrow", DEFAULT_STOREFRONT.aboutEyebrow),
      aboutPageTitle: text("aboutPageTitle", DEFAULT_STOREFRONT.aboutPageTitle),
      aboutPageLead: text("aboutPageLead", DEFAULT_STOREFRONT.aboutPageLead),
      aboutCtaPrimaryLabel: text("aboutCtaPrimaryLabel", DEFAULT_STOREFRONT.aboutCtaPrimaryLabel),
      aboutCtaPrimaryHref: text("aboutCtaPrimaryHref", DEFAULT_STOREFRONT.aboutCtaPrimaryHref),
      aboutCtaSecondaryLabel: text("aboutCtaSecondaryLabel", DEFAULT_STOREFRONT.aboutCtaSecondaryLabel),
      aboutCtaSecondaryHref: text("aboutCtaSecondaryHref", DEFAULT_STOREFRONT.aboutCtaSecondaryHref),
      aboutHowTitle: text("aboutHowTitle", DEFAULT_STOREFRONT.aboutHowTitle),
      aboutHowLead: text("aboutHowLead", DEFAULT_STOREFRONT.aboutHowLead),
      aboutHowBadge: text("aboutHowBadge", DEFAULT_STOREFRONT.aboutHowBadge),
      aboutTeamEyebrow: text("aboutTeamEyebrow", DEFAULT_STOREFRONT.aboutTeamEyebrow),
      aboutTeamTitle: text("aboutTeamTitle", DEFAULT_STOREFRONT.aboutTeamTitle),
      aboutTeamLead: text("aboutTeamLead", DEFAULT_STOREFRONT.aboutTeamLead),
      aboutTeamCtaLabel: text("aboutTeamCtaLabel", DEFAULT_STOREFRONT.aboutTeamCtaLabel),
      aboutTeamCtaHref: text("aboutTeamCtaHref", DEFAULT_STOREFRONT.aboutTeamCtaHref),
    };
  } catch {
    return DEFAULT_STOREFRONT;
  }
}