/**
 * Membuat akun demo (UMKM owner + visitor) di Supabase yang aktif (baca .env.local).
 * Idempotent: akun yang sudah ada di-skip, hanya role-nya disinkronkan.
 *
 * Run: npx tsx --env-file=.env.local scripts/create-demo-accounts.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set (jalankan dengan --env-file=.env.local)");
  process.exit(1);
}

console.log(`Target Supabase: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ACCOUNTS = [
  { email: "umkm1@sanan.local", password: "umkm123456", name: "Pemilik UMKM Satu", role: "owner" },
  { email: "umkm2@sanan.local", password: "umkm123456", name: "Pemilik UMKM Dua", role: "owner" },
  { email: "visitor1@sanan.local", password: "visitor123456", name: "Pengunjung Satu", role: "user" },
  { email: "visitor2@sanan.local", password: "visitor123456", name: "Pengunjung Dua", role: "user" },
];

async function ensureAccount(a: (typeof ACCOUNTS)[number]) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: a.email,
    password: a.password,
    email_confirm: true,
    user_metadata: { name: a.name, role: a.role },
  });

  let userId: string | null = data?.user?.id ?? null;

  if (!userId && error) {
    // Kemungkinan sudah ada — cari id-nya.
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
    const existing = list?.users.find((u) => u.email === a.email);
    if (!existing) throw new Error(`Gagal membuat ${a.email}: ${error.message}`);
    userId = existing.id;
    console.log(`  - ${a.email} sudah ada, sinkronkan role`);
  } else {
    console.log(`  ✓ ${a.email} dibuat`);
  }

  // Pastikan profil punya role yang benar (trigger handle_new_user hanya
  // mengizinkan user/owner; admin harus di-set manual — di sini owner/user aman).
  const { error: profErr } = await supabase
    .from("profiles")
    .update({ role: a.role, name: a.name } as never)
    .eq("id", userId!);
  if (profErr) throw new Error(`Gagal set role ${a.email}: ${profErr.message}`);
}

async function main() {
  // Sanity check: pastikan tabel profiles ada (skema sudah dimigrasi).
  const { error: schemaErr } = await supabase.from("profiles").select("id", { count: "exact", head: true });
  if (schemaErr) {
    console.error(`Skema belum siap di database ini (tabel profiles tidak terbaca): ${schemaErr.message}`);
    console.error("Pastikan migration 0001-0004 sudah diterapkan di proyek production.");
    process.exit(1);
  }

  console.log("\nMembuat akun:");
  for (const a of ACCOUNTS) {
    await ensureAccount(a);
  }

  console.log("\nSelesai. Akun demo:");
  console.log("  Peran   Email                  Password");
  for (const a of ACCOUNTS) {
    console.log(`  ${a.role.padEnd(6)}  ${a.email.padEnd(21)}  ${a.password}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
