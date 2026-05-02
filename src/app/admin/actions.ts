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
import { uploadAdminMediaImage } from "@/lib/admin-media-upload";
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

function slugifyCatalogSlug(name: string, slugInput: string) {
  const raw = slugInput.trim();
  if (raw.length) {
    return raw
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseNonNegInt(raw: string, fallback: number): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

async function syncPrimaryProductImage(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  productId: string,
  productName: string,
  urlRaw: string,
  fileEntry: FormDataEntryValue | null,
): Promise<{ error: string } | null> {
  let imgNorm: string | "" | null = null;
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
  if (file) {
    const up = await uploadAdminMediaImage(supabase, `products/${productId}`, file);
    if ("error" in up) return { error: up.error };
    imgNorm = up.publicUrl;
  } else {
    const n = normalizeHttpsOrSlashImage(urlRaw);
    if (n === null) return { error: "Primary image must be empty, https:// URL, or a site path (/…)." };
    imgNorm = n;
  }
  if (!String(imgNorm).trim()) return null;

  const { data: first } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const url = String(imgNorm);

  if (first?.id) {
    const { error } = await supabase
      .from("product_images")
      .update({ url, alt: productName.slice(0, 200) })
      .eq("id", first.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("product_images").insert({
      product_id: productId,
      url,
      alt: productName.slice(0, 200),
      sort_order: 0,
    });
    if (error) return { error: error.message };
  }
  return null;
}

export async function createProduct(formData: FormData) {
  await assertAdminAuthenticated();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) redirect("/admin/products/new?error=name");

  const slug = slugifyCatalogSlug(name, String(formData.get("slug") ?? ""));
  if (slug.length < 2) redirect("/admin/products/new?error=slug");

  const description = String(formData.get("description") ?? "").trim();
  const categoryRaw = String(formData.get("category_id") ?? "").trim();
  const brandRaw = String(formData.get("brand_id") ?? "").trim();
  const category_id = categoryRaw || null;
  const brand_id = brandRaw || null;
  const is_active = formData.get("is_active") === "on";

  const sku = String(formData.get("sku") ?? "").trim();
  const variantTitle = String(formData.get("variant_title") ?? "").trim();
  const priceRaw = Number.parseInt(String(formData.get("price_pkr") ?? ""), 10);
  const stock_qty = parseNonNegInt(String(formData.get("stock_qty") ?? "0"), 0);
  const compareRaw = String(formData.get("compare_at_price_pkr") ?? "").trim();
  const compare_at_price_pkr =
    compareRaw.length === 0 ? null : Number.parseInt(compareRaw, 10);
  const compareOk =
    compare_at_price_pkr === null || (Number.isFinite(compare_at_price_pkr) && compare_at_price_pkr! >= 0);

  if (sku.length < 2) redirect("/admin/products/new?error=sku");
  if (variantTitle.length < 1) redirect("/admin/products/new?error=variant");
  if (!Number.isFinite(priceRaw) || priceRaw < 0) redirect("/admin/products/new?error=price");
  if (!compareOk) redirect("/admin/products/new?error=compare");

  const imageRaw = String(formData.get("primary_image_url") ?? "");
  const primaryFile = formData.get("primary_image_file");
  const hasFile = primaryFile instanceof File && primaryFile.size > 0;
  if (!hasFile) {
    const imgCheck = normalizeHttpsOrSlashImage(imageRaw);
    if (imgCheck === null) redirect("/admin/products/new?error=image");
  }

  const supabase = createSupabaseAdminClient();
  const { data: inserted, error: pErr } = await supabase
    .from("products")
    .insert({ name, slug, description, category_id, brand_id, is_active })
    .select("id")
    .single();

  if (pErr || !inserted?.id) {
    redirect(`/admin/products/new?error=${encodeURIComponent(pErr?.message ?? "insert")}`);
  }

  const productId = inserted.id;

  const { data: vRow, error: vErr } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      sku,
      title: variantTitle,
      options: {},
      price_pkr: priceRaw,
      compare_at_price_pkr,
      is_active: true,
    })
    .select("id")
    .single();

  if (vErr || !vRow?.id) {
    await supabase.from("products").delete().eq("id", productId);
    redirect(`/admin/products/new?error=${encodeURIComponent(vErr?.message ?? "variant")}`);
  }

  const { error: invErr } = await supabase.from("inventory").insert({ variant_id: vRow.id, qty_available: stock_qty });
  if (invErr) {
    await supabase.from("products").delete().eq("id", productId);
    redirect(`/admin/products/new?error=${encodeURIComponent(invErr.message)}`);
  }

  let primaryImageUrl = "";
  if (hasFile) {
    const up = await uploadAdminMediaImage(supabase, `products/${productId}`, primaryFile);
    if ("error" in up) {
      redirect(`/admin/products/new?error=${encodeURIComponent(up.error)}`);
    }
    primaryImageUrl = up.publicUrl;
  } else {
    primaryImageUrl = normalizeHttpsOrSlashImage(imageRaw) || "";
  }

  if (primaryImageUrl) {
    const { error: imgErr } = await supabase.from("product_images").insert({
      product_id: productId,
      url: primaryImageUrl,
      alt: name.slice(0, 200),
      sort_order: 0,
    });
    if (imgErr) {
      redirect(
        `/admin/products/${productId}/edit?notice=created&error=${encodeURIComponent(`Product saved, but image failed: ${imgErr.message}`)}`,
      );
    }
  }

  redirect(`/admin/products/${productId}/edit?notice=created`);
}

