"use server";

import { createClient } from "@/lib/supabase/server";

export async function logAudit(params: {
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    before: (params.before ?? null) as never,
    after: (params.after ?? null) as never,
  } as never);
}
