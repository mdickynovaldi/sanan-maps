"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./auth";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg", "audio/mp4", "audio/aac"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB

async function uploadFile(
  formData: FormData,
  bucket: string,
  allowedTypes: string[],
  maxSize: number,
  typeErrorMessage: string,
  fallbackExt: string,
): Promise<ActionResult & { url?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Login diperlukan" };

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "File tidak ditemukan" };

  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: typeErrorMessage };
  }

  if (file.size > maxSize) {
    return { success: false, error: `Ukuran file maksimal ${Math.round(maxSize / 1024 / 1024)}MB.` };
  }

  // Nama file unik di folder milik user (sesuai kebijakan RLS storage)
  const ext = file.name.split(".").pop() ?? fallbackExt;
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

export async function uploadImage(
  formData: FormData,
  bucket: string = "photos"
): Promise<ActionResult & { url?: string }> {
  return uploadFile(
    formData,
    bucket,
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGE_SIZE,
    "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.",
    "jpg",
  );
}

export async function uploadAudio(
  formData: FormData,
  bucket: string = "audio"
): Promise<ActionResult & { url?: string }> {
  return uploadFile(
    formData,
    bucket,
    ALLOWED_AUDIO_TYPES,
    MAX_AUDIO_SIZE,
    "Format audio tidak didukung. Gunakan MP3, WAV, atau OGG.",
    "mp3",
  );
}
