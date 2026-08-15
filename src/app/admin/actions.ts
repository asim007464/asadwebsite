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
import {
  parseSpecListsJson,
  specListsToOptions,
  variantTitleFromSpecLists,
} from "@/lib/product-spec-lists";
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/admin/login?error=auth&next=${encodeURIComponent(nextPathRaw)}`);
  }

  if (!adminUserAllowed(data.user)) {
    await supabase.auth.signOut();
    await clearLegacyAdminCookie();
    redirect(
      `/admin/login?error=forbidden&next=${encodeURIComponent(nextPathRaw)}`,
    );
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
  const { data: uid, error: rpcErr } = await admin.rpc("lookup_auth_user_id", {
    email_input: email,
  });
  if (rpcErr || !uid) {
    redirect("/admin/team?error=no-account");
  }

  const uidStr = String(uid);
  const { data: got, error: getErr } =
    await admin.auth.admin.getUserById(uidStr);
  if (getErr || !got.user) {
    redirect("/admin/team?error=no-account");
  }

  const meta = { ...(got.user.app_metadata ?? {}), admin_panel: true };
  const { error: upErr } = await admin.auth.admin.updateUserById(uidStr, {
    app_metadata: meta,
  });
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
  const { data: uid, error: rpcErr } = await admin.rpc("lookup_auth_user_id", {
    email_input: email,
  });
  if (rpcErr || !uid) {
    redirect("/admin/team?error=no-account");
  }

  const uidStr = String(uid);
  const { data: got, error: getErr } =
    await admin.auth.admin.getUserById(uidStr);
  if (getErr || !got.user) {
    redirect("/admin/team?error=no-account");
  }

  const meta: Record<string, unknown> = { ...(got.user.app_metadata ?? {}) };
  delete meta.admin_panel;
  const { error: upErr } = await admin.auth.admin.updateUserById(uidStr, {
    app_metadata: meta,
  });
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

  const slug = slugifyCatalogSlug(name, slugInput);
  if (slug.length < 2) redirect("/admin/categories?error=slug");

  const supabase = createSupabaseAdminClient();
  const { data: inserted, error } = await supabase
    .from("categories")
    .insert({ name, slug, parent_id: null })
    .select("id")
    .single();

  if (error || !inserted?.id) {
    redirect(`/admin/categories?error=${encodeURIComponent(error?.message ?? "insert")}`);
  }

  const file = formData.get("thumbnail_file");
  if (file instanceof File && file.size > 0) {
    const up = await uploadAdminMediaImage(supabase, `categories/${inserted.id}`, file);
    if ("error" in up) {
      await supabase.from("categories").delete().eq("id", inserted.id);
      redirect(`/admin/categories?error=${encodeURIComponent(up.error)}`);
    }
    const { error: thumbErr } = await supabase
      .from("categories")
      .update({ thumbnail_url: up.publicUrl })
      .eq("id", inserted.id);
    if (thumbErr) {
      await supabase.from("categories").delete().eq("id", inserted.id);
      redirect(`/admin/categories?error=${encodeURIComponent(thumbErr.message)}`);
    }
  }

  redirect("/admin/categories?notice=category-created");
}

export async function deleteCategory(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/categories");
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error)
    redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);
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

/** First-variant SKU when admin does not enter a warehouse code (slug is unique per product). */
function defaultVariantSkuFromSlug(productSlug: string) {
  const base =
    productSlug
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || "ITEM";
  return base;
}

/** Escape % and _ for use in PostgREST ilike without wildcards (exact match, case-insensitive). */
function escapeIlikeExact(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Maps a typed brand label to `brands.id`: match existing slug/name or insert a new brand row.
 */
async function resolveOrCreateBrandId(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  brandNameRaw: string,
): Promise<string | null> {
  const name = brandNameRaw.trim();
  if (!name) return null;

  let baseSlug = slugifyCatalogSlug(name, "");
  if (baseSlug.length < 2) {
    baseSlug = `brand-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }

  const { data: bySlug } = await supabase
    .from("brands")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();
  if (bySlug?.id) return bySlug.id;

  const { data: byName } = await supabase
    .from("brands")
    .select("id")
    .ilike("name", escapeIlikeExact(name))
    .limit(1)
    .maybeSingle();
  if (byName?.id) return byName.id;

  for (let i = 0; i < 8; i++) {
    const trySlug = i === 0 ? baseSlug : `${baseSlug}-${i}`;
    const { data: inserted, error } = await supabase
      .from("brands")
      .insert({ name, slug: trySlug })
      .select("id")
      .single();
    if (!error && inserted?.id) return inserted.id;
    if (error && (error as { code?: string }).code !== "23505") break;
  }
  return null;
}

export async function updateCategory(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/categories?error=id");

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) redirect("/admin/categories?error=name");

  const slug = slugifyCatalogSlug(name, String(formData.get("slug") ?? ""));
  if (slug.length < 2) redirect("/admin/categories?error=slug");

  const supabase = createSupabaseAdminClient();
  const patch: { name: string; slug: string; parent_id: null; thumbnail_url?: string } = {
    name,
    slug,
    parent_id: null,
  };

  const file = formData.get("thumbnail_file");
  if (file instanceof File && file.size > 0) {
    const up = await uploadAdminMediaImage(supabase, `categories/${id}`, file);
    if ("error" in up) {
      redirect(`/admin/categories?error=${encodeURIComponent(up.error)}`);
    }
    patch.thumbnail_url = up.publicUrl;
  }

  const { error } = await supabase.from("categories").update(patch).eq("id", id);
  if (error) redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);

  redirect("/admin/categories?notice=category-saved");
}

