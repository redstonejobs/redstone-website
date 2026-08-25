import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Creates a privileged Supabase client for trusted server-side
 * administrative operations.
 *
 * IMPORTANT:
 * - Never import this file into a Client Component.
 * - Never expose SUPABASE_SERVICE_ROLE_KEY with NEXT_PUBLIC_.
 * - The service-role key must remain server-side only.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}