import "server-only";

import { createAdminClient } from "@/utils/supabase/admin";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  full_name: string | null;
  status: "active" | "unsubscribed";
  source_path: string | null;
  subscribed_at: string;
  last_subscribed_at: string;
  unsubscribed_at: string | null;
};

export async function fetchNewsletterSubscribers() {
  const supabase = createAdminClient();

  const [{ data, error }, { count: activeCount }, { count: unsubscribedCount }] =
    await Promise.all([
      supabase
        .from("newsletter_subscribers")
        .select("id, email, full_name, status, source_path, subscribed_at, last_subscribed_at, unsubscribed_at")
        .order("last_subscribed_at", { ascending: false })
        .limit(500),
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "unsubscribed"),
    ]);

  if (error) throw new Error(`Unable to load newsletter subscribers: ${error.message}`);

  return {
    rows: (data ?? []) as NewsletterSubscriber[],
    activeCount: activeCount ?? 0,
    unsubscribedCount: unsubscribedCount ?? 0,
  };
}
