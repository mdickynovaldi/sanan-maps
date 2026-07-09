// ============================================================
// Mock data for Sanan UMKM Maps – frontend-only prototype
// ============================================================

export type Outlet = {
  id: number;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  longitude: number;
  latitude: number;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  distance: string;
  description: string;
  address: string;
  landmark: string;
  accessibility: string;
  whatsapp: string;
  image: string;
  openingHours: Record<string, string>;
  facilities: string[];
  products: Product[];
  reviews: Review[];
  status: "approved" | "pending" | "rejected" | "archived";
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  imageAlt: string;
  isAvailable: boolean;
  category: string;
};

export type Review = {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  tags: string[];
  status: "approved" | "pending" | "hidden";
  ownerReply?: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  outletCount: number;
  icon: string;
};

// ---- Categories ----
export const categories: Category[] = [
  { id: 1, name: "Keripik Tempe", slug: "keripik-tempe", description: "Keripik tempe khas Sanan dengan berbagai varian rasa", outletCount: 45, icon: "restaurant" },
  { id: 2, name: "Oleh-oleh", slug: "oleh-oleh", description: "Pusat oleh-oleh khas Malang", outletCount: 32, icon: "shopping_bag" },
  { id: 3, name: "Kuliner", slug: "kuliner", description: "Warung makan dan kuliner lokal", outletCount: 28, icon: "lunch_dining" },
  { id: 4, name: "Kerajinan", slug: "kerajinan", description: "Kerajinan tangan dan produk kreatif", outletCount: 15, icon: "palette" },
  { id: 5, name: "Minuman", slug: "minuman", description: "Minuman tradisional dan modern", outletCount: 12, icon: "local_cafe" },
  { id: 6, name: "Tempe Segar", slug: "tempe-segar", description: "Tempe segar langsung dari produsen", outletCount: 20, icon: "eco" },
];