export async function updateProduct(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/products?error=id");

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) redirect(`/admin/products/${id}/edit?error=name`);

  const slug = slugifyCatalogSlug(name, String(formData.get("slug") ?? ""));
  if (slug.length < 2) redirect(`/admin/products/${id}/edit?error=slug`);

  const description = String(formData.get("description") ?? "").trim();
  const categoryRaw = String(formData.get("category_id") ?? "").trim();
  const brandRaw = String(formData.get("brand_id") ?? "").trim();
  const category_id = categoryRaw || null;
  const brand_id = brandRaw || null;
  const is_active = formData.get("is_active") === "on";

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ name, slug, description, category_id, brand_id, is_active })
    .eq("id", id);

  if (error) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(error.message)}`);

  const primaryUrlField = String(formData.get("primary_image_url") ?? "");
  const imgRes = await syncPrimaryProductImage(supabase, id, name, primaryUrlField, formData.get("primary_image_file"));
  if (imgRes) {
    redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(imgRes.error)}`);
  }

  redirect(`/admin/products/${id}/edit?notice=saved`);
}

export async function addProductVariant(formData: FormData) {
  await assertAdminAuthenticated();
  const product_id = String(formData.get("product_id") ?? "").trim();
  if (!product_id) redirect("/admin/products");

  const sku = String(formData.get("sku") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = Number.parseInt(String(formData.get("price_pkr") ?? ""), 10);
  const stock_qty = parseNonNegInt(String(formData.get("stock_qty") ?? "0"), 0);
  const compareRaw = String(formData.get("compare_at_price_pkr") ?? "").trim();
  const compare_at_price_pkr =
    compareRaw.length === 0 ? null : Number.parseInt(compareRaw, 10);
  const compareOk =
    compare_at_price_pkr === null || (Number.isFinite(compare_at_price_pkr) && compare_at_price_pkr! >= 0);

  if (sku.length < 2) redirect(`/admin/products/${product_id}/edit?error=sku`);
  if (title.length < 1) redirect(`/admin/products/${product_id}/edit?error=variant`);
  if (!Number.isFinite(priceRaw) || priceRaw < 0) redirect(`/admin/products/${product_id}/edit?error=price`);
  if (!compareOk) redirect(`/admin/products/${product_id}/edit?error=compare`);

  const supabase = createSupabaseAdminClient();
  const { data: vRow, error: vErr } = await supabase
    .from("product_variants")
    .insert({
      product_id,
      sku,
      title,
      options: {},
      price_pkr: priceRaw,
      compare_at_price_pkr,
      is_active: true,
    })
    .select("id")
    .single();

  if (vErr || !vRow?.id) {
    redirect(`/admin/products/${product_id}/edit?error=${encodeURIComponent(vErr?.message ?? "variant")}`);
  }

  const { error: invErr } = await supabase.from("inventory").insert({ variant_id: vRow.id, qty_available: stock_qty });
  if (invErr) {
    await supabase.from("product_variants").delete().eq("id", vRow.id);
    redirect(`/admin/products/${product_id}/edit?error=${encodeURIComponent(invErr.message)}`);
  }

  redirect(`/admin/products/${product_id}/edit?notice=variant-added`);
}

export async function updateProductVariant(formData: FormData) {
  await assertAdminAuthenticated();
  const variant_id = String(formData.get("variant_id") ?? "").trim();
  const product_id = String(formData.get("product_id") ?? "").trim();
  if (!variant_id || !product_id) redirect("/admin/products");

  const sku = String(formData.get("sku") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = Number.parseInt(String(formData.get("price_pkr") ?? ""), 10);
  const stock_qty = parseNonNegInt(String(formData.get("stock_qty") ?? "0"), 0);
  const compareRaw = String(formData.get("compare_at_price_pkr") ?? "").trim();
  const compare_at_price_pkr =
    compareRaw.length === 0 ? null : Number.parseInt(compareRaw, 10);
  const is_active = formData.get("is_active") === "on";
  const compareOk =
    compare_at_price_pkr === null || (Number.isFinite(compare_at_price_pkr) && compare_at_price_pkr! >= 0);

  if (sku.length < 2) redirect(`/admin/products/${product_id}/edit?error=sku`);
  if (title.length < 1) redirect(`/admin/products/${product_id}/edit?error=variant`);
  if (!Number.isFinite(priceRaw) || priceRaw < 0) redirect(`/admin/products/${product_id}/edit?error=price`);
  if (!compareOk) redirect(`/admin/products/${product_id}/edit?error=compare`);

  const supabase = createSupabaseAdminClient();
  const { error: uErr } = await supabase
    .from("product_variants")
    .update({ sku, title, price_pkr: priceRaw, compare_at_price_pkr, is_active })
    .eq("id", variant_id)
    .eq("product_id", product_id);

  if (uErr) redirect(`/admin/products/${product_id}/edit?error=${encodeURIComponent(uErr.message)}`);

  const { error: invErr } = await supabase.from("inventory").upsert(
    { variant_id, qty_available: stock_qty, updated_at: new Date().toISOString() },
    { onConflict: "variant_id" },
  );

  if (invErr) redirect(`/admin/products/${product_id}/edit?error=${encodeURIComponent(invErr.message)}`);
  redirect(`/admin/products/${product_id}/edit?notice=saved-variant`);
}

export async function deleteProductVariant(formData: FormData) {
  await assertAdminAuthenticated();
  const variant_id = String(formData.get("variant_id") ?? "").trim();
  const product_id = String(formData.get("product_id") ?? "").trim();
  if (!variant_id || !product_id) redirect("/admin/products");

  const supabase = createSupabaseAdminClient();
  const { count, error: cErr } = await supabase
    .from("product_variants")
    .select("*", { count: "exact", head: true })
    .eq("product_id", product_id);

  if (cErr) redirect(`/admin/products/${product_id}/edit?error=${encodeURIComponent(cErr.message)}`);
  if ((count ?? 0) <= 1) {
    redirect(
      `/admin/products/${product_id}/edit?error=${encodeURIComponent("Keep at least one variant per product.")}`,
    );
  }

  const { error } = await supabase.from("product_variants").delete().eq("id", variant_id).eq("product_id", product_id);
  if (error) redirect(`/admin/products/${product_id}/edit?error=${encodeURIComponent(error.message)}`);
  redirect(`/admin/products/${product_id}/edit?notice=variant-removed`);
}

export async function deleteProduct(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/products");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/products");
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

async function heroSlideImageFromForm(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  formData: FormData,
  pathPrefix: string,
): Promise<{ ok: string } | { err: string }> {
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    const up = await uploadAdminMediaImage(supabase, pathPrefix, file);
    if ("error" in up) return { err: up.error };
    return { ok: up.publicUrl };
  }
  const url = normalizeHeroImageUrl(String(formData.get("url") ?? ""));
  if (!url) return { err: "invalid-url" };
  return { ok: url };
}

export async function createHeroSlide(formData: FormData) {
  await assertAdminAuthenticated();
  const alt = String(formData.get("alt") ?? "").trim();
  const sortRaw = Number(formData.get("sort_order") ?? 0);
  const sort_order = Number.isFinite(sortRaw) ? Math.floor(sortRaw) : 0;

  const supabase = createSupabaseAdminClient();
  const pathKey =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const img = await heroSlideImageFromForm(supabase, formData, `hero/${pathKey}`);
  if ("err" in img) {
    redirect(`/admin/hero?error=${img.err === "invalid-url" ? "invalid-url" : encodeURIComponent(img.err)}`);
  }

  const { error } = await supabase.from("hero_slides").insert({
    url: img.ok,
    alt,
    sort_order,
    is_active: true,
  });
  if (error) redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/hero");
}

export async function updateHeroSlide(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  const alt = String(formData.get("alt") ?? "").trim();
  const sortRaw = Number(formData.get("sort_order") ?? 0);
  const sort_order = Number.isFinite(sortRaw) ? Math.floor(sortRaw) : 0;
  const is_active = formData.get("is_active") === "on";
  if (!id) redirect("/admin/hero?error=invalid-url");

  const supabase = createSupabaseAdminClient();
  const img = await heroSlideImageFromForm(supabase, formData, `hero/${id}`);
  if ("err" in img) {
    redirect(`/admin/hero?error=${img.err === "invalid-url" ? "invalid-url" : encodeURIComponent(img.err)}`);
  }

  const { error } = await supabase.from("hero_slides").update({ url: img.ok, alt, sort_order, is_active }).eq("id", id);
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

/** Empty string or valid https / site-root image URL; `null` if invalid. */
function normalizeOptionalHttpsBackground(raw: string) {
  const u = raw.trim();
  if (!u) return "";
  if (u.startsWith("/") && !u.startsWith("//")) return u.split(/\s/)[0] ?? "";
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

  const supabase = createSupabaseAdminClient();
  const bgFile = formData.get("background_image_file");
  let background_image_url: string;
  if (bgFile instanceof File && bgFile.size > 0) {
    const up = await uploadAdminMediaImage(supabase, "reviews-banner", bgFile);
    if ("error" in up) {
      redirect(`/admin/reviews-banner?error=${encodeURIComponent(up.error)}`);
    }
    background_image_url = up.publicUrl;
  } else {
    const bg = String(formData.get("background_image_url") ?? "").trim();
    const backgroundNormalized = normalizeOptionalHttpsBackground(bg);
    if (backgroundNormalized === null) redirect("/admin/reviews-banner?error=invalid-bg-url");
    background_image_url = backgroundNormalized;
  }

  const button_href = normalizeReviewsBannerHref(button_hrefRaw);
  if (button_href === null) redirect("/admin/reviews-banner?error=invalid-button-href");

  const is_active = formData.get("is_active") === "on";

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

async function storefrontImageFromForm(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  formData: FormData,
  urlKey: string,
  fileKey: string,
  pathPrefix: string,
): Promise<string | null> {
  const file = formData.get(fileKey);
  if (file instanceof File && file.size > 0) {
    const up = await uploadAdminMediaImage(supabase, pathPrefix, file);
    if ("error" in up) {
      redirect(`/admin/site?error=${encodeURIComponent(up.error)}`);
    }
    return up.publicUrl;
  }
  const raw = String(formData.get(urlKey) ?? "").trim();
  return normalizeHttpsOrSlashImage(raw);
}

export async function mergeStorefrontSettings(formData: FormData) {
  await assertAdminAuthenticated();
  function pick(key: string) {
    return String(formData.get(key) ?? "").trim();
  }

  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase.from("storefront_settings").select("data").eq("id", 1).maybeSingle();
  const base = ((existing?.data as Record<string, unknown> | null) ?? {}) as Record<string, unknown>;

  const aboutPrimaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "about_primary_image",
    "about_primary_image_file",
    "site/about-primary",
  );
  const aboutSecondaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "about_secondary_image",
    "about_secondary_image_file",
    "site/about-secondary",
  );
  const contactPrimaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "contact_primary_image",
    "contact_primary_image_file",
    "site/contact-primary",
  );
  const contactSecondaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "contact_secondary_image",
    "contact_secondary_image_file",
    "site/contact-secondary",
  );
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
  const hero_hint = String(formData.get("hero_icon_hint") ?? "").trim();
  const urlRaw = String(formData.get("thumbnail_url") ?? "");
  const file = formData.get("thumbnail_file");

  if (!id) redirect("/admin/categories?error=id");

  const supabase = createSupabaseAdminClient();

  let thumbNorm: string | null;
  if (file instanceof File && file.size > 0) {
    const up = await uploadAdminMediaImage(supabase, `categories/${id}`, file);
    if ("error" in up) {
      redirect(`/admin/categories?error=${encodeURIComponent(up.error)}`);
    }
    thumbNorm = up.publicUrl;
  } else {
    thumbNorm = normalizeHttpsOrSlashImage(urlRaw);
  }

  if (thumbNorm === null) {
    redirect(`/admin/categories?error=${encodeURIComponent("Thumbnail must be empty, https:// URL, or a site path (/…)")}`);
  }

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
