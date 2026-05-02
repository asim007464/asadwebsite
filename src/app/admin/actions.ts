"use server";

import { redirect } from "next/navigation";
import {
  adminUserAllowed,
  assertAdminAuthenticated,
  assertAdminOwner,
  clearLegacyAdminCookie,
  getAdminOwnerEmail,
  isOwnerEmail,
  normAdminEmail,
} from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPathRaw = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    redirect(`/admin/login?error=auth&next=${encodeURIComponent(nextPathRaw)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/admin/login?error=auth&next=${encodeURIComponent(nextPathRaw)}`);
  }

  if (!adminUserAllowed(data.user)) {
    await supabase.auth.signOut();
    await clearLegacyAdminCookie();
    redirect(`/admin/login?error=forbidden&next=${encodeURIComponent(nextPathRaw)}`);
  }

  await clearLegacyAdminCookie();

  const safeNext = nextPathRaw.startsWith("/admin") ? nextPathRaw : "/admin";
  redirect(safeNext);
}

export async function adminLogout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  await clearLegacyAdminCookie();
  redirect("/admin/login");
}

export async function promoteAdminStaff(formData: FormData) {
  await assertAdminOwner();

  const raw = String(formData.get("email") ?? "");
  const email = normAdminEmail(raw);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/admin/team?error=invalid-email");
  }

  const owner = getAdminOwnerEmail();
  if (email === owner) {
    redirect("/admin/team?notice=owner-already");
  }

  const admin = createSupabaseAdminClient();
  const { data: uid, error: rpcErr } = await admin.rpc("lookup_auth_user_id", { email_input: email });
  if (rpcErr || !uid) {
    redirect("/admin/team?error=no-account");
  }

  const uidStr = String(uid);
  const { data: got, error: getErr } = await admin.auth.admin.getUserById(uidStr);
  if (getErr || !got.user) {
    redirect("/admin/team?error=no-account");
  }

  const meta = { ...(got.user.app_metadata ?? {}), admin_panel: true };
  const { error: upErr } = await admin.auth.admin.updateUserById(uidStr, { app_metadata: meta });
  if (upErr) {
    redirect(`/admin/team?error=${encodeURIComponent(upErr.message)}`);
  }
  redirect("/admin/team?notice=promoted");
}

export async function demoteAdminStaff(formData: FormData) {
  await assertAdminOwner();

  const raw = String(formData.get("email") ?? "");
  const email = normAdminEmail(raw);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/admin/team?error=invalid-email");
  }

  if (isOwnerEmail(email)) {
    redirect("/admin/team?error=cannot-demote-owner");
  }

  const admin = createSupabaseAdminClient();
  const { data: uid, error: rpcErr } = await admin.rpc("lookup_auth_user_id", { email_input: email });
  if (rpcErr || !uid) {
    redirect("/admin/team?error=no-account");
  }

  const uidStr = String(uid);
  const { data: got, error: getErr } = await admin.auth.admin.getUserById(uidStr);
  if (getErr || !got.user) {
    redirect("/admin/team?error=no-account");
  }

  const meta: Record<string, unknown> = { ...(got.user.app_metadata ?? {}) };
  delete meta.admin_panel;
  const { error: upErr } = await admin.auth.admin.updateUserById(uidStr, { app_metadata: meta });
  if (upErr) {
    redirect(`/admin/team?error=${encodeURIComponent(upErr.message)}`);
  }
  redirect("/admin/team?notice=demoted");
}

export async function createCategory(formData: FormData) {
  await assertAdminAuthenticated();
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  if (name.length < 2) redirect("/admin/categories?error=name");

  const slug =
    slugInput ||
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("categories").insert({ name, slug });
  if (error) redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/categories");
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/categories");
}

