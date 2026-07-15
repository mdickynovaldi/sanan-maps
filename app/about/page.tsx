import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function AboutPage() {
  return (
    <>
      <Header activeNav="about" />
      <main className="flex-1">
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          {/* Hero */}
          <section className="mb-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-high px-3 py-1 text-label-caps text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                Kelurahan Purwantoro, Malang
              </span>
              <h1 className="font-heading text-h1 text-on-background">Tentang Kampung Sanan</h1>
              <p className="text-body-lg text-on-surface-variant">
                Kampung Sanan di Kelurahan Purwantoro, Kecamatan Blimbing, Kota Malang dikenal sebagai sentra tempe
                dan keripik tempe yang berkembang turun-temurun. Diskopindag Kota Malang mencatat Sanan sebagai sentra
                penghasil tempe yang terkenal.
              </p>
              <p className="text-body-md text-on-surface-variant">
                Website ini hadir sebagai solusi digitalisasi informasi UMKM Sanan berbasis lokasi dengan pendekatan inklusif,
                membantu pengunjung menemukan outlet UMKM lokal secara cepat, akurat, dan aksesibel.
              </p>
            </div>
            <div className="relative h-[400px] overflow-hidden rounded-[2rem] shadow-[var(--shadow-level-2)]">
              <Image
                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80"
                alt="Suasana Kampung Sanan dengan sentra produksi keripik tempe"
                fill
                className="object-cover"
              />
            </div>
          </section>

          {/* Stats */}
          <section className="mb-16 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "120+", label: "UMKM Aktif", icon: "storefront" },
              { value: "50+", label: "Produk Unik", icon: "inventory_2" },
              { value: "10K+", label: "Kunjungan/Bulan", icon: "visibility" },
              { value: "4.8", label: "Rating Rata-rata", icon: "star" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface p-6 text-center shadow-sm">
                <span className="material-symbols-outlined mb-3 text-3xl text-primary-container">{stat.icon}</span>
                <p className="font-heading text-h2 text-on-surface">{stat.value}</p>
                <p className="text-body-sm text-on-surface-variant">{stat.label}</p>
              </div>
            ))}
          </section>

          {/* Mission */}
          <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 sm:p-8 md:p-12">
            <h2 className="font-heading text-h2 text-on-background">Visi & Misi</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-surface p-6">
                <h3 className="font-heading text-h3 text-on-surface">Visi</h3>
                <p className="mt-3 text-body-md text-on-surface-variant">
                  Menjadi platform digital pemetaan UMKM Sanan yang informatif, inklusif, mudah digunakan, dan membantu
                  pengunjung menemukan outlet UMKM lokal secara cepat, akurat, dan aksesibel.
                </p>
              </div>
              <div className="rounded-xl bg-surface p-6">
                <h3 className="font-heading text-h3 text-on-surface">Misi</h3>
                <ul className="mt-3 list-disc list-inside space-y-2 text-body-md text-on-surface-variant">
                  <li>Mendukung digitalisasi UMKM lokal</li>
                  <li>Mendorong promosi Kampung Sanan sebagai sentra tempe/keripik tempe</li>
                  <li>Menyediakan akses informasi yang inklusif untuk semua pengguna</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}