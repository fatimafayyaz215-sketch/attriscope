import { NextResponse, type NextRequest } from "next/server";

/**
 * Global Middleware
 * Used for protecting routes and handling session-based redirects.
 */
export function proxy(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Example: Redirect unauthenticated users from /dashboard to /login
  // For now, we allow everything but provide the structure.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