export async function updateOrderStatus(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = new Set(["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"]);
  if (!id || !allowed.has(status)) redirect("/admin/orders");

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) redirect(`/admin/orders?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/orders");
}

function normalizeHeroImageUrl(raw: string) {
  const u = raw.trim();
  if (!/^https:\/\//i.test(u)) return null;
  return u;
}

export async function createHeroSlide(formData: FormData) {
  await assertAdminAuthenticated();
  const url = normalizeHeroImageUrl(String(formData.get("url") ?? ""));
  const alt = String(formData.get("alt") ?? "").trim();
  const sortRaw = Number(formData.get("sort_order") ?? 0);
  const sort_order = Number.isFinite(sortRaw) ? Math.floor(sortRaw) : 0;
  if (!url) redirect("/admin/hero?error=invalid-url");

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("hero_slides").insert({
    url,
    alt,
    sort_order,
    is_active: true,
  });
  if (error) redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/hero");
}

export async function updateHeroSlide(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "");
  const urlRaw = String(formData.get("url") ?? "").trim();
  const url = normalizeHeroImageUrl(urlRaw);
  const alt = String(formData.get("alt") ?? "").trim();
  const sortRaw = Number(formData.get("sort_order") ?? 0);
  const sort_order = Number.isFinite(sortRaw) ? Math.floor(sortRaw) : 0;
  const is_active = formData.get("is_active") === "on";
  if (!id || !url) redirect("/admin/hero?error=invalid-url");

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("hero_slides").update({ url, alt, sort_order, is_active }).eq("id", id);
  if (error) redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/hero");
}

export async function deleteHeroSlide(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/hero");
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/hero");
}

/** Empty string or valid https URL; `null` if non-empty but not https. */
function normalizeOptionalHttpsBackground(raw: string) {
  const u = raw.trim();
  if (!u) return "";
  return /^https:\/\//i.test(u) ? u : null;
}

function normalizeReviewsBannerHref(raw: string) {
  const t = raw.trim();
  if (!t) return "/products";
  if (t.startsWith("/") && !t.startsWith("//")) return t.split(/\s/)[0] ?? "/products";
  if (/^https:\/\//i.test(t)) return t;
  return null;
}

export async function updateHomeReviewsBanner(formData: FormData) {
  await assertAdminAuthenticated();
  const heading = String(formData.get("heading") ?? "").trim();
  const paragraph = String(formData.get("paragraph") ?? "").trim();
  const button_label = String(formData.get("button_label") ?? "").trim();
  const button_hrefRaw = String(formData.get("button_href") ?? "").trim();

  const bg = String(formData.get("background_image_url") ?? "").trim();
  const backgroundNormalized = normalizeOptionalHttpsBackground(bg);
  if (backgroundNormalized === null) redirect("/admin/reviews-banner?error=invalid-bg-url");

  const button_href = normalizeReviewsBannerHref(button_hrefRaw);
  if (button_href === null) redirect("/admin/reviews-banner?error=invalid-button-href");

  const background_image_url = backgroundNormalized;
  const is_active = formData.get("is_active") === "on";

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("home_reviews_banner")
    .upsert(
      {
        id: 1,
        background_image_url,
        heading,
        paragraph,
        button_label,
        button_href,
        is_active,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (error) redirect(`/admin/reviews-banner?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/reviews-banner");
}

