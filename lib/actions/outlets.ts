"use server";

import { createClient } from "@/lib/supabase/server";
import { createOutletSchema, updateOutletSchema, type CreateOutletInput, type UpdateOutletInput } from "@/lib/validations/outlet";
import type { ActionResult } from "./auth";
import { logAudit } from "./audit-log";

export async function getApprovedOutlets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outlets")
    .select("*")
    .eq("status", "approved")
    .order("name");

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getAllOutlets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outlets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function searchOutlets(query: string, filters?: {
  category?: string;
  status?: string;
  isOpen?: boolean;
  minRating?: number;
}) {
  const supabase = await createClient();
  let q = supabase.from("outlets").select("*");

  // Only show approved for public search
  if (!filters?.status) {
    q = q.eq("status", "approved");
  } else if (filters.status !== "all") {
    q = q.eq("status", filters.status);
  }

  // Text search using ilike on name, description, address, landmark
  if (query && query.trim() !== "") {
    const term = `%${query.trim()}%`;
    q = q.or(`name.ilike.${term},description.ilike.${term},address.ilike.${term},landmark_description.ilike.${term}`);
  }

  const { data, error } = await q.order("name");

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getOutletBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outlets")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createOutlet(input: CreateOutletInput): Promise<ActionResult> {
  const parsed = createOutletSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase.from("outlets").insert({
    owner_id: user.id,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    address: parsed.data.address,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    landmark_description: parsed.data.landmarkDescription,
    accessibility_description: parsed.data.accessibilityDescription,
    whatsapp: parsed.data.whatsapp ?? null,
    opening_hours: parsed.data.openingHours,
    status: parsed.data.status,
  } as never);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateOutlet(input: UpdateOutletInput): Promise<ActionResult> {
  const parsed = updateOutletSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.slug) updateData.slug = parsed.data.slug;
  if (parsed.data.description) updateData.description = parsed.data.description;
  if (parsed.data.address) updateData.address = parsed.data.address;
  if (parsed.data.latitude !== undefined) updateData.latitude = parsed.data.latitude;
  if (parsed.data.longitude !== undefined) updateData.longitude = parsed.data.longitude;
  if (parsed.data.landmarkDescription) updateData.landmark_description = parsed.data.landmarkDescription;
  if (parsed.data.accessibilityDescription) updateData.accessibility_description = parsed.data.accessibilityDescription;
  if (parsed.data.whatsapp !== undefined) updateData.whatsapp = parsed.data.whatsapp;
  if (parsed.data.openingHours) updateData.opening_hours = parsed.data.openingHours;
  if (parsed.data.status) updateData.status = parsed.data.status;

  const { error } = await supabase
    .from("outlets")
    .update(updateData as never)
    .eq("id", parsed.data.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function approveOutlet(outletId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: before } = await supabase.from("outlets").select("*").eq("id", outletId).single();
  const { error } = await supabase
    .from("outlets")
    .update({ status: "approved" } as never)
    .eq("id", outletId);

  if (error) return { success: false, error: error.message };
  await logAudit({ action: "approve", entityType: "outlets", entityId: outletId, before, after: { status: "approved" } });
  return { success: true };
}

export async function rejectOutlet(outletId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: before } = await supabase.from("outlets").select("*").eq("id", outletId).single();
  const { error } = await supabase
    .from("outlets")
    .update({ status: "rejected" } as never)
    .eq("id", outletId);

  if (error) return { success: false, error: error.message };
  await logAudit({ action: "reject", entityType: "outlets", entityId: outletId, before, after: { status: "rejected" } });
  return { success: true };
}