function parseNonNegInt(raw: string, fallback: number): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

const MAX_GALLERY_FILES_PER_SUBMIT = 12;

async function renumberProductImageSortOrders(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  productId: string,
) {
  const { data: rows } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (!rows?.length) return;
  for (let i = 0; i < rows.length; i++) {
    await supabase
      .from("product_images")
      .update({ sort_order: i })
      .eq("id", rows[i].id);
  }
}

export async function addProductGalleryImages(formData: FormData) {
  await assertAdminAuthenticated();
  const product_id = String(formData.get("product_id") ?? "").trim();
  const product_name =
    String(formData.get("product_name") ?? "").trim() || "Product";
  if (!product_id) redirect("/admin/products");

  const rawFiles = formData.getAll("gallery_files");
  const files = rawFiles.filter(
    (e): e is File => e instanceof File && e.size > 0,
  );
  if (files.length === 0) {
    redirect(`/admin/products/${product_id}/edit?error=no-gallery-files`);
  }
  if (files.length > MAX_GALLERY_FILES_PER_SUBMIT) {
    redirect(`/admin/products/${product_id}/edit?error=gallery-too-many`);
  }

  const supabase = createSupabaseAdminClient();
  const { data: maxRow } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", product_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextOrder =
    typeof maxRow?.sort_order === "number" ? maxRow.sort_order + 1 : 0;

  for (const file of files) {
    const up = await uploadAdminMediaImage(
      supabase,
      `products/${product_id}`,
      file,
    );
    if ("error" in up) {
      redirect(
        `/admin/products/${product_id}/edit?error=${encodeURIComponent(up.error)}`,
      );
    }
    const { error: insErr } = await supabase.from("product_images").insert({
      product_id,
      url: up.publicUrl,
      alt: product_name.slice(0, 200),
      sort_order: nextOrder++,
    });
    if (insErr)
      redirect(
        `/admin/products/${product_id}/edit?error=${encodeURIComponent(insErr.message)}`,
      );
  }

  redirect(`/admin/products/${product_id}/edit?notice=saved-images`);
}

export async function setProductCoverImage(formData: FormData) {
  await assertAdminAuthenticated();
  const product_id = String(formData.get("product_id") ?? "").trim();
  const image_id = String(formData.get("image_id") ?? "").trim();
  if (!product_id || !image_id) redirect("/admin/products");

  const supabase = createSupabaseAdminClient();
  const { data: rows } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", product_id)
    .order("sort_order", { ascending: true });

  const ordered = (rows ?? []).map((r) => r.id);
  const idx = ordered.indexOf(image_id);
  if (idx < 0)
    redirect(
      `/admin/products/${product_id}/edit?error=${encodeURIComponent("cover-not-found")}`,
    );

  const newOrder = [
    ordered[idx],
    ...ordered.slice(0, idx),
    ...ordered.slice(idx + 1),
  ];
  for (let i = 0; i < newOrder.length; i++) {
    const { error } = await supabase
      .from("product_images")
      .update({ sort_order: i })
      .eq("id", newOrder[i]);
    if (error)
      redirect(
        `/admin/products/${product_id}/edit?error=${encodeURIComponent(error.message)}`,
      );
  }

  redirect(`/admin/products/${product_id}/edit?notice=saved-images`);
}

export async function deleteProductImage(formData: FormData) {
  await assertAdminAuthenticated();
  const product_id = String(formData.get("product_id") ?? "").trim();
  const image_id = String(formData.get("image_id") ?? "").trim();
  if (!product_id || !image_id) redirect("/admin/products");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", image_id)
    .eq("product_id", product_id);
  if (error)
    redirect(
      `/admin/products/${product_id}/edit?error=${encodeURIComponent(error.message)}`,
    );

  await renumberProductImageSortOrders(supabase, product_id);
  redirect(`/admin/products/${product_id}/edit?notice=saved-images`);
}

