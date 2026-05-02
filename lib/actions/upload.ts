"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImage(
  formData: FormData,
  bucket: string = "photos"
): Promise<ActionResult & { url?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Login diperlukan" };

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "File tidak ditemukan" };

  // Validate MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." };
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return { success: false, error: "Ukuran file maksimal 5MB." };
  }

  // Generate unique filename
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) return { success: false, error: error.message };

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);

  return { success: true, url: urlData.publicUrl };
}