// ---- Outlets ----
export const allOutlets: Outlet[] = [
  {
    id: 1,
    slug: "keripik-tempe-bu-noer",
    name: "Keripik Tempe Bu Noer",
    category: "Keripik Tempe",
    categorySlug: "keripik-tempe",
    longitude: 112.6437,
    latitude: -7.9612,
    rating: 4.9,
    reviewCount: 124,
    isOpen: true,
    distance: "120m",
    description: "Pelopor keripik tempe Sanan dengan resep turun-temurun sejak 1985. Menawarkan berbagai varian rasa modern seperti balado, keju, dan original.",
    address: "Jl. Sanan No. 12, Kelurahan Purwantoro, Kecamatan Blimbing, Kota Malang",
    landmark: "Dari gapura Kampung Sanan, masuk lurus sekitar 120 meter. Outlet berada di sisi kanan jalan sebelum pertigaan kecil. Terdapat spanduk kuning di depan toko.",
    accessibility: "Pintu masuk lebar tanpa tangga dan akses ramah kursi roda. Jalan cukup untuk motor, tetapi mobil perlu parkir di area depan gang.",
    whatsapp: "6281234567890",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    openingHours: { "Senin-Jumat": "07:00 - 17:00", "Sabtu": "07:00 - 15:00", "Minggu": "Tutup" },
    facilities: ["QRIS", "Parkir Motor", "Toilet"],
    status: "approved",
    products: [
      { id: 1, name: "Keripik Tempe Original", description: "Keripik tempe renyah dengan bumbu original khas Sanan", price: 25000, image: "https://images.unsplash.com/photo-1599351431202-6e0c051dd663?auto=format&fit=crop&w=800&q=80", imageAlt: "Keripik tempe original dalam kemasan plastik transparan", isAvailable: true, category: "Keripik" },
      { id: 2, name: "Keripik Tempe Balado", description: "Keripik tempe dengan bumbu balado pedas manis", price: 30000, image: "https://images.unsplash.com/photo-1599351431202-6e0c051dd663?auto=format&fit=crop&w=800&q=80", imageAlt: "Keripik tempe balado berwarna merah dalam kemasan", isAvailable: true, category: "Keripik" },
      { id: 3, name: "Keripik Tempe Keju", description: "Keripik tempe dengan taburan keju gurih", price: 35000, image: "https://images.unsplash.com/photo-1599351431202-6e0c051dd663?auto=format&fit=crop&w=800&q=80", imageAlt: "Keripik tempe keju dengan taburan keju kuning", isAvailable: true, category: "Keripik" },
      { id: 4, name: "Paket Oleh-oleh (3 rasa)", description: "Paket hemat berisi 3 varian rasa keripik tempe", price: 75000, image: "https://images.unsplash.com/photo-1599351431202-6e0c051dd663?auto=format&fit=crop&w=800&q=80", imageAlt: "Paket oleh-oleh berisi tiga bungkus keripik tempe", isAvailable: true, category: "Paket" },
    ],
    reviews: [
      { id: 1, userName: "Budi Santoso", rating: 5, comment: "Tempe kripiknya renyah banget! Penjualnya ramah, dikasih tester banyak. Recommended!", date: "2 hari lalu", tags: ["rasa", "pelayanan"], status: "approved" },
      { id: 2, userName: "Siti Rahma", rating: 4, comment: "Varian rasanya unik-unik. Sedikit susah cari parkir mobil, tapi worth it.", date: "1 minggu lalu", tags: ["rasa", "lokasi"], status: "approved", ownerReply: "Terima kasih reviewnya! Untuk parkir mobil bisa di depan gapura ya." },
      { id: 3, userName: "Andi Wijaya", rating: 5, comment: "Sudah langganan dari dulu. Kualitas selalu konsisten. Harga juga masih terjangkau.", date: "2 minggu lalu", tags: ["rasa", "harga"], status: "approved" },
    ],
  },
  {
    id: 2,
    slug: "sentra-oleh-oleh-sanan",
    name: "Sentra Oleh-Oleh Sanan",
    category: "Oleh-oleh",
    categorySlug: "oleh-oleh",
    longitude: 112.6427,
    latitude: -7.9618,
    rating: 4.7,
    reviewCount: 89,
    isOpen: false,
    distance: "350m",
    description: "Pusat perbelanjaan satu atap untuk segala kebutuhan oleh-oleh khas Malang. Fasilitas parkir luas dan akses ramah kursi roda.",
    address: "Jl. Sanan No. 45, Kelurahan Purwantoro, Kecamatan Blimbing, Kota Malang",
    landmark: "Terletak di jalan utama Sanan, sekitar 50 meter dari gapura utama. Bangunan besar dengan papan nama biru.",
    accessibility: "Terdapat ramp landai, area parkir luas, dan toilet aksesibel. Lorong toko cukup lebar untuk kursi roda.",
    whatsapp: "6281234567891",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    openingHours: { "Senin-Sabtu": "08:00 - 18:00", "Minggu": "08:00 - 14:00" },
    facilities: ["QRIS", "Parkir Mobil", "Parkir Motor", "Toilet", "AC"],
    status: "approved",
    products: [
      { id: 5, name: "Paket Oleh-oleh Malang", description: "Paket lengkap oleh-oleh khas Malang", price: 150000, image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=800&q=80", imageAlt: "Paket oleh-oleh Malang dalam kotak hadiah", isAvailable: true, category: "Paket" },
      { id: 6, name: "Keripik Buah Apel", description: "Keripik apel Malang renyah dan manis alami", price: 35000, image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=800&q=80", imageAlt: "Keripik buah apel dalam kemasan", isAvailable: true, category: "Keripik" },
    ],
    reviews: [
      { id: 4, userName: "Rina Wati", rating: 5, comment: "Lengkap banget! Satu tempat bisa beli semua oleh-oleh Malang.", date: "3 hari lalu", tags: ["pelayanan", "harga"], status: "approved" },
      { id: 5, userName: "Doni Pratama", rating: 4, comment: "Tempatnya nyaman dan bersih. Harga agak lebih mahal dari toko kecil tapi worth it.", date: "1 minggu lalu", tags: ["harga", "lokasi"], status: "approved" },
    ],
  },
  {
    id: 3,
    slug: "toko-tempe-sanan-jaya",
    name: "Toko Tempe Sanan Jaya",
    category: "Keripik Tempe",
    categorySlug: "keripik-tempe",
    longitude: 112.6430,
    latitude: -7.9617,
    rating: 4.8,
    reviewCount: 67,
    isOpen: true,
    distance: "250m",
    description: "Menyediakan berbagai varian keripik tempe khas Malang, dari rasa original hingga pedas manis. Berdiri sejak 1990.",
    address: "Jl. Sanan No. 28, Kelurahan Purwantoro, Kecamatan Blimbing, Kota Malang",
    landmark: "Tepat di sebelah gapura utama Desa Sanan, penerangan ruangan sangat baik. Ada banner merah di depan.",
    accessibility: "Tepat di sebelah gapura utama Desa Sanan, penerangan ruangan sangat baik. Lantai rata tanpa tangga.",
    whatsapp: "6281234567892",
    image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
    openingHours: { "Senin-Sabtu": "06:30 - 17:00", "Minggu": "07:00 - 12:00" },
    facilities: ["QRIS", "Parkir Motor"],
    status: "approved",
    products: [
      { id: 7, name: "Keripik Tempe Pedas Manis", description: "Perpaduan rasa pedas dan manis yang pas", price: 28000, image: "https://images.unsplash.com/photo-1599351431202-6e0c051dd663?auto=format&fit=crop&w=800&q=80", imageAlt: "Keripik tempe pedas manis dalam kemasan", isAvailable: true, category: "Keripik" },
      { id: 8, name: "Tempe Segar 1kg", description: "Tempe segar langsung dari produsen", price: 15000, image: "https://images.unsplash.com/photo-1599351431202-6e0c051dd663?auto=format&fit=crop&w=800&q=80", imageAlt: "Tempe segar dibungkus daun pisang", isAvailable: true, category: "Tempe" },
    ],
    reviews: [
      { id: 6, userName: "Maya Sari", rating: 5, comment: "Keripik tempe paling enak di Sanan! Wajib coba yang pedas manis.", date: "5 hari lalu", tags: ["rasa"], status: "approved" },
    ],
  },
  {
    id: 4,
    slug: "warung-kopi-sanan",
    name: "Warung Kopi Sanan",
    category: "Kuliner",
    categorySlug: "kuliner",
    longitude: 112.6437,
    latitude: -7.9608,
    rating: 4.5,
    reviewCount: 42,
    isOpen: true,
    distance: "180m",
    description: "Warung kopi tradisional dengan suasana kampung yang autentik. Menyajikan kopi lokal dan jajanan pasar.",
    address: "Jl. Sanan Gang III No. 5, Kelurahan Purwantoro, Kota Malang",
    landmark: "Masuk gang ketiga dari gapura utama, sekitar 30 meter di sisi kiri. Ada kursi kayu di depan.",
    accessibility: "Gang cukup sempit untuk kursi roda. Lantai sedikit tidak rata. Tersedia kursi rendah.",
    whatsapp: "6281234567893",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    openingHours: { "Senin-Minggu": "06:00 - 21:00" },
    facilities: ["Parkir Motor"],
    status: "approved",
    products: [
      { id: 9, name: "Kopi Hitam", description: "Kopi hitam tubruk khas Jawa", price: 5000, image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80", imageAlt: "Secangkir kopi hitam tubruk", isAvailable: true, category: "Minuman" },
      { id: 10, name: "Gorengan Campur", description: "Aneka gorengan: tahu, tempe, pisang, bakwan", price: 10000, image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80", imageAlt: "Piring berisi aneka gorengan", isAvailable: true, category: "Makanan" },
    ],
    reviews: [
      { id: 7, userName: "Agus Setiawan", rating: 4, comment: "Kopi enak, suasana kampung yang asri. Cocok untuk santai sore.", date: "1 minggu lalu", tags: ["rasa", "lokasi"], status: "approved" },
    ],
  },
  {
    id: 5,
    slug: "kerajinan-bambu-pak-darmo",
    name: "Kerajinan Bambu Pak Darmo",
    category: "Kerajinan",
    categorySlug: "kerajinan",
    longitude: 112.6445,
    latitude: -7.9605,
    rating: 4.6,
    reviewCount: 23,
    isOpen: true,
    distance: "300m",
    description: "Pengrajin bambu tradisional yang membuat berbagai produk kerajinan dari anyaman bambu hingga furniture mini.",
    address: "Jl. Sanan Gang V No. 8, Kelurahan Purwantoro, Kota Malang",
    landmark: "Masuk gang kelima, rumah dengan pagar bambu di sisi kanan. Terdengar suara pengrajin bekerja.",
    accessibility: "Gang sempit, tidak cocok untuk kursi roda. Lantai tanah. Perlu bantuan untuk masuk.",
    whatsapp: "6281234567894",
    image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
    openingHours: { "Senin-Sabtu": "08:00 - 16:00", "Minggu": "Tutup" },
    facilities: [],
    status: "approved",
    products: [
      { id: 11, name: "Keranjang Bambu", description: "Keranjang anyaman bambu handmade", price: 45000, image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=800&q=80", imageAlt: "Keranjang anyaman bambu berbentuk bulat", isAvailable: true, category: "Kerajinan" },
    ],
    reviews: [],
  },
  {
    id: 6,
    slug: "es-dawet-mbok-sri",
    name: "Es Dawet Mbok Sri",
    category: "Minuman",
    categorySlug: "minuman",
    longitude: 112.6441,
    latitude: -7.9614,
    rating: 4.4,
    reviewCount: 56,
    isOpen: true,
    distance: "200m",
    description: "Es dawet legendaris Sanan yang sudah berjualan sejak 1978. Menggunakan resep turun-temurun dengan bahan alami.",
    address: "Jl. Sanan No. 18, Kelurahan Purwantoro, Kota Malang",
    landmark: "Di depan mushola kecil, gerobak hijau dengan payung besar.",
    accessibility: "Gerobak di pinggir jalan, mudah diakses. Tidak ada tempat duduk permanen.",
    whatsapp: "6281234567895",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    openingHours: { "Senin-Minggu": "10:00 - 17:00" },
    facilities: [],
    status: "approved",
    products: [
      { id: 12, name: "Es Dawet Original", description: "Es dawet dengan santan segar dan gula merah", price: 8000, image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80", imageAlt: "Gelas es dawet dengan santan dan gula merah", isAvailable: true, category: "Minuman" },
    ],
    reviews: [
      { id: 8, userName: "Lina Kusuma", rating: 5, comment: "Es dawet paling enak di Malang! Segar banget di siang hari.", date: "3 hari lalu", tags: ["rasa"], status: "approved" },
    ],
  },
];

// Backward compat
export const featuredOutlets = allOutlets.slice(0, 3);

// ---- Dashboard Stats ----
export const dashboardStats = {
  user: {
    name: "Sarah Jenkins",
    level: "Explorer Level 3",
    email: "sarah@example.com",
    phone: "+62 812-3456-7890",
    joinDate: "Januari 2026",
    totalReviews: 8,
    totalFavorites: 5,
  },
  owner: {
    outletName: "Keripik Tempe Bu Noer",
    profileViews: "1.2k",
    directions: "342",
    averageRating: "4.8",
    totalProducts: 4,
    totalReviews: 124,
    whatsappClicks: 89,
  },
  admin: {
    totalOutlets: 142,
    approvedOutlets: 128,
    pendingVerification: 28,
    reportedIssues: 15,
    totalUsers: 1250,
    totalReviews: 890,
    accessibilityScore: 78,
  },
};

// ---- Reports ----
export type Report = {
  id: number;
  outletName: string;
  type: string;
  description: string;
  status: "open" | "in_review" | "resolved" | "rejected";
  date: string;
  reporter: string;
};

export const mockReports: Report[] = [
  { id: 1, outletName: "Keripik Tempe Bu Noer", type: "wrong_hours", description: "Jam buka di hari Sabtu seharusnya sampai jam 16:00, bukan 15:00", status: "open", date: "1 hari lalu", reporter: "Budi S." },
  { id: 2, outletName: "Sentra Oleh-Oleh Sanan", type: "wrong_location", description: "Pin lokasi terlalu jauh ke utara, seharusnya lebih dekat ke gapura", status: "in_review", date: "3 hari lalu", reporter: "Rina W." },
  { id: 3, outletName: "Warung Kopi Sanan", type: "accessibility_issue", description: "Informasi aksesibilitas tidak akurat, gang sebenarnya cukup lebar untuk kursi roda", status: "open", date: "5 hari lalu", reporter: "Agus S." },
  { id: 4, outletName: "Es Dawet Mbok Sri", type: "other", description: "Outlet sudah pindah lokasi ke seberang jalan", status: "resolved", date: "1 minggu lalu", reporter: "Maya S." },
];

// ---- Audit Logs ----
export type AuditLog = {
  id: number;
  actor: string;
  action: string;
  entityType: string;
  entityName: string;
  date: string;
};

export const mockAuditLogs: AuditLog[] = [
  { id: 1, actor: "Admin", action: "approve", entityType: "outlet", entityName: "Keripik Tempe Bu Noer", date: "1 jam lalu" },
  { id: 2, actor: "Admin", action: "update", entityType: "outlet", entityName: "Sentra Oleh-Oleh Sanan", date: "3 jam lalu" },
  { id: 3, actor: "Admin", action: "hide", entityType: "review", entityName: "Review #45 - Spam content", date: "5 jam lalu" },
  { id: 4, actor: "Admin", action: "resolve", entityType: "report", entityName: "Report #12 - Wrong location", date: "1 hari lalu" },
  { id: 5, actor: "Admin", action: "create", entityType: "category", entityName: "Tempe Segar", date: "2 hari lalu" },
];
