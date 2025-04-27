import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/"]; // can visit unauthenticated
const TOKEN_COOKIE = "di_jwt";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // public path → let pass
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)))
    return NextResponse.next();

  // everything else requires auth
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    // keep the original path so we can redirect back after login
    const login = new URL("/login", req.url);
    login.searchParams.set("p", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // protect all dashboard / document / integration pages
    "/dashboard/:path*",
    "/documents/:path*",
    "/integrations/:path*",
  ],
};
