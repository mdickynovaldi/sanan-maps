"use server";

import { createClient } from "@/lib/supabase/server";
import { createProductSchema, type CreateProductInput } from "@/lib/validations/product";
import type { ActionResult } from "./auth";
import { logAudit } from "./audit-log";

export async function getOutletProducts(outletId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("outlet_id", outletId)
    .order("name");

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createProduct(input: CreateProductInput): Promise<ActionResult> {
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase.from("products").insert({
    outlet_id: parsed.data.outletId,
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    category: parsed.data.category ?? null,
    image_url: parsed.data.imageUrl ?? null,
    image_alt: parsed.data.imageAlt ?? null,
    is_available: parsed.data.isAvailable,
  } as never);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const updateData: Record<string, unknown> = {};
  if (data.name) updateData.name = data.name;
  if (data.description) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
  if (data.imageAlt !== undefined) updateData.image_alt = data.imageAlt;
  if (data.isAvailable !== undefined) updateData.is_available = data.isAvailable;

  const { error } = await supabase
    .from("products")
    .update(updateData as never)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: before } = await supabase.from("products").select("*").eq("id", id).single();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  await logAudit({ action: "delete", entityType: "products", entityId: id, before });
  return { success: true };
}