export async function createProduct(formData: FormData) {
  await assertAdminAuthenticated();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) redirect("/admin/products/new?error=name");

  const slug = slugifyCatalogSlug(name, String(formData.get("slug") ?? ""));
  if (slug.length < 2) redirect("/admin/products/new?error=slug");

  const catchy_headline = String(formData.get("catchy_headline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryRaw = String(formData.get("category_id") ?? "").trim();
  const category_id = categoryRaw || null;
  const is_active = formData.get("is_active") === "on";

  const skuManual = String(formData.get("sku") ?? "").trim();
  const sku = skuManual.length >= 2 ? skuManual : defaultVariantSkuFromSlug(slug);
  const specLists = parseSpecListsJson(String(formData.get("spec_lists_json") ?? ""));
  const variantTitle = variantTitleFromSpecLists(specLists, name);
  const variantOptions = specListsToOptions(specLists);
  const priceRaw = Number.parseInt(String(formData.get("price_pkr") ?? ""), 10);
  const stock_qty = parseNonNegInt(String(formData.get("stock_qty") ?? "0"), 0);
  const compareRaw = String(formData.get("compare_at_price_pkr") ?? "").trim();
  const compare_at_price_pkr =
    compareRaw.length === 0 ? null : Number.parseInt(compareRaw, 10);
  const compareOk =
    compare_at_price_pkr === null ||
    (Number.isFinite(compare_at_price_pkr) && compare_at_price_pkr! >= 0);
  if (!Number.isFinite(priceRaw) || priceRaw < 0)
    redirect("/admin/products/new?error=price");
  if (!compareOk) redirect("/admin/products/new?error=compare");

  const imageRaw = String(formData.get("primary_image_url") ?? "");
  const galleryFiles = formData
    .getAll("gallery_files")
    .filter((e): e is File => e instanceof File && e.size > 0);
  if (galleryFiles.length === 0) {
    const imgCheck = normalizeHttpsOrSlashImage(imageRaw);
    if (imgCheck === null) redirect("/admin/products/new?error=image");
  }
  if (galleryFiles.length > MAX_GALLERY_FILES_PER_SUBMIT) {
    redirect("/admin/products/new?error=gallery-too-many");
  }

  const supabase = createSupabaseAdminClient();

  const brandName = String(formData.get("brand_name") ?? "").trim();
  let brand_id: string | null = null;
  if (brandName) {
    brand_id = await resolveOrCreateBrandId(supabase, brandName);
    if (!brand_id) redirect("/admin/products/new?error=brand");
  }

  const { data: inserted, error: pErr } = await supabase
    .from("products")
    .insert({ name, slug, catchy_headline, description, category_id, brand_id, is_active })
    .select("id")
    .single();

  if (pErr || !inserted?.id) {
    redirect(
      `/admin/products/new?error=${encodeURIComponent(pErr?.message ?? "insert")}`,
    );
  }

  const productId = inserted.id;

  const { data: vRow, error: vErr } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      sku,
      title: variantTitle,
      options: variantOptions,
      price_pkr: priceRaw,
      compare_at_price_pkr,
      is_active: true,
    })
    .select("id")
    .single();

  if (vErr || !vRow?.id) {
    await supabase.from("products").delete().eq("id", productId);
    redirect(
      `/admin/products/new?error=${encodeURIComponent(vErr?.message ?? "variant")}`,
    );
  }

  const { error: invErr } = await supabase
    .from("inventory")
    .insert({ variant_id: vRow.id, qty_available: stock_qty });
  if (invErr) {
    await supabase.from("products").delete().eq("id", productId);
    redirect(`/admin/products/new?error=${encodeURIComponent(invErr.message)}`);
  }

  if (galleryFiles.length > 0) {
    for (let i = 0; i < galleryFiles.length; i++) {
      const up = await uploadAdminMediaImage(
        supabase,
        `products/${productId}`,
        galleryFiles[i],
      );
      if ("error" in up) {
        redirect(`/admin/products/new?error=${encodeURIComponent(up.error)}`);
      }
      const { error: imgErr } = await supabase.from("product_images").insert({
        product_id: productId,
        url: up.publicUrl,
        alt: name.slice(0, 200),
        sort_order: i,
      });
      if (imgErr) {
        redirect(
          `/admin/products/new?error=${encodeURIComponent(imgErr.message)}`,
        );
      }
    }
  } else {
    const primaryImageUrl = normalizeHttpsOrSlashImage(imageRaw) || "";
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
  }

  redirect(`/admin/products/${productId}/edit?notice=created`);
}

async function uniqueProductSlug(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  base: string,
  reserved: Set<string>,
) {
  let candidate = base;
  for (let i = 2; i < 60; i++) {
    if (!reserved.has(candidate)) {
      const { data } = await supabase.from("products").select("id").eq("slug", candidate).maybeSingle();
      if (!data) {
        reserved.add(candidate);
        return candidate;
      }
    }
    candidate = `${base}-${i}`;
  }
  const fallback = `${base}-${Date.now()}`;
  reserved.add(fallback);
  return fallback;
}

async function uniqueVariantSku(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  base: string,
  reserved: Set<string>,
) {
  let candidate = base.slice(0, 64) || "ITEM";
  for (let i = 2; i < 60; i++) {
    if (!reserved.has(candidate)) {
      const { data } = await supabase.from("product_variants").select("id").eq("sku", candidate).maybeSingle();
      if (!data) {
        reserved.add(candidate);
        return candidate;
      }
    }
    candidate = `${base.slice(0, 56)}-${i}`;
  }
  const fallback = `${base.slice(0, 48)}-${Date.now()}`;
  reserved.add(fallback);
  return fallback;
}

async function resolveCategoryIdByLabel(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  raw: string,
): Promise<{ id: string | null; error?: string }> {
  const label = raw.trim();
  if (!label) return { id: null };

  const slug = slugifyCatalogSlug(label, label);
  const { data: bySlug } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
  if (bySlug?.id) return { id: bySlug.id };

  const { data: byName } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", escapeIlikeExact(label))
    .limit(1)
    .maybeSingle();
  if (byName?.id) return { id: byName.id };

  return { id: null, error: `Unknown category "${label}". Use an existing category name or slug.` };
}

