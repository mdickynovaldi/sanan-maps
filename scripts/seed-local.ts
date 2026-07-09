/**
 * Seed lengkap untuk Supabase LOKAL: akun demo, kategori, outlet dengan
 * koordinat asli Kampung Sanan, review, produk, dan panorama 360 demo.
 *
 * Koordinat mengikuti Jalan Sanan (OSM way 148916551):
 * lat -7.9602..-7.9622, lon 112.6424..112.6455 (Purwantoro, Blimbing, Malang).
 *
 * Run: npx tsx --env-file=.env.local scripts/seed-local.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set (jalankan dengan --env-file=.env.local)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------- Demo accounts ----------
const USERS = [
  { email: "admin@sanan.local", password: "admin123456", name: "Admin Sanan", role: "admin" },
  { email: "owner@sanan.local", password: "owner123456", name: "Pemilik UMKM Demo", role: "owner" },
  { email: "budi@sanan.local", password: "budi123456", name: "Budi Santoso", role: "user" },
  { email: "siti@sanan.local", password: "siti123456", name: "Siti Rahma", role: "user" },
];

// ---------- Categories ----------
const CATEGORIES = [
  { name: "Keripik Tempe", slug: "keripik-tempe", description: "Keripik tempe khas Sanan dengan berbagai varian rasa", icon: "restaurant" },
  { name: "Oleh-oleh", slug: "oleh-oleh", description: "Pusat oleh-oleh khas Malang", icon: "shopping_bag" },
  { name: "Kuliner", slug: "kuliner", description: "Warung makan dan kuliner lokal", icon: "lunch_dining" },
  { name: "Kerajinan", slug: "kerajinan", description: "Kerajinan tangan dan produk kreatif", icon: "palette" },
  { name: "Minuman", slug: "minuman", description: "Minuman tradisional dan modern", icon: "local_cafe" },
  { name: "Tempe Segar", slug: "tempe-segar", description: "Tempe segar langsung dari produsen", icon: "eco" },
];

// ---------- Outlets (koordinat asli sepanjang Jl. Sanan & gang-gangnya) ----------
const OUTLETS = [
  { name: "Keripik Tempe Bu Noer", slug: "keripik-tempe-bu-noer", category: "keripik-tempe", latitude: -7.9612, longitude: 112.6437, description: "Pelopor keripik tempe Sanan dengan resep turun-temurun sejak 1985. Menawarkan berbagai varian rasa modern seperti balado, keju, dan original.", address: "Jl. Sanan No. 12, Kel. Purwantoro, Kec. Blimbing, Kota Malang", landmark_description: "Dari gapura Kampung Sanan, masuk lurus sekitar 120 meter. Outlet berada di sisi kanan jalan sebelum pertigaan kecil. Terdapat spanduk kuning di depan toko.", accessibility_description: "Pintu masuk lebar tanpa tangga dan akses ramah kursi roda. Jalan cukup untuk motor, mobil parkir di area depan gang.", whatsapp: "6281234567890", opening_hours: { "Senin-Jumat": "07:00 - 17:00", "Sabtu": "07:00 - 15:00", "Minggu": "Tutup" } },
  { name: "Sentra Oleh-Oleh Sanan", slug: "sentra-oleh-oleh-sanan", category: "oleh-oleh", latitude: -7.9618, longitude: 112.6427, description: "Pusat perbelanjaan satu atap untuk segala kebutuhan oleh-oleh khas Malang. Fasilitas parkir luas dan akses ramah kursi roda.", address: "Jl. Sanan No. 45, Kel. Purwantoro, Kec. Blimbing, Kota Malang", landmark_description: "Terletak di jalan utama Sanan, sekitar 50 meter dari gapura utama. Bangunan besar dengan papan nama biru.", accessibility_description: "Terdapat ramp landai, area parkir luas, dan toilet aksesibel. Lorong toko cukup lebar untuk kursi roda.", whatsapp: "6281234567891", opening_hours: { "Senin-Sabtu": "08:00 - 18:00", "Minggu": "08:00 - 14:00" } },
  { name: "Toko Tempe Sanan Jaya", slug: "toko-tempe-sanan-jaya", category: "keripik-tempe", latitude: -7.9617, longitude: 112.643, description: "Menyediakan berbagai varian keripik tempe khas Malang, dari rasa original hingga pedas manis. Berdiri sejak 1990.", address: "Jl. Sanan No. 28, Kel. Purwantoro, Kec. Blimbing, Kota Malang", landmark_description: "Tepat di sebelah gapura utama Kampung Sanan, ada banner merah di depan.", accessibility_description: "Lantai rata tanpa tangga, penerangan ruangan sangat baik.", whatsapp: "6281234567892", opening_hours: { "Senin-Sabtu": "06:30 - 17:00", "Minggu": "07:00 - 12:00" } },
  { name: "Warung Kopi Sanan", slug: "warung-kopi-sanan", category: "kuliner", latitude: -7.9608, longitude: 112.6437, description: "Warung kopi tradisional dengan suasana kampung yang autentik. Menyajikan kopi lokal dan jajanan pasar.", address: "Jl. Sanan Gang III No. 5, Kel. Purwantoro, Kota Malang", landmark_description: "Masuk gang ketiga dari gapura utama, sekitar 30 meter di sisi kiri. Ada kursi kayu di depan.", accessibility_description: "Gang cukup sempit untuk kursi roda. Lantai sedikit tidak rata. Tersedia kursi rendah.", whatsapp: "6281234567893", opening_hours: { "Senin-Minggu": "06:00 - 21:00" } },
  { name: "Kerajinan Bambu Pak Darmo", slug: "kerajinan-bambu-pak-darmo", category: "kerajinan", latitude: -7.9605, longitude: 112.6445, description: "Pengrajin bambu tradisional yang membuat berbagai produk kerajinan dari anyaman bambu hingga furniture mini.", address: "Jl. Sanan Gang V No. 8, Kel. Purwantoro, Kota Malang", landmark_description: "Masuk gang kelima, rumah dengan pagar bambu di sisi kanan.", accessibility_description: "Gang sempit, tidak cocok untuk kursi roda. Lantai tanah. Perlu bantuan untuk masuk.", whatsapp: "6281234567894", opening_hours: { "Senin-Sabtu": "08:00 - 16:00", "Minggu": "Tutup" } },
  { name: "Es Dawet Mbok Sri", slug: "es-dawet-mbok-sri", category: "minuman", latitude: -7.9614, longitude: 112.6441, description: "Es dawet legendaris Sanan yang sudah berjualan sejak 1978. Menggunakan resep turun-temurun dengan bahan alami.", address: "Jl. Sanan No. 18, Kel. Purwantoro, Kota Malang", landmark_description: "Di depan mushola kecil, gerobak hijau dengan payung besar.", accessibility_description: "Gerobak di pinggir jalan, mudah diakses. Tidak ada tempat duduk permanen.", whatsapp: "6281234567895", opening_hours: { "Senin-Minggu": "10:00 - 17:00" } },
  { name: "Keripik Tempe Ibu Haji", slug: "keripik-tempe-ibu-haji", category: "keripik-tempe", latitude: -7.9611, longitude: 112.6446, description: "Keripik tempe premium dengan bumbu rempah pilihan, dikemas untuk oleh-oleh.", address: "Jl. Sanan No. 33, Kel. Purwantoro, Kota Malang", landmark_description: "Setelah pertigaan pertama, toko dengan etalase kaca besar.", accessibility_description: "Pintu masuk cukup lebar. Ada satu anak tangga kecil.", whatsapp: "6281234567896", opening_hours: { "Senin-Sabtu": "07:00 - 16:00" } },
  { name: "Toko Kue Sanan Makmur", slug: "toko-kue-sanan-makmur", category: "oleh-oleh", latitude: -7.9615, longitude: 112.6435, description: "Aneka kue tradisional dan modern khas Malang, cocok untuk buah tangan.", address: "Jl. Sanan No. 22, Kel. Purwantoro, Kota Malang", landmark_description: "Di sebelah warung kelontong, ada banner merah bertuliskan nama toko.", accessibility_description: "Lantai rata, pintu lebar, bisa diakses kursi roda.", whatsapp: "6281234567897", opening_hours: { "Senin-Minggu": "06:00 - 20:00" } },
  { name: "Tempe Mendoan Bu Lastri", slug: "tempe-mendoan-bu-lastri", category: "kuliner", latitude: -7.9607, longitude: 112.6432, description: "Tempe mendoan goreng segar setiap hari, cocok untuk camilan sore.", address: "Jl. Sanan Gang II No. 3, Kel. Purwantoro, Kota Malang", landmark_description: "Gang kedua dari gapura, rumah dengan gerobak di depan.", accessibility_description: "Jalan gang cukup lebar untuk motor. Tidak ada tangga.", whatsapp: "6281234567898", opening_hours: { "Senin-Sabtu": "08:00 - 15:00" } },
  { name: "Batik Sanan Asri", slug: "batik-sanan-asri", category: "kerajinan", latitude: -7.9603, longitude: 112.6452, description: "Batik tulis dan cap khas Malang dengan motif lokal Sanan.", address: "Jl. Sanan No. 50, Kel. Purwantoro, Kota Malang", landmark_description: "Di ujung timur jalan utama Sanan, bangunan dua lantai dengan kain batik di jendela.", accessibility_description: "Lantai bawah aksesibel. Lantai atas hanya via tangga.", whatsapp: "6281234567899", opening_hours: { "Senin-Sabtu": "09:00 - 17:00" } },
  { name: "Warung Rawon Pak Eko", slug: "warung-rawon-pak-eko", category: "kuliner", latitude: -7.9619, longitude: 112.6426, description: "Rawon khas Malang dengan kuah hitam pekat dan daging empuk.", address: "Jl. Sanan No. 8, Kel. Purwantoro, Kota Malang", landmark_description: "Dekat gapura masuk, warung dengan meja kayu di luar.", accessibility_description: "Meja di luar mudah diakses. Bagian dalam warung agak sempit.", whatsapp: "6281234567800", opening_hours: { "Senin-Minggu": "07:00 - 14:00" } },
  { name: "Keripik Singkong Sanan", slug: "keripik-singkong-sanan", category: "oleh-oleh", latitude: -7.9613, longitude: 112.6444, description: "Keripik singkong aneka rasa: balado, keju, BBQ, dan original.", address: "Jl. Sanan No. 15, Kel. Purwantoro, Kota Malang", landmark_description: "Sebelah kanan jalan utama, toko kecil dengan rak keripik di depan.", accessibility_description: "Akses mudah dari jalan utama. Tidak ada tangga.", whatsapp: "6281234567801", opening_hours: { "Senin-Sabtu": "07:00 - 17:00" } },
  { name: "Tahu Crispy Sanan", slug: "tahu-crispy-sanan", category: "kuliner", latitude: -7.961, longitude: 112.644, description: "Tahu crispy goreng tepung renyah dengan sambal kecap khas.", address: "Jl. Sanan Gang IV No. 2, Kel. Purwantoro, Kota Malang", landmark_description: "Gang keempat, gerobak di pojok gang.", accessibility_description: "Di pinggir jalan gang, mudah dijangkau.", whatsapp: "6281234567802", opening_hours: { "Senin-Sabtu": "09:00 - 16:00" } },
  { name: "Sambal Pecel Bu Yanti", slug: "sambal-pecel-bu-yanti", category: "oleh-oleh", latitude: -7.9604, longitude: 112.6449, description: "Sambal pecel kacang khas Malang, tersedia kemasan oleh-oleh.", address: "Jl. Sanan No. 38, Kel. Purwantoro, Kota Malang", landmark_description: "Setelah toko batik, rumah dengan papan nama hijau.", accessibility_description: "Pintu masuk rata, cukup lebar untuk kursi roda.", whatsapp: "6281234567803", opening_hours: { "Senin-Sabtu": "06:00 - 15:00" } },
  { name: "Outlet Tempe Murni", slug: "outlet-tempe-murni", category: "tempe-segar", latitude: -7.9616, longitude: 112.6433, description: "Tempe segar berkualitas tinggi langsung dari produsen Sanan.", address: "Jl. Sanan Gang I No. 10, Kel. Purwantoro, Kota Malang", landmark_description: "Gang pertama dari gapura, rumah dengan tumpukan daun pisang.", accessibility_description: "Jalan gang lebar, bisa dilalui motor dan kursi roda.", whatsapp: "6281234567804", opening_hours: { "Senin-Minggu": "05:00 - 10:00" } },
];

const PRODUCTS: Record<string, Array<{ name: string; description: string; price: number; category: string }>> = {
  "keripik-tempe-bu-noer": [
    { name: "Keripik Tempe Original", description: "Keripik tempe renyah dengan bumbu original khas Sanan", price: 25000, category: "Keripik" },
    { name: "Keripik Tempe Balado", description: "Keripik tempe dengan bumbu balado pedas manis", price: 30000, category: "Keripik" },
    { name: "Keripik Tempe Keju", description: "Keripik tempe dengan taburan keju gurih", price: 35000, category: "Keripik" },
  ],
  "sentra-oleh-oleh-sanan": [
    { name: "Paket Oleh-oleh Malang", description: "Paket lengkap oleh-oleh khas Malang", price: 150000, category: "Paket" },
    { name: "Keripik Buah Apel", description: "Keripik apel Malang renyah dan manis alami", price: 35000, category: "Keripik" },
  ],
  "warung-kopi-sanan": [
    { name: "Kopi Hitam", description: "Kopi hitam tubruk khas Jawa", price: 5000, category: "Minuman" },
    { name: "Gorengan Campur", description: "Aneka gorengan: tahu, tempe, pisang, bakwan", price: 10000, category: "Makanan" },
  ],
};

const REVIEWS: Array<{ outlet: string; user: string; rating: number; comment: string; tags: string[] }> = [
  { outlet: "keripik-tempe-bu-noer", user: "budi@sanan.local", rating: 5, comment: "Tempe kripiknya renyah banget! Penjualnya ramah, dikasih tester banyak. Recommended!", tags: ["rasa", "pelayanan"] },
  { outlet: "keripik-tempe-bu-noer", user: "siti@sanan.local", rating: 4, comment: "Varian rasanya unik-unik. Sedikit susah cari parkir mobil, tapi worth it.", tags: ["rasa", "lokasi"] },
  { outlet: "sentra-oleh-oleh-sanan", user: "budi@sanan.local", rating: 5, comment: "Lengkap banget! Satu tempat bisa beli semua oleh-oleh Malang.", tags: ["pelayanan", "harga"] },
  { outlet: "toko-tempe-sanan-jaya", user: "siti@sanan.local", rating: 5, comment: "Keripik tempe paling enak di Sanan! Wajib coba yang pedas manis.", tags: ["rasa"] },
  { outlet: "warung-kopi-sanan", user: "budi@sanan.local", rating: 4, comment: "Kopi enak, suasana kampung yang asri. Cocok untuk santai sore.", tags: ["rasa", "lokasi"] },
  { outlet: "es-dawet-mbok-sri", user: "siti@sanan.local", rating: 5, comment: "Es dawet paling segar di Malang! Pas banget di siang hari.", tags: ["rasa"] },
];

async function ensureUser(u: (typeof USERS)[number]): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { name: u.name, role: u.role },
  });
  if (data?.user) return data.user.id;

  // Sudah ada — cari id-nya
  if (error) {
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
    const existing = list?.users.find((x) => x.email === u.email);
    if (existing) return existing.id;
    throw new Error(`Gagal membuat user ${u.email}: ${error.message}`);
  }
  throw new Error(`Gagal membuat user ${u.email}`);
}

async function seed() {
  console.log("== Users ==");
  const userIds: Record<string, string> = {};
  for (const u of USERS) {
    userIds[u.email] = await ensureUser(u);
    // handle_new_user trigger membuat profil; pastikan role sinkron
    await supabase.from("profiles").update({ role: u.role } as never).eq("id", userIds[u.email]);
    console.log(`  ✓ ${u.email} (${u.role})`);
  }

  console.log("== Categories ==");
  const { data: catRows, error: catErr } = await supabase
    .from("categories")
    .upsert(CATEGORIES as never[], { onConflict: "slug" })
    .select("id, slug");
  if (catErr) throw new Error(`categories: ${catErr.message}`);
  const catIds = Object.fromEntries((catRows ?? []).map((c: { id: string; slug: string }) => [c.slug, c.id]));
  console.log(`  ✓ ${catRows?.length} kategori`);

  console.log("== Outlets ==");
  const outletIds: Record<string, string> = {};
  for (const o of OUTLETS) {
    const { category, ...row } = o;
    const { data, error } = await supabase
      .from("outlets")
      .upsert({ ...row, status: "approved", owner_id: null } as never, { onConflict: "slug" })
      .select("id, slug")
      .single();
    if (error) {
      console.error(`  ✗ ${o.name}: ${error.message}`);
      continue;
    }
    const rec = data as { id: string; slug: string };
    outletIds[rec.slug] = rec.id;
    if (catIds[category]) {
      await supabase.from("outlet_categories").upsert(
        { outlet_id: rec.id, category_id: catIds[category] } as never,
        { onConflict: "outlet_id,category_id" }
      );
    }
    console.log(`  ✓ ${o.name}`);
  }

  console.log("== Products ==");
  for (const [slug, products] of Object.entries(PRODUCTS)) {
    const outletId = outletIds[slug];
    if (!outletId) continue;
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("outlet_id", outletId);
    if ((count ?? 0) > 0) {
      console.log(`  - ${slug}: sudah ada, lewati`);
      continue;
    }
    const { error } = await supabase.from("products").insert(
      products.map((p) => ({ ...p, outlet_id: outletId, is_available: true })) as never[]
    );
    console.log(error ? `  ✗ ${slug}: ${error.message}` : `  ✓ ${slug}: ${products.length} produk`);
  }

  console.log("== Reviews ==");
  for (const r of REVIEWS) {
    const outletId = outletIds[r.outlet];
    const userId = userIds[r.user];
    if (!outletId || !userId) continue;
    const { count } = await supabase
      .from("reviews").select("*", { count: "exact", head: true })
      .eq("outlet_id", outletId).eq("user_id", userId);
    if ((count ?? 0) > 0) continue;
    const { error } = await supabase.from("reviews").insert({
      outlet_id: outletId, user_id: userId, rating: r.rating,
      comment: r.comment, tags: r.tags, status: "approved",
    } as never);
    console.log(error ? `  ✗ ${r.outlet}: ${error.message}` : `  ✓ review ${r.outlet} oleh ${r.user}`);
  }

  console.log("== Panorama demo ==");
  const panoPath = join(process.cwd(), "scripts", "panorama-demo.png");
  const panoBytes = readFileSync(panoPath);
  const { error: upErr } = await supabase.storage
    .from("panoramas")
    .upload("seed/panorama-demo.png", panoBytes, { contentType: "image/png", upsert: true });
  if (upErr) {
    console.error(`  ✗ upload panorama: ${upErr.message}`);
  } else {
    const { data: urlData } = supabase.storage.from("panoramas").getPublicUrl("seed/panorama-demo.png");
    const buNoerId = outletIds["keripik-tempe-bu-noer"];
    if (buNoerId) {
      const { count } = await supabase.from("panoramas").select("*", { count: "exact", head: true }).eq("outlet_id", buNoerId);
      if ((count ?? 0) === 0) {
        const { error } = await supabase.from("panoramas").insert([
          {
            outlet_id: buNoerId,
            title: "Tampak Depan Toko",
            image_360_url: urlData.publicUrl,
            text_description:
              "Panorama 360 derajat demo di depan Keripik Tempe Bu Noer. Menghadap utara terlihat pintu masuk toko dengan spanduk kuning; ke timur jalan utama Sanan; ke selatan gapura kampung; ke barat deretan rumah warga.",
            latitude: -7.9612,
            longitude: 112.6437,
            heading: 0,
            order_index: 0,
          },
        ] as never[]);
        console.log(error ? `  ✗ panorama row: ${error.message}` : "  ✓ panorama Keripik Tempe Bu Noer");
      } else {
        console.log("  - panorama sudah ada, lewati");
      }
    }
  }

  console.log("\nSelesai. Akun demo:");
  for (const u of USERS) console.log(`  ${u.role.padEnd(5)} ${u.email} / ${u.password}`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
