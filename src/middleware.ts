import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "asad_admin_session";

function timingSafeEq(a: string, b: string) {
  return a.length === b.length && a === b;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const isLogin = pathname === "/admin/login";
  const expectedSecret = process.env.ADMIN_SESSION_SECRET;

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authed = Boolean(expectedSecret && token && timingSafeEq(token, expectedSecret));

  if (!authed && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (authed && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
