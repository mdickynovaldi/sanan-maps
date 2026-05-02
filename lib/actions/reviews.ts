"use server";

import { createClient } from "@/lib/supabase/server";
import { createReviewSchema, type CreateReviewInput } from "@/lib/validations/review";
import type { ActionResult } from "./auth";

export async function getOutletReviews(outletId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("outlet_id", outletId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createReview(input: CreateReviewInput): Promise<ActionResult> {
  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Login diperlukan untuk menulis review" };

  const { error } = await supabase.from("reviews").insert({
    outlet_id: parsed.data.outletId,
    user_id: user.id,
    rating: parsed.data.rating,
    accessibility_rating: parsed.data.accessibilityRating ?? null,
    comment: parsed.data.comment,
    tags: parsed.data.tags,
    status: "pending",
  } as never);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateReview(id: string, comment: string, rating: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("reviews")
    .update({ comment, rating } as never)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function moderateReview(id: string, status: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ status } as never)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
