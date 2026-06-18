import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SocialLinkRow = { label: string; url: string; platform?: string };

export type StorefrontTestimonial = {
  quote: string;
  name: string;
  meta: string;
  initials: string;
};

export type StorefrontPayload = {
  socialLinks?: SocialLinkRow[];
  testimonialsLead?: string;
  headerAccent?: string;
  heroTitle?: string;
  heroBadgeCod?: string;
  heroBadgeRegion?: string;
  heroLeadParagraph?: string;
  aboutPrimaryImage?: string;
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
  aboutPageTitle?: string;
  aboutPageLead?: string;
  aboutChips?: string[];
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
};

export const DEFAULT_STOREFRONT: StorefrontPayload & { socialLinks: SocialLinkRow[] } = {
  headerAccent: "",
  heroTitle: "",
  heroBadgeCod: "",
  heroBadgeRegion: "",
  heroLeadParagraph: "",
  aboutPrimaryImage: "",
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
    { label: "X (Twitter)", url: "https://x.com/", platform: "x" },
    { label: "Pinterest", url: "https://pinterest.com/", platform: "pinterest" },
    { label: "YouTube", url: "https://youtube.com/", platform: "youtube" },
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
  aboutPageTitle: "Home appliances & electrical accessories for everyday Pakistan households",
  aboutPageLead:
    "Al Makkah Electric Traders is built for fans, LED lighting, heaters, coolers, kitchen helpers, grooming tools, and power accessories — organized by category with variant‑level specs and COD checkout. Every listing should spell out wattage, finishes, and what's in the box before you order.",
  aboutChips: ["Genuine brands", "COD with confirmation", "Nationwide dispatch", "Specs per variant"],
  contactPageTitle: "We coordinate COD packs like procurement teammates",
  contactPageLead:
    "Reach out for live pricing, seasonal bundles, or to sanity-check SKUs before big buys. Share lists or photos via WhatsApp—nothing ships until both sides confirm the order.",
  contactEmail: "almakkahelectrictraders@gmail.com",
  contactChannel1Label: "Sales desk · Lahore",
  contactChannel1Display: "0335‑744‑6353",
  contactChannel1Tel: "+923357446353",
  contactChannel1Wa: "https://wa.me/923357446353",
  contactChannel1Notes:
    "Quickest channel for quotes, fan finishes, cooler availability, and wattage checks.",
  contactChannel2Label: "Dispatch & COD confirmations",
  contactChannel2Display: "0326‑715‑3153",
  contactChannel2Tel: "+923267153153",
  contactChannel2Wa: "https://wa.me/923267153153",
  contactChannel2Notes: "Share airway bills, reschedule courier drops, or update quantities mid-flight.",
  storeLocationName: "Al Makkah Electric Traders",
  storeLat: 31.0658769,
  storeLng: 72.9439501,
  googlePlaceFeatureRef: "0x3922f15e62348bcf:0xd4712bb9e23c818e",
  googleMapsPlaceUrl:
    "https://www.google.com/maps/place/Al+Makkah+Electric+Traders/@31.0658769,72.9439501,17z/data=!3m1!4b1!4m6!3m5!1s0x3922f15e62348bcf:0xd4712bb9e23c818e!8m2!3d31.0658769!4d72.9439501!16s%2Fg%2F11ynf8lkz5",
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

export async function getStorefrontPayload(): Promise<ResolvedStorefront> {
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
    return {
      ...DEFAULT_STOREFRONT,
      ...patch,
      socialLinks: social,
      testimonials,
      aboutChips: aboutChips.length ? aboutChips : DEFAULT_STOREFRONT.aboutChips,
    };
  } catch {
    return DEFAULT_STOREFRONT;
  }
}