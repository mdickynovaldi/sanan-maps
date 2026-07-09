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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return (data as { role?: string } | null)?.role === "admin";
}

export async function createOutlet(
  input: CreateOutletInput,
): Promise<ActionResult & { slug?: string }> {
  const parsed = createOutletSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // Slug unik. Pre-check via select tidak cukup: RLS menyembunyikan outlet
  // pending/rejected milik owner lain, jadi tabrakan unique constraint (23505)
  // ditangani dengan retry memakai akhiran -2, -3, ...
  const base = slugify(parsed.data.name) || "outlet";
  const { data: taken } = await supabase
    .from("outlets")
    .select("slug")
    .like("slug", `${base}%`);
  const takenSet = new Set(((taken ?? []) as Array<{ slug: string }>).map((r) => r.slug));

  let slug = base;
  let suffix = 2;
  while (takenSet.has(slug)) slug = `${base}-${suffix++}`;

  let outletId: string | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    // Status selalu 'pending' — moderasi admin sebelum tampil di peta publik.
    const { data: inserted, error } = await supabase
      .from("outlets")
      .insert({
        owner_id: user.id,
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        address: parsed.data.address,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        landmark_description: parsed.data.landmarkDescription,
        accessibility_description: parsed.data.accessibilityDescription,
        whatsapp: parsed.data.whatsapp ?? null,
        opening_hours: parsed.data.openingHours,
        status: "pending",
      } as never)
      .select("id")
      .single();

    if (!error) {
      outletId = (inserted as { id: string }).id;
      break;
    }
    if (error.code === "23505") {
      slug = `${base}-${suffix++}`;
      continue;
    }
    if (error.code === "42501") {
      return { success: false, error: "Hanya akun UMKM Owner yang dapat mendaftarkan outlet." };
    }
    return { success: false, error: error.message };
  }

  if (!outletId) {
    return { success: false, error: "Gagal membuat outlet: nama terlalu umum, coba nama lain." };
  }

  // Tautkan kategori (opsional) — kegagalan link tidak membatalkan pendaftaran.
  if (parsed.data.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", parsed.data.categorySlug)
      .maybeSingle();
    if (cat) {
      await supabase.from("outlet_categories").insert({
        outlet_id: outletId,
        category_id: (cat as { id: string }).id,
      } as never);
    }
  }

  return { success: true, slug };
}

/** Owner mengajukan ulang outlet yang ditolak agar ditinjau kembali oleh admin. */
export async function resubmitOutlet(outletId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("outlets")
    .update({ status: "pending" } as never)
    .eq("id", outletId)
    .eq("owner_id", user.id)
    .eq("status", "rejected")
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: "Outlet tidak ditemukan atau tidak berstatus ditolak." };
  }
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
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.address !== undefined) updateData.address = parsed.data.address;
  if (parsed.data.latitude !== undefined) updateData.latitude = parsed.data.latitude;
  if (parsed.data.longitude !== undefined) updateData.longitude = parsed.data.longitude;
  if (parsed.data.landmarkDescription !== undefined) updateData.landmark_description = parsed.data.landmarkDescription;
  if (parsed.data.accessibilityDescription !== undefined) updateData.accessibility_description = parsed.data.accessibilityDescription;
  if (parsed.data.whatsapp !== undefined) updateData.whatsapp = parsed.data.whatsapp;
  if (parsed.data.openingHours !== undefined) updateData.opening_hours = parsed.data.openingHours;

  const { data, error } = await supabase
    .from("outlets")
    .update(updateData as never)
    .eq("id", parsed.data.id)
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: "Outlet tidak ditemukan atau Anda tidak punya akses." };
  }

  // Perbarui tautan kategori bila dipilih di form.
  if (parsed.data.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", parsed.data.categorySlug)
      .maybeSingle();
    if (cat) {
      await supabase.from("outlet_categories").delete().eq("outlet_id", parsed.data.id);
      await supabase.from("outlet_categories").insert({
        outlet_id: parsed.data.id,
        category_id: (cat as { id: string }).id,
      } as never);
    }
  }

  return { success: true };
}

async function setOutletStatus(
  outletId: string,
  status: "approved" | "rejected",
  action: "approve" | "reject",
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };
  if (!(await isAdmin(supabase, user.id))) {
    return { success: false, error: "Hanya admin yang dapat mengubah status outlet." };
  }

  const { data: before } = await supabase.from("outlets").select("*").eq("id", outletId).single();

  const { data, error } = await supabase
    .from("outlets")
    .update({ status } as never)
    .eq("id", outletId)
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: "Outlet tidak ditemukan." };
  }

  await logAudit({ action, entityType: "outlets", entityId: outletId, before, after: { status } });
  return { success: true };
}

export async function approveOutlet(outletId: string): Promise<ActionResult> {
  return setOutletStatus(outletId, "approved", "approve");
}

export async function rejectOutlet(outletId: string): Promise<ActionResult> {
  return setOutletStatus(outletId, "rejected", "reject");
}
