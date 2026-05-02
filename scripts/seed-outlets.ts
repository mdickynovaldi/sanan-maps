/**
 * Seed script: Insert 15 real Sanan outlets into Supabase.
 * Run with: npx tsx scripts/seed-outlets.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

const outlets = [
  { name: "Keripik Tempe Bu Noer", slug: "keripik-tempe-bu-noer", description: "Pelopor keripik tempe Sanan dengan resep turun-temurun sejak 1985. Menawarkan berbagai varian rasa modern.", address: "Jl. Sanan No. 12, Kel. Purwantoro, Kec. Blimbing, Kota Malang", latitude: -7.9755, longitude: 112.6340, landmark_description: "Dari gapura Kampung Sanan, masuk lurus sekitar 120 meter. Outlet berada di sisi kanan jalan sebelum pertigaan kecil. Terdapat spanduk kuning di depan toko.", accessibility_description: "Pintu masuk lebar tanpa tangga dan akses ramah kursi roda. Jalan cukup untuk motor.", whatsapp: "6281234567890", opening_hours: { "Senin-Jumat": "07:00 - 17:00", "Sabtu": "07:00 - 15:00", "Minggu": "Tutup" }, status: "approved" },
  { name: "Sentra Oleh-Oleh Sanan", slug: "sentra-oleh-oleh-sanan", description: "Pusat perbelanjaan satu atap untuk segala kebutuhan oleh-oleh khas Malang.", address: "Jl. Sanan No. 45, Kel. Purwantoro, Kec. Blimbing, Kota Malang", latitude: -7.9780, longitude: 112.6285, landmark_description: "Terletak di jalan utama Sanan, sekitar 50 meter dari gapura utama. Bangunan besar dengan papan nama biru.", accessibility_description: "Terdapat ramp landai, area parkir luas, dan toilet aksesibel.", whatsapp: "6281234567891", opening_hours: { "Senin-Sabtu": "08:00 - 18:00", "Minggu": "08:00 - 14:00" }, status: "approved" },
  { name: "Toko Tempe Sanan Jaya", slug: "toko-tempe-sanan-jaya", description: "Menyediakan berbagai varian keripik tempe khas Malang, dari rasa original hingga pedas manis.", address: "Jl. Sanan No. 28, Kel. Purwantoro, Kec. Blimbing, Kota Malang", latitude: -7.9740, longitude: 112.6320, landmark_description: "Tepat di sebelah gapura utama Desa Sanan, penerangan ruangan sangat baik.", accessibility_description: "Lantai rata tanpa tangga. Penerangan baik.", whatsapp: "6281234567892", opening_hours: { "Senin-Sabtu": "06:30 - 17:00", "Minggu": "07:00 - 12:00" }, status: "approved" },
  { name: "Warung Kopi Sanan", slug: "warung-kopi-sanan", description: "Warung kopi tradisional dengan suasana kampung yang autentik.", address: "Jl. Sanan Gang III No. 5, Kel. Purwantoro, Kota Malang", latitude: -7.9762, longitude: 112.6305, landmark_description: "Masuk gang ketiga dari gapura utama, sekitar 30 meter di sisi kiri.", accessibility_description: "Gang cukup sempit untuk kursi roda. Lantai sedikit tidak rata.", whatsapp: "6281234567893", opening_hours: { "Senin-Minggu": "06:00 - 21:00" }, status: "approved" },
  { name: "Kerajinan Bambu Pak Darmo", slug: "kerajinan-bambu-pak-darmo", description: "Pengrajin bambu tradisional yang membuat berbagai produk kerajinan.", address: "Jl. Sanan Gang V No. 8, Kel. Purwantoro, Kota Malang", latitude: -7.9748, longitude: 112.6330, landmark_description: "Masuk gang kelima, rumah dengan pagar bambu di sisi kanan.", accessibility_description: "Gang sempit, tidak cocok untuk kursi roda. Lantai tanah.", whatsapp: "6281234567894", opening_hours: { "Senin-Sabtu": "08:00 - 16:00", "Minggu": "Tutup" }, status: "approved" },
  { name: "Es Dawet Mbok Sri", slug: "es-dawet-mbok-sri", description: "Es dawet legendaris Sanan yang sudah berjualan sejak 1978.", address: "Jl. Sanan No. 18, Kel. Purwantoro, Kota Malang", latitude: -7.9770, longitude: 112.6315, landmark_description: "Di depan mushola kecil, gerobak hijau dengan payung besar.", accessibility_description: "Gerobak di pinggir jalan, mudah diakses.", whatsapp: "6281234567895", opening_hours: { "Senin-Minggu": "10:00 - 17:00" }, status: "approved" },
  { name: "Keripik Tempe Ibu Haji", slug: "keripik-tempe-ibu-haji", description: "Keripik tempe premium dengan bumbu rempah pilihan.", address: "Jl. Sanan No. 33, Kel. Purwantoro, Kota Malang", latitude: -7.9758, longitude: 112.6325, landmark_description: "Setelah pertigaan pertama, toko dengan etalase kaca besar.", accessibility_description: "Pintu masuk cukup lebar. Ada satu anak tangga kecil.", whatsapp: "6281234567896", opening_hours: { "Senin-Sabtu": "07:00 - 16:00" }, status: "approved" },
  { name: "Toko Kue Sanan Makmur", slug: "toko-kue-sanan-makmur", description: "Aneka kue tradisional dan modern khas Malang.", address: "Jl. Sanan No. 22, Kel. Purwantoro, Kota Malang", latitude: -7.9765, longitude: 112.6310, landmark_description: "Di sebelah warung kelontong, ada banner merah bertuliskan nama toko.", accessibility_description: "Lantai rata, pintu lebar, bisa diakses kursi roda.", whatsapp: "6281234567897", opening_hours: { "Senin-Minggu": "06:00 - 20:00" }, status: "approved" },
  { name: "Tempe Mendoan Bu Lastri", slug: "tempe-mendoan-bu-lastri", description: "Tempe mendoan goreng segar setiap hari, cocok untuk camilan.", address: "Jl. Sanan Gang II No. 3, Kel. Purwantoro, Kota Malang", latitude: -7.9752, longitude: 112.6318, landmark_description: "Gang kedua dari gapura, rumah dengan gerobak di depan.", accessibility_description: "Jalan gang cukup lebar untuk motor. Tidak ada tangga.", whatsapp: "6281234567898", opening_hours: { "Senin-Sabtu": "08:00 - 15:00" }, status: "approved" },
  { name: "Batik Sanan Asri", slug: "batik-sanan-asri", description: "Batik tulis dan cap khas Malang dengan motif lokal.", address: "Jl. Sanan No. 50, Kel. Purwantoro, Kota Malang", latitude: -7.9775, longitude: 112.6295, landmark_description: "Di ujung jalan utama Sanan, bangunan dua lantai dengan kain batik di jendela.", accessibility_description: "Lantai bawah aksesibel. Lantai atas via tangga.", whatsapp: "6281234567899", opening_hours: { "Senin-Sabtu": "09:00 - 17:00" }, status: "approved" },
  { name: "Warung Rawon Pak Eko", slug: "warung-rawon-pak-eko", description: "Rawon khas Malang dengan kuah hitam pekat dan daging empuk.", address: "Jl. Sanan No. 8, Kel. Purwantoro, Kota Malang", latitude: -7.9745, longitude: 112.6335, landmark_description: "Dekat gapura masuk, warung dengan meja kayu di luar.", accessibility_description: "Meja di luar mudah diakses. Dalam warung agak sempit.", whatsapp: "6281234567800", opening_hours: { "Senin-Minggu": "07:00 - 14:00" }, status: "approved" },
  { name: "Keripik Singkong Sanan", slug: "keripik-singkong-sanan", description: "Keripik singkong aneka rasa: balado, keju, BBQ, dan original.", address: "Jl. Sanan No. 15, Kel. Purwantoro, Kota Malang", latitude: -7.9760, longitude: 112.6322, landmark_description: "Sebelah kanan jalan utama, toko kecil dengan rak keripik di depan.", accessibility_description: "Akses mudah dari jalan utama. Tidak ada tangga.", whatsapp: "6281234567801", opening_hours: { "Senin-Sabtu": "07:00 - 17:00" }, status: "approved" },
  { name: "Tahu Crispy Sanan", slug: "tahu-crispy-sanan", description: "Tahu crispy goreng tepung renyah dengan sambal kecap.", address: "Jl. Sanan Gang IV No. 2, Kel. Purwantoro, Kota Malang", latitude: -7.9768, longitude: 112.6308, landmark_description: "Gang keempat, gerobak di pojok gang.", accessibility_description: "Di pinggir jalan gang, mudah dijangkau.", whatsapp: "6281234567802", opening_hours: { "Senin-Sabtu": "09:00 - 16:00" }, status: "approved" },
  { name: "Sambal Pecel Bu Yanti", slug: "sambal-pecel-bu-yanti", description: "Sambal pecel kacang khas Malang, tersedia kemasan oleh-oleh.", address: "Jl. Sanan No. 38, Kel. Purwantoro, Kota Malang", latitude: -7.9772, longitude: 112.6300, landmark_description: "Setelah toko batik, rumah dengan papan nama hijau.", accessibility_description: "Pintu masuk rata, cukup lebar.", whatsapp: "6281234567803", opening_hours: { "Senin-Sabtu": "06:00 - 15:00" }, status: "approved" },
  { name: "Outlet Tempe Murni", slug: "outlet-tempe-murni", description: "Tempe segar berkualitas tinggi langsung dari produsen.", address: "Jl. Sanan Gang I No. 10, Kel. Purwantoro, Kota Malang", latitude: -7.9750, longitude: 112.6328, landmark_description: "Gang pertama dari gapura, rumah dengan tumpukan daun pisang.", accessibility_description: "Jalan gang lebar, bisa dilalui motor dan kursi roda.", whatsapp: "6281234567804", opening_hours: { "Senin-Minggu": "05:00 - 10:00" }, status: "approved" },
];

async function seed() {
  console.log("Seeding outlets...");

  for (const outlet of outlets) {
    const { error } = await supabase.from("outlets").upsert(
      { ...outlet, opening_hours: outlet.opening_hours as unknown },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`Failed to seed ${outlet.name}:`, error.message);
    } else {
      console.log(`  ✓ ${outlet.name}`);
    }
  }

  console.log("\nDone! Seeded", outlets.length, "outlets.");
}

seed().catch(console.error);
