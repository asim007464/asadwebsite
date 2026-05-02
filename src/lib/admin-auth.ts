import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_ADMIN_OWNER_EMAIL } from "@/lib/admin-owner-email";

/** Legacy cookie from password-only admin — cleared on login/out. */
export const ADMIN_COOKIE_NAME = "asad_admin_session";

export function getAdminOwnerEmail(): string {
  const raw = process.env.ADMIN_OWNER_EMAIL?.trim();
  if (raw) return raw.toLowerCase();
  return DEFAULT_ADMIN_OWNER_EMAIL;
}

export function normAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isOwnerEmail(email: string): boolean {
  return normAdminEmail(email) === getAdminOwnerEmail();
}

function staffFlagEnabled(meta: Record<string, unknown> | undefined): boolean {
  const v = meta?.admin_panel;
  return v === true || v === "true";
}

/** Pure helper — safe for Edge middleware (no DB / no cookies). */
export function adminUserAllowed(user: {
  email?: string | null;
  app_metadata?: Record<string, unknown>;
} | null): boolean {
  if (!user?.email) return false;
  if (isOwnerEmail(user.email)) return true;
  return staffFlagEnabled(user.app_metadata as Record<string, unknown> | undefined);
}

export async function getAdminAuthUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user?.email) return null;
  return user;
}

export async function isAdminAuthenticated() {
  const user = await getAdminAuthUser();
  return adminUserAllowed(user);
}

export async function assertAdminAuthenticated() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}

export async function isAdminOwner(): Promise<boolean> {
  const user = await getAdminAuthUser();
  return Boolean(user?.email && isOwnerEmail(user.email));
}

export async function assertAdminOwner() {
  const user = await getAdminAuthUser();
  if (!user?.email || !isOwnerEmail(user.email)) {
    redirect("/admin?notice=owner-only");
  }
}

/** Clear legacy admin cookie set by older ADMIN_PASSWORD login. */
export async function clearLegacyAdminCookie() {
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
}
