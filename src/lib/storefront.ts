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
    return {
      ...DEFAULT_STOREFRONT,
      ...patch,
      socialLinks: social,
      testimonials,
    };
  } catch {
    return DEFAULT_STOREFRONT;
  }
}