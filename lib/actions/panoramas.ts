"use server";

import { createClient } from "@/lib/supabase/server";
import { createPanoramaSchema, type CreatePanoramaInput } from "@/lib/validations/panorama";
import type { ActionResult } from "./auth";
import { logAudit } from "./audit-log";

export async function getOutletPanoramas(outletId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("panoramas")
    .select("*")
    .eq("outlet_id", outletId)
    .order("order_index");

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createPanorama(input: CreatePanoramaInput): Promise<ActionResult & { id?: string }> {
  const parsed = createPanoramaSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Login diperlukan" };

  // Verify user owns the outlet or is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: outlet } = await supabase
    .from("outlets")
    .select("owner_id")
    .eq("id", parsed.data.outletId)
    .single();

  if (!outlet) return { success: false, error: "Outlet tidak ditemukan" };

  const outletRow = outlet as unknown as { owner_id: string };
  const profileRow = profile as unknown as { role: string } | null;

  if (profileRow?.role !== "admin" && outletRow.owner_id !== user.id) {
    return { success: false, error: "Anda tidak memiliki akses ke outlet ini" };
  }

  const { data, error } = await supabase.from("panoramas").insert({
    outlet_id: parsed.data.outletId,
    title: parsed.data.title,
    image_360_url: parsed.data.image360Url,
    text_description: parsed.data.textDescription,
    audio_description_url: parsed.data.audioDescriptionUrl ?? null,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    heading: parsed.data.heading ?? null,
    order_index: parsed.data.orderIndex,
  } as never).select("id").single();

  if (error) return { success: false, error: error.message };

  const insertedRow = data as unknown as { id: string } | null;

  await logAudit({
    action: "create",
    entityType: "panoramas",
    entityId: insertedRow?.id ?? "",
    after: parsed.data,
  });

  return { success: true, id: insertedRow?.id };
}

export async function updatePanorama(id: string, data: Partial<CreatePanoramaInput>): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Login diperlukan" };

  const updateData: Record<string, unknown> = {};
  if (data.title) updateData.title = data.title;
  if (data.textDescription) updateData.text_description = data.textDescription;
  if (data.image360Url) updateData.image_360_url = data.image360Url;
  if (data.audioDescriptionUrl !== undefined) updateData.audio_description_url = data.audioDescriptionUrl;
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;
  if (data.heading !== undefined) updateData.heading = data.heading;
  if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;

  const { error } = await supabase
    .from("panoramas")
    .update(updateData as never)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deletePanorama(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: before } = await supabase.from("panoramas").select("*").eq("id", id).single();
  const { error } = await supabase
    .from("panoramas")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  await logAudit({ action: "delete", entityType: "panoramas", entityId: id, before });
  return { success: true };
}
