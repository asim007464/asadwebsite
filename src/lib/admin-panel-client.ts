import type { User } from "@supabase/supabase-js";
import { DEFAULT_ADMIN_OWNER_EMAIL } from "@/lib/admin-owner-email";

/** Browser-safe owner address (must stay in sync with server `getAdminOwnerEmail` defaults/overrides). */
export function getPublicAdminOwnerEmail(): string {
  const raw = typeof process.env.NEXT_PUBLIC_ADMIN_OWNER_EMAIL === "string" ? process.env.NEXT_PUBLIC_ADMIN_OWNER_EMAIL.trim() : "";
  if (raw) return raw.toLowerCase();
  return DEFAULT_ADMIN_OWNER_EMAIL;
}

/** Matches server `adminUserAllowed` for showing storefront “Admin panel” entry after login. */
export function clientUserHasAdminPanelAccess(user: Pick<User, "email" | "app_metadata"> | null): boolean {
  if (!user?.email) return false;
  const e = user.email.trim().toLowerCase();
  if (e === getPublicAdminOwnerEmail()) return true;
  const meta = user.app_metadata as Record<string, unknown> | undefined;
  const v = meta?.admin_panel;
  return v === true || v === "true";
}
