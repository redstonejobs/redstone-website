import { createClient } from "@/utils/supabase/server";
import type { AdminContext } from "./types";

type AuditInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  description?: string;
  metadata?: Record<string, unknown>;
};

export async function logAuditEvent(context: AdminContext, input: AuditInput) {
  const supabase = await createClient();

  await supabase.from("admin_audit_logs").insert({
    actor_user_id: context.user.id,
    actor_role: context.highestRole,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    description: input.description ?? null,
    metadata: input.metadata ?? null,
  });
}
