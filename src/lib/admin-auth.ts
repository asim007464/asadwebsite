import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "asad_admin_session";

export function getAdminPasswordFromEnv() {
  const p = process.env.ADMIN_PASSWORD;
  if (!p || p.length < 8) return null;
  return p;
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  const expected = process.env.ADMIN_SESSION_SECRET;
  if (!token || !expected || expected.length < 16) return false;
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function assertAdminAuthenticated() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}
