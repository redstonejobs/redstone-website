"use server";

import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/utils/supabase/admin";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function setNewsletterSubscriberStatus(
  id: string,
  status: "active" | "unsubscribed",
) {
  if (!UUID_PATTERN.test(id)) throw new Error("Invalid subscriber ID.");
  const context = await requireAdmin();
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: subscriber, error: readError } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, status")
    .eq("id", id)
    .maybeSingle();

  if (readError || !subscriber) throw new Error("Subscriber could not be found.");

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({
      status,
      unsubscribed_at: status === "unsubscribed" ? now : null,
      updated_at: now,
      last_subscribed_at: status === "active" ? now : undefined,
    })
    .eq("id", id);

  if (error) throw new Error(`Unable to update subscriber: ${error.message}`);

  await logAuditEvent(context, {
    action: status === "unsubscribed" ? "newsletter.unsubscribe" : "newsletter.reactivate",
    entityType: "newsletter_subscriber",
    entityId: id,
    description: `${status === "unsubscribed" ? "Unsubscribed" : "Reactivated"} ${subscriber.email}`,
    metadata: { previousStatus: subscriber.status, status },
  });

  revalidatePath("/admin/subscribers");
}
