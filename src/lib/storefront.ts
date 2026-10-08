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
export type AboutTeamMember = { name: string; role: string; note: string; initials: string };

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
  aboutPageTitle?: string;
  aboutPageLead?: string;
  aboutChips?: string[];
  /** Small label above the about banner title. */
  aboutEyebrow?: string;
  aboutCtaPrimaryLabel?: string;
  aboutCtaPrimaryHref?: string;
  aboutCtaSecondaryLabel?: string;
  aboutCtaSecondaryHref?: string;
  /** About promo banner height in px (laptop / big screens). */
  aboutBannerHeightPx?: number;
  /** About promo banner height in px (phones). */
  aboutBannerHeightMobilePx?: number;
  aboutValues?: AboutValueCard[];
  aboutHowTitle?: string;
  aboutHowLead?: string;
  aboutHowBadge?: string;
  aboutHowSteps?: AboutWorkStep[];
  aboutTeamEyebrow?: string;
  aboutTeamTitle?: string;
  aboutTeamLead?: string;
  aboutTeamCtaLabel?: string;
  aboutTeam?: AboutTeamMember[];
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
    "Cash on delivery orders with phone confirmation — swap these lines for live Google or Trustpilot reviews when ready.",
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
  featuredSectionTitle: "Featured picks",
  featuredSectionLead:
    "Hot-selling highlights chosen by admin — four across on extra-wide screens; step through one SKU at a time.",
  gadgetsSectionTitle: "Gadget section",
  gadgetsSectionLead: "More popular items — same layout as Featured picks.",
  testimonialsEyebrow: "Reviews",
  testimonialsHeading: "What customers say",
  reviewsRatingNote: "Illustrative rating · swap for real Google / Trustpilot embed when ready.",
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
  aboutTeamEyebrow: "Team",
  aboutTeamTitle: "Meet our team",
  aboutTeamLead:
    "The people behind product sourcing, variant checks, and COD confirmation. Replace names/roles with your real staff anytime.",
  aboutTeamCtaLabel: "Talk to us",
  aboutTeam: [
    { name: "Asad", role: "Owner & procurement", note: "Sourcing, pricing, vendor coordination.", initials: "AS" },
    { name: "Hassan", role: "Sales & WhatsApp support", note: "Spec checks, COD confirmation.", initials: "HA" },
    { name: "Amina", role: "Dispatch & packing", note: "Variant labeling, fragile handling.", initials: "AK" },
    { name: "Bilal", role: "Catalog & listings", note: "Photos, attributes, SKU hygiene.", initials: "BM" },
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

function normalizeAboutValues(raw: unknown): AboutValueCard[] {
  if (!Array.isArray(raw)) return DEFAULT_STOREFRONT.aboutValues;
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
  return out.length ? out : DEFAULT_STOREFRONT.aboutValues;
}

function normalizeAboutHowSteps(raw: unknown): AboutWorkStep[] {
  if (!Array.isArray(raw)) return DEFAULT_STOREFRONT.aboutHowSteps;
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
  return out.length ? out : DEFAULT_STOREFRONT.aboutHowSteps;
}

function normalizeAboutTeam(raw: unknown): AboutTeamMember[] {
  if (!Array.isArray(raw)) return DEFAULT_STOREFRONT.aboutTeam;
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
    out.push({ name, role, note, initials: initials.slice(0, 4) });
    if (out.length >= 8) break;
  }
  return out.length ? out : DEFAULT_STOREFRONT.aboutTeam;
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
    const aboutChips = Array.isArray(patch.aboutChips)
      ? patch.aboutChips.map((c) => String(c).trim()).filter(Boolean).slice(0, 12)
      : DEFAULT_STOREFRONT.aboutChips;
    const aboutBannerHeightPx =
      typeof patch.aboutBannerHeightPx === "number" && Number.isFinite(patch.aboutBannerHeightPx)
        ? Math.min(720, Math.max(280, Math.round(patch.aboutBannerHeightPx)))
        : DEFAULT_STOREFRONT.aboutBannerHeightPx;
    const aboutBannerHeightMobilePx =
      typeof patch.aboutBannerHeightMobilePx === "number" && Number.isFinite(patch.aboutBannerHeightMobilePx)
        ? Math.min(720, Math.max(200, Math.round(patch.aboutBannerHeightMobilePx)))
        : DEFAULT_STOREFRONT.aboutBannerHeightMobilePx;
    const heroHeightPx =
      typeof patch.heroHeightPx === "number" && Number.isFinite(patch.heroHeightPx)
        ? Math.min(720, Math.max(200, Math.round(patch.heroHeightPx)))
        : DEFAULT_STOREFRONT.heroHeightPx;
    const heroHeightMobilePx =
      typeof patch.heroHeightMobilePx === "number" && Number.isFinite(patch.heroHeightMobilePx)
        ? Math.min(720, Math.max(160, Math.round(patch.heroHeightMobilePx)))
        : DEFAULT_STOREFRONT.heroHeightMobilePx;
    return {
      ...DEFAULT_STOREFRONT,
      ...patch,
      socialLinks: social,
      testimonials,
      aboutChips: aboutChips.length ? aboutChips : DEFAULT_STOREFRONT.aboutChips,
      aboutBannerHeightPx,
      aboutBannerHeightMobilePx,
      heroHeightPx,
      heroHeightMobilePx,
      aboutValues: normalizeAboutValues(patch.aboutValues),
      aboutHowSteps: normalizeAboutHowSteps(patch.aboutHowSteps),
      aboutTeam: normalizeAboutTeam(patch.aboutTeam),
    };
  } catch {
    return DEFAULT_STOREFRONT;
  }
}