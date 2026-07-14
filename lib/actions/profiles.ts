"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema, updateAccessibilityPreferencesSchema } from "@/lib/validations/profile";
import type { ActionResult } from "./auth";
import { logAudit } from "./audit-log";

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string | undefined,
    phone: formData.get("phone") as string | undefined,
    avatarUrl: formData.get("avatarUrl") as string | undefined,
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
  if (parsed.data.avatarUrl !== undefined) updateData.avatar_url = parsed.data.avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updateData as never)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Daftar semua profil — RLS membatasi hasil penuh hanya untuk admin. */
export async function getAllProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateUserRole(
  userId: string,
  role: "user" | "owner" | "admin",
): Promise<ActionResult> {
  if (!["user", "owner", "admin"].includes(role)) {
    return { success: false, error: "Role tidak valid." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((me as { role?: string } | null)?.role !== "admin") {
    return { success: false, error: "Hanya admin yang dapat mengubah role." };
  }
  if (userId === user.id) {
    return { success: false, error: "Tidak dapat mengubah role akun sendiri." };
  }

  const { data: before } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role } as never)
    .eq("id", userId)
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: "User tidak ditemukan atau tidak dapat diubah." };
  }

  await logAudit({
    action: "update_role",
    entityType: "profile",
    entityId: userId,
    before,
    after: { role },
  });
  return { success: true };
}

export async function updateAccessibilityPreferences(preferences: Record<string, boolean>): Promise<ActionResult> {
  const parsed = updateAccessibilityPreferencesSchema.safeParse({ accessibilityPreferences: preferences });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({ accessibility_preferences: parsed.data.accessibilityPreferences } as never)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
