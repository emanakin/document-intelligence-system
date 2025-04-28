import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const TOKEN_COOKIE = "di_jwt";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  if (token) {
    console.log(`[MIDDLEWARE] Allowing access to: ${pathname}`);
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  const login = new URL("/login", req.url);
  login.searchParams.set("p", pathname); // return after login
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*", "/documents/:path*", "/integrations/:path*"],
};
