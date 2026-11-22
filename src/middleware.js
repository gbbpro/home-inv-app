// Sends anyone who isn't logged in to the login page.
// API routes also check the session themselves (see lib/api.js).
import { NextResponse } from "next/server";
import { readToken, COOKIE_NAME } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout"];

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const session = await readToken(req.cookies.get(COOKIE_NAME)?.value);
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|webmanifest)$).*)"],
};
