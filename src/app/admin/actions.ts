"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, getAdminPasswordFromEnv } from "@/lib/admin-auth";

function timingSafeEqualUtf8(a: string, b: string) {
  const aa = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const nextPathRaw = String(formData.get("next") ?? "/admin");
  const expected = getAdminPasswordFromEnv();
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!expected || !secret || secret.length < 16) {
    throw new Error("Admin login not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in .env.local");
  }

  if (!timingSafeEqualUtf8(password, expected)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(nextPathRaw)}`);
  }

  const jar = await cookies();
  jar.set({
    name: ADMIN_COOKIE_NAME,
    value: secret,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const safeNext = nextPathRaw.startsWith("/admin") ? nextPathRaw : "/admin";
  redirect(safeNext);
}

export async function adminLogout() {
  const jar = await cookies();
  jar.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  redirect("/admin/login");
}

export async function createCategory(formData: FormData) {
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
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/categories");
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/categories");
}

export async function updateOrderStatus(formData: FormData) {
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
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/hero");
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) redirect(`/admin/hero?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/hero");
}

export async function updateProductFeatured(formData: FormData) {
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
