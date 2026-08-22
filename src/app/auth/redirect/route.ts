import { routeAuthenticatedUser } from "@/lib/auth/actions";
import { safeNextPath } from "@/lib/auth/redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  await routeAuthenticatedUser(safeNextPath(url.searchParams.get("next"), "/candidate"));
}