export async function bulkCreateProducts(rows: import("@/lib/admin-bulk-products").BulkProductInput[]) {
  await assertAdminAuthenticated();

  const {
    BULK_PRODUCT_MAX_ROWS,
    normalizeHttpsOrSlashImage: normalizeImage,
    validateBulkProductRow,
  } = await import("@/lib/admin-bulk-products");

  if (!Array.isArray(rows) || rows.length === 0) {
    return { created: 0, errors: [{ row: 0, message: "No products to import." }] };
  }
  if (rows.length > BULK_PRODUCT_MAX_ROWS) {
    return {
      created: 0,
      errors: [{ row: 0, message: `Import up to ${BULK_PRODUCT_MAX_ROWS} products at a time.` }],
    };
  }

  const supabase = createSupabaseAdminClient();
  const usedSlugs = new Set<string>();
  const usedSkus = new Set<string>();
  const errors: { row: number; message: string }[] = [];
  let created = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = Number.isFinite(rows[i].rowNumber) ? Number(rows[i].rowNumber) : i + 2;
    const issues = validateBulkProductRow(rows[i]);
    if (issues.length) {
      errors.push({ row: rowNumber, message: issues[0] });
      continue;
    }

    const name = rows[i].name.trim();
    const slugBase = slugifyCatalogSlug(name, rows[i].slug ?? "");
    if (slugBase.length < 2) {
      errors.push({ row: rowNumber, message: "Could not build a valid slug." });
      continue;
    }

    const imageCheck = rows[i].image_url ? normalizeImage(rows[i].image_url) : "";
    if (imageCheck === null) {
      errors.push({ row: rowNumber, message: "image_url must start with https:// or /." });
      continue;
    }

    const category = await resolveCategoryIdByLabel(supabase, rows[i].category ?? "");
    if (category.error) {
      errors.push({ row: rowNumber, message: category.error });
      continue;
    }

    let brand_id: string | null = null;
    const brandName = (rows[i].brand ?? "").trim();
    if (brandName) {
      brand_id = await resolveOrCreateBrandId(supabase, brandName);
      if (!brand_id) {
        errors.push({ row: rowNumber, message: "Could not create or match brand." });
        continue;
      }
    }

    const slug = await uniqueProductSlug(supabase, slugBase, usedSlugs);
    const skuManual = (rows[i].sku ?? "").trim();
    const skuBase = skuManual.length >= 2 ? skuManual : defaultVariantSkuFromSlug(slug);
    const sku = await uniqueVariantSku(supabase, skuBase, usedSkus);

    const { data: inserted, error: pErr } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        catchy_headline: (rows[i].catchy_headline ?? "").trim(),
        description: (rows[i].description ?? "").trim(),
        category_id: category.id,
        brand_id,
        is_active: rows[i].is_active !== false,
        is_featured: rows[i].is_featured === true,
      })
      .select("id")
      .single();

    if (pErr || !inserted?.id) {
      errors.push({ row: rowNumber, message: pErr?.message ?? "Could not create product." });
      continue;
    }

    const productId = inserted.id;
    const { data: vRow, error: vErr } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        sku,
        title: name,
        options: {},
        price_pkr: rows[i].price_pkr,
        compare_at_price_pkr: rows[i].compare_at_price_pkr,
        is_active: true,
      })
      .select("id")
      .single();

    if (vErr || !vRow?.id) {
      await supabase.from("products").delete().eq("id", productId);
      errors.push({ row: rowNumber, message: vErr?.message ?? "Could not create variant." });
      continue;
    }

    const { error: invErr } = await supabase
      .from("inventory")
      .insert({ variant_id: vRow.id, qty_available: rows[i].stock_qty || 0 });
    if (invErr) {
      await supabase.from("products").delete().eq("id", productId);
      errors.push({ row: rowNumber, message: invErr.message });
      continue;
    }

    if (imageCheck) {
      const { error: imgErr } = await supabase.from("product_images").insert({
        product_id: productId,
        url: imageCheck,
        alt: name.slice(0, 200),
        sort_order: 0,
      });
      if (imgErr) {
        errors.push({
          row: rowNumber,
          message: `Product saved, but image failed: ${imgErr.message}`,
        });
      }
    }

    created += 1;
  }

  return { created, errors };
}

