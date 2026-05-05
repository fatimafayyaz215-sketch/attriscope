import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";

/**
 * Global Middleware
 * Used for protecting routes and handling session-based redirects.
 */
export function proxy(request: NextRequest) {
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
