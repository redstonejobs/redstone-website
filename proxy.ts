import { type NextRequest } from "next/server";
import { updateSession } from "./src/utils/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

/**
 * Public vacancy pages deliberately bypass the auth proxy. They do not need a
 * session refresh, and avoiding an auth/JWT round trip on every public request
 * materially reduces Cloudflare Worker CPU usage. Protected account areas do
 * refresh and validate the Supabase session through this proxy.
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/candidate/:path*",
    "/employer/:path*",
  ],
};
