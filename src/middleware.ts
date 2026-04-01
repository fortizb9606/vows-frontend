import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session cookie (Supabase auth token)
  const authToken = request.cookies.get("sb-auth-token")?.value;

  // Check if the path is a dashboard route
  if (pathname.startsWith("/(dashboard)") || pathname.startsWith("/dashboard")) {
    // If no session and trying to access dashboard, redirect to login
    if (!authToken) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (pathname.startsWith("/auth/login") && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
