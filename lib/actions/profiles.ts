"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema, updateAccessibilityPreferencesSchema } from "@/lib/validations/profile";
import type { ActionResult } from "./auth";

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
