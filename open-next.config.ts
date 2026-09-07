import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Red Stone is a mixed Next.js application:
 * - public marketing, sponsorship, legal and other prerenderable pages should
 *   be served from Cloudflare Static Assets without booting the Next server;
 * - live jobs, Apply, APIs and authenticated dashboards remain dynamic.
 *
 * The static-assets incremental cache is intentionally read-only. We do not
 * enable time-based ISR here because the Worker currently has no R2/DO cache
 * bindings. Dynamic routes keep their normal SSR behavior.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