export async function updateProduct(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/products?error=id");

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) redirect(`/admin/products/${id}/edit?error=name`);

  const slug = slugifyCatalogSlug(name, String(formData.get("slug") ?? ""));
  if (slug.length < 2) redirect(`/admin/products/${id}/edit?error=slug`);

  const catchy_headline = String(formData.get("catchy_headline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryRaw = String(formData.get("category_id") ?? "").trim();
  const category_id = categoryRaw || null;
  const is_active = formData.get("is_active") === "on";

  const supabase = createSupabaseAdminClient();

  const brandName = String(formData.get("brand_name") ?? "").trim();
  let brand_id: string | null = null;
  if (brandName) {
    brand_id = await resolveOrCreateBrandId(supabase, brandName);
    if (!brand_id) redirect(`/admin/products/${id}/edit?error=brand`);
  }

  const { error } = await supabase
    .from("products")
    .update({ name, slug, catchy_headline, description, category_id, brand_id, is_active })
    .eq("id", id);

  if (error)
    redirect(
      `/admin/products/${id}/edit?error=${encodeURIComponent(error.message)}`,
    );

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
    compare_at_price_pkr === null ||
    (Number.isFinite(compare_at_price_pkr) && compare_at_price_pkr! >= 0);

  if (sku.length < 2) redirect(`/admin/products/${product_id}/edit?error=sku`);
  if (title.length < 1)
    redirect(`/admin/products/${product_id}/edit?error=variant`);
  if (!Number.isFinite(priceRaw) || priceRaw < 0)
    redirect(`/admin/products/${product_id}/edit?error=price`);
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
    redirect(
      `/admin/products/${product_id}/edit?error=${encodeURIComponent(vErr?.message ?? "variant")}`,
    );
  }

  const { error: invErr } = await supabase
    .from("inventory")
    .insert({ variant_id: vRow.id, qty_available: stock_qty });
  if (invErr) {
    await supabase.from("product_variants").delete().eq("id", vRow.id);
    redirect(
      `/admin/products/${product_id}/edit?error=${encodeURIComponent(invErr.message)}`,
    );
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
    compare_at_price_pkr === null ||
    (Number.isFinite(compare_at_price_pkr) && compare_at_price_pkr! >= 0);

  if (sku.length < 2) redirect(`/admin/products/${product_id}/edit?error=sku`);
  if (title.length < 1)
    redirect(`/admin/products/${product_id}/edit?error=variant`);
  if (!Number.isFinite(priceRaw) || priceRaw < 0)
    redirect(`/admin/products/${product_id}/edit?error=price`);
  if (!compareOk) redirect(`/admin/products/${product_id}/edit?error=compare`);

  const supabase = createSupabaseAdminClient();
  const { error: uErr } = await supabase
    .from("product_variants")
    .update({
      sku,
      title,
      price_pkr: priceRaw,
      compare_at_price_pkr,
      is_active,
    })
    .eq("id", variant_id)
    .eq("product_id", product_id);

  if (uErr)
    redirect(
      `/admin/products/${product_id}/edit?error=${encodeURIComponent(uErr.message)}`,
    );

  const { error: invErr } = await supabase
    .from("inventory")
    .upsert(
      {
        variant_id,
        qty_available: stock_qty,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "variant_id" },
    );

  if (invErr)
    redirect(
      `/admin/products/${product_id}/edit?error=${encodeURIComponent(invErr.message)}`,
    );
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

  if (cErr)
    redirect(
      `/admin/products/${product_id}/edit?error=${encodeURIComponent(cErr.message)}`,
    );
  if ((count ?? 0) <= 1) {
    redirect(
      `/admin/products/${product_id}/edit?error=${encodeURIComponent("Keep at least one variant per product.")}`,
    );
  }

  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variant_id)
    .eq("product_id", product_id);
  if (error)
    redirect(
      `/admin/products/${product_id}/edit?error=${encodeURIComponent(error.message)}`,
    );
  redirect(`/admin/products/${product_id}/edit?notice=variant-removed`);
}

export async function deleteProduct(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/products");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error)
    redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/products");
}

export async function updateOrderStatus(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = new Set([
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ]);
  if (!id || !allowed.has(status)) redirect("/admin/orders");

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error)
    redirect(`/admin/orders?error=${encodeURIComponent(error.message)}`);
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
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const img = await heroSlideImageFromForm(
    supabase,
    formData,
    `hero/${pathKey}`,
  );
  if ("err" in img) {
    redirect(
      `/admin/hero?error=${img.err === "invalid-url" ? "invalid-url" : encodeURIComponent(img.err)}`,
    );
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
    redirect(
      `/admin/hero?error=${img.err === "invalid-url" ? "invalid-url" : encodeURIComponent(img.err)}`,
    );
  }

  const { error } = await supabase
    .from("hero_slides")
    .update({ url: img.ok, alt, sort_order, is_active })
    .eq("id", id);
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
  if (t.startsWith("/") && !t.startsWith("//"))
    return t.split(/\s/)[0] ?? "/products";
  if (/^https:\/\//i.test(t)) return t;
  return null;
}

