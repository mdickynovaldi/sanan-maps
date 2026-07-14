"use server";

import { createClient } from "@/lib/supabase/server";
import { createReportSchema, type CreateReportInput } from "@/lib/validations/report";
import type { ActionResult } from "./auth";

export async function createReport(input: CreateReportInput): Promise<ActionResult> {
  const parsed = createReportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("reports").insert({
    user_id: user?.id ?? null,
    outlet_id: parsed.data.outletId,
    type: parsed.data.type,
    description: parsed.data.description,
    status: "open",
  } as never);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getReports() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*, outlets(name)")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

/** Laporan untuk outlet milik owner yang sedang login (read-only bagi owner). */
export async function getReportsForMyOutlets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data: outlets, error: outletsError } = await supabase
    .from("outlets")
    .select("id")
    .eq("owner_id", user.id);
  if (outletsError) return { data: null, error: outletsError.message };

  const outletIds = ((outlets ?? []) as Array<{ id: string }>).map((o) => o.id);
  if (outletIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from("reports")
    .select("*, outlets(name, slug)")
    .in("outlet_id", outletIds)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

/** Laporan yang dibuat oleh user yang sedang login — untuk melacak statusnya. */
export async function getMyReports() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("reports")
    .select("*, outlets(name, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function resolveReport(id: string, status: "in_review" | "resolved" | "rejected"): Promise<ActionResult> {
  const supabase = await createClient();
  // .select("id") mendeteksi update 0 baris (mis. diblokir RLS) sebagai error.
  const { data, error } = await supabase
    .from("reports")
    .update({ status } as never)
    .eq("id", id)
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: "Laporan tidak ditemukan atau Anda tidak berwenang." };
  }
  return { success: true };
}