export async function updateProductFeatured(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/featured");

  const is_featured = formData.get("is_featured") === "on";
  const sortRaw = Number(formData.get("featured_sort_order") ?? 0);
  const featured_sort_order = Number.isFinite(sortRaw) ? Math.floor(sortRaw) : 0;

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").update({ is_featured, featured_sort_order }).eq("id", id);
  if (error) redirect(`/admin/featured?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/featured");
}

function normalizeHttpsOrSlashImage(raw: string) {
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("/")) return t;
  return /^https:\/\//i.test(t) ? t : null;
}

function isStorefrontSocialLink(v: unknown): v is { label: string; url: string; platform?: string } {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  const label = String(o.label ?? "").trim();
  const url = String(o.url ?? "").trim();
  return label.length > 0 && /^https:\/\//i.test(url);
}

function isStorefrontTestimonial(v: unknown): v is { quote: string; name: string; meta: string; initials: string } {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  const quote = String(o.quote ?? "").trim();
  const name = String(o.name ?? "").trim();
  const meta = String(o.meta ?? "").trim();
  const initials =
    typeof o.initials === "string" && o.initials.trim().length
      ? o.initials.trim().slice(0, 4).toUpperCase()
      : name
          ? name
              .split(/\s/)
              .map((x) => x[0])
              .join("")
              .slice(0, 4)
              .toUpperCase()
          : "?";
  return quote.length >= 4 && name.length >= 2 && meta.length >= 2 && initials.length > 0;
}

export async function mergeStorefrontSettings(formData: FormData) {
  await assertAdminAuthenticated();
  function pick(key: string) {
    return String(formData.get(key) ?? "").trim();
  }

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase.from("storefront_settings").select("data").eq("id", 1).maybeSingle();
  const base = ((existing?.data as Record<string, unknown> | null) ?? {}) as Record<string, unknown>;

  const aboutPrimaryImage = normalizeHttpsOrSlashImage(pick("about_primary_image"));
  const aboutSecondaryImage = normalizeHttpsOrSlashImage(pick("about_secondary_image"));
  const contactPrimaryImage = normalizeHttpsOrSlashImage(pick("contact_primary_image"));
  const contactSecondaryImage = normalizeHttpsOrSlashImage(pick("contact_secondary_image"));
  if (aboutPrimaryImage === null || aboutSecondaryImage === null || contactPrimaryImage === null || contactSecondaryImage === null) {
    redirect("/admin/site?error=bad-image-url");
  }

  const patch: Record<string, unknown> = {
    headerAccent: pick("header_accent"),
    testimonialsLead: pick("testimonials_lead"),
    heroTitle: pick("hero_title"),
    heroBadgeCod: pick("hero_badge_cod"),
    heroBadgeRegion: pick("hero_badge_region"),
    heroLeadParagraph: pick("hero_lead"),
    bankName: pick("bank_name"),
    bankIban: pick("bank_iban"),
    bankAccountTitle: pick("bank_account_title"),
    jazzcashNumber: pick("jazzcash_number"),
    jazzcashTitle: pick("jazzcash_title"),
    aboutPrimaryImage,
    aboutSecondaryImage,
    contactPrimaryImage,
    contactSecondaryImage,
  };

  const socialRaw = pick("social_links_json");
  if (socialRaw.length) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(socialRaw);
    } catch {
      redirect("/admin/site?error=social-json");
    }
    if (!Array.isArray(parsed) || parsed.length > 20) redirect("/admin/site?error=social-json");
    const cleaned = parsed.filter(isStorefrontSocialLink);
    if (cleaned.length === 0) redirect("/admin/site?error=social-json");
    patch.socialLinks = cleaned.slice(0, 12).map(({ label, url, platform }) => ({ label, url, platform: platform?.trim() || undefined }));
  }

  const testRaw = pick("testimonials_json");
  if (testRaw.length) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(testRaw);
    } catch {
      redirect("/admin/site?error=testimonials-json");
    }
    if (!Array.isArray(parsed)) redirect("/admin/site?error=testimonials-json");
    const cleaned = parsed.filter(isStorefrontTestimonial).slice(0, 24);
    if (cleaned.length === 0) redirect("/admin/site?error=testimonials-json");
    patch.testimonials = cleaned;
  }

  const merged = { ...base, ...patch };
  merged.updated_marker = Date.now();

  const { error } = await supabase
    .from("storefront_settings")
    .upsert({ id: 1, data: merged as never, updated_at: new Date().toISOString() }, { onConflict: "id" });

  if (error) redirect(`/admin/site?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/site");
}

export async function updateCategoryAppearance(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  const thumbNorm = normalizeHttpsOrSlashImage(String(formData.get("thumbnail_url") ?? ""));
  const hero_hint = String(formData.get("hero_icon_hint") ?? "").trim();

  if (!id) redirect("/admin/categories?error=id");
  if (thumbNorm === null) redirect(`/admin/categories?error=${encodeURIComponent("Thumbnail must be empty, https:// URL, or a site path (/…)")}`);

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("categories").update({ thumbnail_url: thumbNorm, hero_icon_hint: hero_hint }).eq("id", id);

  if (error) redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/categories");
}

export async function updateProductSeoFields(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  const meta_keywords = String(formData.get("meta_keywords") ?? "");
  const meta_description = String(formData.get("meta_description") ?? "");
  if (!id) redirect("/admin/products/seo");

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").update({ meta_keywords, meta_description }).eq("id", id);

  if (error) redirect(`/admin/products/seo?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/products/seo");
}

export async function addHomepageSectionProduct(formData: FormData) {
  await assertAdminAuthenticated();
  const section = String(formData.get("section") ?? "").trim();
  const product_id = String(formData.get("product_id") ?? "").trim();
  const sortRaw = Number(formData.get("sort_order") ?? 0);
  const sort_order = Number.isFinite(sortRaw) ? Math.floor(sortRaw) : 0;
  const allowedSection = section === "featured" || section === "gadgets";
  const next = `/admin/home-sections?section=${encodeURIComponent(section)}`;

  if (!allowedSection || !product_id) redirect(next);

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("homepage_section_products").insert({ section, product_id, sort_order });

  if (error) redirect(`${next}&error=${encodeURIComponent(error.message)}`);
  redirect(next);
}

export async function removeHomepageSectionProduct(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("row_id") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim();
  const next = `/admin/home-sections?section=${encodeURIComponent(section)}`;

  if (!id) redirect(next);

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("homepage_section_products").delete().eq("id", id);

  if (error) redirect(`${next}&error=${encodeURIComponent(error.message)}`);
  redirect(next);
}

export async function updateHomepageSectionSort(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("row_id") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim();
  const sortRaw = Number(formData.get("sort_order") ?? 0);
  const sort_order = Number.isFinite(sortRaw) ? Math.floor(sortRaw) : 0;
  const next = `/admin/home-sections?section=${encodeURIComponent(section)}`;

  if (!id) redirect(next);

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("homepage_section_products").update({ sort_order }).eq("id", id);

  if (error) redirect(`${next}&error=${encodeURIComponent(error.message)}`);
  redirect(next);
}
