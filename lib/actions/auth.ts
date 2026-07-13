"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export type ActionResult = {
  success: boolean;
  error?: string;
};

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  // Utamakan x-real-ip: di-set oleh proxy tepercaya (mis. Vercel edge) ke IP
  // klien sebenarnya dan TIDAK bisa dipalsukan klien. Nilai paling-kiri dari
  // x-forwarded-for sepenuhnya dikendalikan klien (proxy meng-APPEND IP asli
  // di sebelah kanan), jadi memakainya untuk kunci rate-limit bisa di-bypass.
  const realIp = headerStore.get("x-real-ip");
  if (realIp) return realIp.trim();
  // Fallback: ambil entri PALING KANAN dari x-forwarded-for (yang ditambahkan
  // proxy terdekat), bukan paling kiri.
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return "unknown";
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  // Rate limit: 5 percobaan per menit per IP
  const ip = await getClientIp();
  const rl = await checkRateLimit("login", ip, 5, 60);
  if (!rl.success) {
    return { success: false, error: "Terlalu banyak percobaan login. Coba lagi dalam 1 menit." };
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Hormati deep-link ?redirect= dari middleware (hanya path internal),
  // selain itu arahkan ke dashboard sesuai role akun.
  const redirectParam = formData.get("redirect");
  if (typeof redirectParam === "string" && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
    redirect(redirectParam);
  }

  let destination = "/dashboard/user";
  if (signInData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", signInData.user.id)
      .single();
    const role = (profile as { role?: string } | null)?.role;
    if (role === "admin") destination = "/dashboard/admin";
    else if (role === "owner") destination = "/dashboard/owner";
  }

  redirect(destination);
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    role: (formData.get("role") as string) || "user",
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  // Rate limit: 10 pendaftaran per 10 menit per IP (cegah pembuatan akun massal;
  // dilonggarkan dari 3 agar tidak mengganggu fase QC/testing dari satu IP)
  const ip = await getClientIp();
  const rl = await checkRateLimit("signup", ip, 10, 600);
  if (!rl.success) {
    return { success: false, error: "Terlalu banyak percobaan pendaftaran. Coba lagi nanti." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        role: parsed.data.role,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/login?registered=true");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(formData: FormData): Promise<ActionResult> {
  const raw = { email: formData.get("email") as string };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  // Rate limit: 3 permintaan reset per 10 menit per IP
  const ip = await getClientIp();
  const rl = await checkRateLimit("reset", ip, 3, 600);
  if (!rl.success) {
    return { success: false, error: "Terlalu banyak permintaan reset. Coba lagi nanti." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard/user`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