export async function updateHomeReviewsBanner(formData: FormData) {
  await assertAdminAuthenticated();
  const bannerId = Number.parseInt(String(formData.get("banner_id") ?? "1"), 10);
  if (bannerId !== 1 && bannerId !== 2) {
    redirect("/admin/reviews-banner?error=invalid-banner");
  }

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
    if (backgroundNormalized === null)
      redirect("/admin/reviews-banner?error=invalid-bg-url");
    background_image_url = backgroundNormalized;
  }

  const button_href = normalizeReviewsBannerHref(button_hrefRaw);
  if (button_href === null)
    redirect("/admin/reviews-banner?error=invalid-button-href");

  const is_active = formData.get("is_active") === "on";

  const { error } = await supabase.from("home_reviews_banner").upsert(
    {
      id: bannerId,
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

  if (error)
    redirect(
      `/admin/reviews-banner?error=${encodeURIComponent(error.message)}`,
    );
  redirect(`/admin/reviews-banner?saved=${bannerId}`);
}

export async function updateHomeAfterBrowseBanner(formData: FormData) {
  await assertAdminAuthenticated();
  const alt_text = String(formData.get("alt_text") ?? "").trim();
  const productSlug = String(formData.get("product_slug") ?? "").trim();
  const linkHrefRaw = String(formData.get("link_href") ?? "").trim();
  const is_active = formData.get("is_active") === "on";

  const supabase = createSupabaseAdminClient();

  const imgFile = formData.get("image_file");
  let image_url: string;
  if (imgFile instanceof File && imgFile.size > 0) {
    const up = await uploadAdminMediaImage(supabase, "after-browse-banner", imgFile);
    if ("error" in up) {
      redirect(`/admin/after-browse-banner?error=${encodeURIComponent(up.error)}`);
    }
    image_url = up.publicUrl;
  } else {
    const bg = String(formData.get("image_url") ?? "").trim();
    const imageNormalized = normalizeOptionalHttpsBackground(bg);
    if (imageNormalized === null) redirect("/admin/after-browse-banner?error=invalid-image-url");
    image_url = imageNormalized;
  }

  let link_href = "";
  if (productSlug) {
    const slug = productSlug.replace(/^\/+|\/+$/g, "");
    if (!slug) redirect("/admin/after-browse-banner?error=invalid-link-href");
    link_href = `/product/${slug}`;
  } else if (linkHrefRaw) {
    const normalized = normalizeReviewsBannerHref(linkHrefRaw);
    if (normalized === null) redirect("/admin/after-browse-banner?error=invalid-link-href");
    link_href = normalized;
  }

  if (is_active && !image_url) {
    redirect("/admin/after-browse-banner?error=invalid-image-url");
  }

  const { error } = await supabase.from("home_after_browse_banner").upsert(
    {
      id: 1,
      image_url,
      link_href,
      alt_text,
      is_active,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) redirect(`/admin/after-browse-banner?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/after-browse-banner");
}

const BROWSE_SHOWCASE_ADMIN = "/admin/browse-showcase";

export async function updateHomeBrowseShowcase(formData: FormData) {
  await assertAdminAuthenticated();
  const category_id = String(formData.get("category_id") ?? "").trim() || null;
  const section_title = String(formData.get("section_title") ?? "").trim();
  const is_active = formData.get("is_active") === "on";

  if (is_active && !category_id) redirect(`${BROWSE_SHOWCASE_ADMIN}?error=pick-category`);

  const supabase = createSupabaseAdminClient();

  if (is_active && category_id) {
    const { count } = await supabase
      .from("home_browse_showcase_products")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) < 1) redirect(`${BROWSE_SHOWCASE_ADMIN}?error=need-products`);

    const { data: curated } = await supabase.from("home_browse_showcase_products").select("product_id");
    const ids = (curated ?? []).map((r) => r.product_id).filter(Boolean);
    if (ids.length > 0) {
      const { data: prods } = await supabase.from("products").select("id,category_id").in("id", ids);
      const staleIds = (prods ?? []).filter((p) => p.category_id !== category_id).map((p) => p.id);
      if (staleIds.length > 0) {
        await supabase.from("home_browse_showcase_products").delete().in("product_id", staleIds);
      }
      const { count: after } = await supabase
        .from("home_browse_showcase_products")
        .select("id", { count: "exact", head: true });
      if ((after ?? 0) < 1) redirect(`${BROWSE_SHOWCASE_ADMIN}?error=need-products`);
    }
  }

  const { error } = await supabase.from("home_browse_showcase").upsert(
    {
      id: 1,
      category_id,
      section_title,
      is_active,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) redirect(`${BROWSE_SHOWCASE_ADMIN}?error=${encodeURIComponent(error.message)}`);
  redirect(BROWSE_SHOWCASE_ADMIN);
}

export async function addHomeBrowseShowcaseProduct(formData: FormData) {
  await assertAdminAuthenticated();
  const product_id = String(formData.get("product_id") ?? "").trim();
  const sortRaw = Number(formData.get("sort_order") ?? 0);
  const sort_order = Number.isFinite(sortRaw) ? Math.floor(sortRaw) : 0;

  if (!product_id) redirect(BROWSE_SHOWCASE_ADMIN);

  const supabase = createSupabaseAdminClient();
  const { data: showcase } = await supabase.from("home_browse_showcase").select("category_id").eq("id", 1).maybeSingle();
  const categoryId = showcase?.category_id;
  if (!categoryId) redirect(`${BROWSE_SHOWCASE_ADMIN}?error=pick-category`);

  const { data: product } = await supabase.from("products").select("category_id").eq("id", product_id).maybeSingle();
  if (!product || product.category_id !== categoryId) {
    redirect(`${BROWSE_SHOWCASE_ADMIN}?error=wrong-category`);
  }

  const { error } = await supabase.from("home_browse_showcase_products").insert({ product_id, sort_order });
  if (error) redirect(`${BROWSE_SHOWCASE_ADMIN}?error=${encodeURIComponent(error.message)}`);
  redirect(BROWSE_SHOWCASE_ADMIN);
}

export async function removeHomeBrowseShowcaseProduct(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("row_id") ?? "").trim();
  if (!id) redirect(BROWSE_SHOWCASE_ADMIN);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("home_browse_showcase_products").delete().eq("id", id);
  if (error) redirect(`${BROWSE_SHOWCASE_ADMIN}?error=${encodeURIComponent(error.message)}`);
  redirect(BROWSE_SHOWCASE_ADMIN);
}

export async function updateHomeBrowseShowcaseProductSort(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("row_id") ?? "").trim();
  const sortRaw = Number(formData.get("sort_order") ?? 0);
  const sort_order = Number.isFinite(sortRaw) ? Math.floor(sortRaw) : 0;
  if (!id) redirect(BROWSE_SHOWCASE_ADMIN);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("home_browse_showcase_products").update({ sort_order }).eq("id", id);
  if (error) redirect(`${BROWSE_SHOWCASE_ADMIN}?error=${encodeURIComponent(error.message)}`);
  redirect(BROWSE_SHOWCASE_ADMIN);
}

export async function updateProductFeatured(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/featured");

  const is_featured = formData.get("is_featured") === "on";
  const sortRaw = Number(formData.get("featured_sort_order") ?? 0);
  const featured_sort_order = Number.isFinite(sortRaw)
    ? Math.floor(sortRaw)
    : 0;

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_featured, featured_sort_order })
    .eq("id", id);
  if (error)
    redirect(`/admin/featured?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/featured");
}

function normalizeHttpsOrSlashImage(raw: string) {
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("/")) return t;
  return /^https:\/\//i.test(t) ? t : null;
}

function isStorefrontSocialLink(
  v: unknown,
): v is { label: string; url: string; platform?: string } {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  const label = String(o.label ?? "").trim();
  const url = String(o.url ?? "").trim();
  return label.length > 0 && /^https:\/\//i.test(url);
}

function isStorefrontTestimonial(
  v: unknown,
): v is { quote: string; name: string; meta: string; initials: string } {
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
  return (
    quote.length >= 4 &&
    name.length >= 2 &&
    meta.length >= 2 &&
    initials.length > 0
  );
}

async function storefrontImageFromForm(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  formData: FormData,
  urlKey: string,
  fileKey: string,
  pathPrefix: string,
  redirectOnError: string,
  existingUrl = "",
): Promise<string | null> {
  const file = formData.get(fileKey);
  if (file instanceof File && file.size > 0) {
    const up = await uploadAdminMediaImage(supabase, pathPrefix, file);
    if ("error" in up) {
      redirect(`${redirectOnError}?error=${encodeURIComponent(up.error)}`);
    }
    return up.publicUrl;
  }
  const raw = String(formData.get(urlKey) ?? "").trim();
  if (!raw) return existingUrl;
  return normalizeHttpsOrSlashImage(raw);
}

async function loadStorefrontBase(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  const { data: existing } = await supabase.from("storefront_settings").select("data").eq("id", 1).maybeSingle();
  return ((existing?.data as Record<string, unknown> | null) ?? {}) as Record<string, unknown>;
}

async function saveStorefrontMerged(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  merged: Record<string, unknown>,
  redirectTo: string,
) {
  merged.updated_marker = Date.now();
  const { error } = await supabase
    .from("storefront_settings")
    .upsert({ id: 1, data: merged as never, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  redirect(redirectTo);
}

function parseTestimonialsFromForm(formData: FormData, pick: (k: string) => string) {
  const testRaw = pick("testimonials_json");
  if (!testRaw.length) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(testRaw);
  } catch {
    redirect("/admin/home-content?error=testimonials-json");
  }
  if (!Array.isArray(parsed)) redirect("/admin/home-content?error=testimonials-json");
  const cleaned = parsed.filter(isStorefrontTestimonial).slice(0, 24);
  if (cleaned.length === 0) redirect("/admin/home-content?error=testimonials-json");
  return cleaned;
}

export async function updateHomePageContent(formData: FormData) {
  await assertAdminAuthenticated();
  const pick = (k: string) => String(formData.get(k) ?? "").trim();
  const supabase = createSupabaseAdminClient();
  const base = await loadStorefrontBase(supabase);
  const patch: Record<string, unknown> = {
    homeStatsTitle: pick("home_stats_title"),
    homeStatsLead: pick("home_stats_lead"),
    testimonialsLead: pick("testimonials_lead"),
  };
  const testimonials = parseTestimonialsFromForm(formData, pick);
  if (testimonials) patch.testimonials = testimonials;
  await saveStorefrontMerged(supabase, { ...base, ...patch }, "/admin/home-content");
}

export async function updateAboutPageContent(formData: FormData) {
  await assertAdminAuthenticated();
  const pick = (k: string) => String(formData.get(k) ?? "").trim();
  const supabase = createSupabaseAdminClient();
  const base = await loadStorefrontBase(supabase);
  const aboutPrimaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "about_primary_image",
    "about_primary_image_file",
    "site/about-primary",
    "/admin/about-content",
    String(base.aboutPrimaryImage ?? ""),
  );
  const aboutSecondaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "about_secondary_image",
    "about_secondary_image_file",
    "site/about-secondary",
    "/admin/about-content",
    String(base.aboutSecondaryImage ?? ""),
  );
  if (aboutPrimaryImage === null || aboutSecondaryImage === null) {
    redirect("/admin/about-content?error=bad-image-url");
  }
  const chips = pick("about_chips")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
  await saveStorefrontMerged(
    supabase,
    {
      ...base,
      aboutPageTitle: pick("about_page_title"),
      aboutPageLead: pick("about_page_lead"),
      aboutChips: chips.length ? chips : base.aboutChips,
      aboutPrimaryImage,
      aboutSecondaryImage,
    },
    "/admin/about-content",
  );
}

export async function updateContactPageContent(formData: FormData) {
  await assertAdminAuthenticated();
  const pick = (k: string) => String(formData.get(k) ?? "").trim();
  const supabase = createSupabaseAdminClient();
  const base = await loadStorefrontBase(supabase);
  const contactPrimaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "contact_primary_image",
    "contact_primary_image_file",
    "site/contact-primary",
    "/admin/contact-content",
    String(base.contactPrimaryImage ?? ""),
  );
  const contactSecondaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "contact_secondary_image",
    "contact_secondary_image_file",
    "site/contact-secondary",
    "/admin/contact-content",
    String(base.contactSecondaryImage ?? ""),
  );
  if (contactPrimaryImage === null || contactSecondaryImage === null) {
    redirect("/admin/contact-content?error=bad-image-url");
  }
  const lat = Number.parseFloat(pick("store_lat"));
  const lng = Number.parseFloat(pick("store_lng"));
  await saveStorefrontMerged(
    supabase,
    {
      ...base,
      contactPageTitle: pick("contact_page_title"),
      contactPageLead: pick("contact_page_lead"),
      contactEmail: pick("contact_email"),
      contactChannel1Label: pick("contact_channel1_label"),
      contactChannel1Display: pick("contact_channel1_display"),
      contactChannel1Tel: pick("contact_channel1_tel"),
      contactChannel1Wa: pick("contact_channel1_wa"),
      contactChannel1Notes: pick("contact_channel1_notes"),
      contactChannel2Label: pick("contact_channel2_label"),
      contactChannel2Display: pick("contact_channel2_display"),
      contactChannel2Tel: pick("contact_channel2_tel"),
      contactChannel2Wa: pick("contact_channel2_wa"),
      contactChannel2Notes: pick("contact_channel2_notes"),
      supportDeskHours: pick("support_desk_hours"),
      supportEscalations: pick("support_escalations"),
      supportCommitmentsIntro: pick("support_commitments_intro"),
      storeLocationName: pick("store_location_name"),
      storeLat: Number.isFinite(lat) ? lat : base.storeLat,
      storeLng: Number.isFinite(lng) ? lng : base.storeLng,
      googleMapsPlaceUrl: pick("google_maps_place_url"),
      googlePlaceFeatureRef: pick("google_place_feature_ref"),
      contactPrimaryImage,
      contactSecondaryImage,
    },
    "/admin/contact-content",
  );
}

