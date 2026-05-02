import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function AccessibilityPage() {
  return (
    <>
      <Header activeNav="accessibility" />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          <div className="mb-12 max-w-3xl">
            <h1 className="font-heading text-h1 text-on-background">Aksesibilitas</h1>
            <p className="mt-4 text-body-lg text-on-surface-variant">
              Sanan Explorer berkomitmen untuk memastikan semua pengguna dapat mengakses informasi UMKM Sanan dengan mudah,
              termasuk pengguna dengan disabilitas netra, low vision, dan mobilitas fisik.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                icon: "contrast",
                title: "Mode Kontras Tinggi",
                description:
                  "Aktifkan mode kontras tinggi untuk meningkatkan visibilitas teks dan elemen UI. Cocok untuk pengguna low vision atau penggunaan di bawah sinar matahari.",
              },
              {
                icon: "text_increase",
                title: "Ukuran Teks Besar",
                description:
                  "Perbesar ukuran teks hingga 200% tanpa kehilangan konten atau fungsionalitas. Pengaturan dapat disimpan di profil Anda.",
              },
              {
                icon: "remove_red_eye",
                title: "Deskripsi Lokasi Berbasis Teks",
                description:
                  "Setiap outlet memiliki deskripsi lokasi detail dengan patokan, kondisi jalan, dan instruksi akses untuk navigasi tanpa peta visual.",
              },
              {
                icon: "wheelchair_pickup",
                title: "Filter Aksesibilitas",
                description:
                  "Filter outlet berdasarkan akses kursi roda, ketersediaan ramp, toilet aksesibel, dan jalur yang dapat dilalui.",
              },
              {
                icon: "volume_up",
                title: "Panduan Audio",
                description:
                  "Dengarkan ringkasan outlet dan instruksi arah melalui fitur text-to-speech terintegrasi.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 rounded-xl border border-outline-variant bg-surface p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                  <span className="material-symbols-outlined text-[28px]">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="font-heading text-h3 text-on-surface">{feature.title}</h3>
                  <p className="mt-2 text-body-md text-on-surface-variant">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-outline-variant bg-surface-container-low p-8">
            <h2 className="font-heading text-h2 text-on-background">Fitur Aksesibilitas di Halaman Ini</h2>
            <ul className="mt-4 list-disc list-inside space-y-2 text-body-md text-on-surface-variant">
              <li>Skip-to-content links untuk navigasi cepat</li>
              <li>Heading hierarchy yang jelas (H1 → H2 → H3)</li>
              <li>Focus indicators yang terlihat pada semua elemen interaktif</li>
              <li>ARIA labels pada tombol ikon</li>
              <li>Keyboard navigation penuh (Tab, Shift+Tab, Enter, Esc)</li>
              <li>Teks alternatif untuk semua gambar informatif</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}