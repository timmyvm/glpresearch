import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, verifySession } from "@/lib/session";
import { HINT_COOKIE, hintValue } from "@/lib/session-hint";

// Fast, optimistic gate for protected areas. Pages still re-check the user against the database.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  // Sessions started before the header hint existed get one here.
  if (!request.cookies.has(HINT_COOKIE)) {
    response.cookies.set(HINT_COOKIE, hintValue({ name: session.name.split(" ")[0] ?? "", admin: session.role === "ADMIN" }), {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }
  return response;
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
