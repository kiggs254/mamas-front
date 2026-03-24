import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieName } from "./lib/api-config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionName = sessionCookieName();
  const hasSession = Boolean(request.cookies.get(sessionName)?.value);

  if (pathname.startsWith("/account")) {
    if (!hasSession) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (pathname === "/login" || pathname === "/register") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/login", "/register"],
};