export async function mergeStorefrontSettings(formData: FormData) {
  await assertAdminAuthenticated();
  function pick(key: string) {
    return String(formData.get(key) ?? "").trim();
  }

  const supabase = createSupabaseAdminClient();

  const base = await loadStorefrontBase(supabase);

  const aboutPrimaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "about_primary_image",
    "about_primary_image_file",
    "site/about-primary",
    "/admin/site",
    String(base.aboutPrimaryImage ?? ""),
  );
  const aboutSecondaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "about_secondary_image",
    "about_secondary_image_file",
    "site/about-secondary",
    "/admin/site",
    String(base.aboutSecondaryImage ?? ""),
  );
  const contactPrimaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "contact_primary_image",
    "contact_primary_image_file",
    "site/contact-primary",
    "/admin/site",
    String(base.contactPrimaryImage ?? ""),
  );
  const contactSecondaryImage = await storefrontImageFromForm(
    supabase,
    formData,
    "contact_secondary_image",
    "contact_secondary_image_file",
    "site/contact-secondary",
    "/admin/site",
    String(base.contactSecondaryImage ?? ""),
  );
  if (
    aboutPrimaryImage === null ||
    aboutSecondaryImage === null ||
    contactPrimaryImage === null ||
    contactSecondaryImage === null
  ) {
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
    supportDeskHours: pick("support_desk_hours"),
    supportEscalations: pick("support_escalations"),
    supportCommitmentsIntro: pick("support_commitments_intro"),
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
    if (!Array.isArray(parsed) || parsed.length > 20)
      redirect("/admin/site?error=social-json");
    const cleaned = parsed.filter(isStorefrontSocialLink);
    if (cleaned.length === 0) redirect("/admin/site?error=social-json");
    patch.socialLinks = cleaned
      .slice(0, 12)
      .map(({ label, url, platform }) => ({
        label,
        url,
        platform: platform?.trim() || undefined,
      }));
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
  await saveStorefrontMerged(supabase, merged, "/admin/site");
}

export async function updateProductSeoFields(formData: FormData) {
  await assertAdminAuthenticated();
  const id = String(formData.get("id") ?? "").trim();
  const meta_keywords = String(formData.get("meta_keywords") ?? "");
  const meta_description = String(formData.get("meta_description") ?? "");
  if (!id) redirect("/admin/products/seo");

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ meta_keywords, meta_description })
    .eq("id", id);

  if (error)
    redirect(`/admin/products/seo?error=${encodeURIComponent(error.message)}`);
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
  const { error } = await supabase
    .from("homepage_section_products")
    .insert({ section, product_id, sort_order });

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
  const { error } = await supabase
    .from("homepage_section_products")
    .delete()
    .eq("id", id);

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
  const { error } = await supabase
    .from("homepage_section_products")
    .update({ sort_order })
    .eq("id", id);

  if (error) redirect(`${next}&error=${encodeURIComponent(error.message)}`);
  redirect(next);
}
