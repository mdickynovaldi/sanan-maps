"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./auth";

export async function getUserFavorites() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("favorites")
    .select("*, outlets(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function toggleFavorite(outletId: string): Promise<ActionResult & { isFavorited?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Login diperlukan" };

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("outlet_id", outletId)
    .maybeSingle();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", (existing as { id: string }).id);

    if (error) return { success: false, error: error.message };
    return { success: true, isFavorited: false };
  } else {
    // Add favorite
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      outlet_id: outletId,
    } as never);

    if (error) return { success: false, error: error.message };
    return { success: true, isFavorited: true };
  }
}
