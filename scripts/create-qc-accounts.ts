/**
 * Membuat akun untuk tim QC (admin + visitor) di Supabase yang aktif (baca .env.local).
 * Idempotent: akun yang sudah ada di-skip, hanya role & nama-nya disinkronkan.
 *
 * Role admin di-set lewat service role (enforce_profile_role mengizinkan
 * auth.uid() null); trigger handle_new_user sendiri menolak admin dari metadata.
 *
 * Run: npx tsx --env-file=.env.local scripts/create-qc-accounts.ts
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
  { email: "qc-admin@sanan.local", password: "qcadmin123456", name: "QC Admin", role: "admin" },
  { email: "qc-visitor@sanan.local", password: "qcvisitor123456", name: "QC Visitor", role: "user" },
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

  // Set role final via service role (bypass RLS + enforce_profile_role).
  // handle_new_user hanya menyetel user/owner; admin harus di-update di sini.
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

  console.log("\nMembuat akun QC:");
  for (const a of ACCOUNTS) {
    await ensureAccount(a);
  }

  console.log("\nSelesai. Akun QC:");
  console.log("  Peran   Email                     Password");
  for (const a of ACCOUNTS) {
    console.log(`  ${a.role.padEnd(6)}  ${a.email.padEnd(24)}  ${a.password}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
