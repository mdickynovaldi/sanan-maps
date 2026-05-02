import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <Header activeNav="about" />
      <main className="flex-1">
        <div className="mx-auto max-w-[800px] px-6 py-12">
          <h1 className="font-heading text-h1 text-on-background mb-8">Privacy Policy</h1>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="font-heading text-h2 text-on-surface mb-4">1. Data yang Kami Kumpulkan</h2>
              <p className="text-body-md text-on-surface-variant mb-4">
                Kami mengumpulkan informasi yang Anda berikan langsung kepada kami, termasuk:
              </p>
              <ul className="list-disc list-inside space-y-2 text-body-md text-on-surface-variant">
                <li>Informasi akun (nama, email, password)</li>
                <li>Preferensi aksesibilitas</li>
                <li>Review dan rating yang Anda tulis</li>
                <li>Outlet yang Anda simpan sebagai favorit</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-h2 text-on-surface mb-4">2. Bagaimana Kami Menggunakan Data</h2>
              <p className="text-body-md text-on-surface-variant mb-4">
                Data yang kami gunakan untuk:
              </p>
              <ul className="list-disc list-inside space-y-2 text-body-md text-on-surface-variant">
                <li>Menyediakan dan memelihara layanan Sanan Explorer</li>
                <li>Meningkatkan aksesibilitas platform</li>
                <li>Memoderasi review dan laporan</li>
                <li>Mengirimkan notifikasi penting terkait akun</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-h2 text-on-surface mb-4">3. Berbagi Data</h2>
              <p className="text-body-md text-on-surface-variant mb-4">
                Kami tidak menjual atau menyewakan data pribadi Anda. Data dapat dibagikan dengan:
              </p>
              <ul className="list-disc list-inside space-y-2 text-body-md text-on-surface-variant">
                <li>Penyedia layanan (hosting, analytics) yang terikat dengan kerahasiaan</li>
                <li>Pemilik UMKM untuk review yang Anda tulis tentang outlet mereka</li>
                <li>Pihak berwenang jika diwajibkan oleh hukum</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-h2 text-on-surface mb-4">4. Keamanan Data</h2>
              <p className="text-body-md text-on-surface-variant mb-4">
                Kami menggunakan langkah-langkah keamanan teknis dan organisasi untuk melindungi data Anda, termasuk:
              </p>
              <ul className="list-disc list-inside space-y-2 text-body-md text-on-surface-variant">
                <li>Enkripsi data dalam transmisi</li>
                <li>Row Level Security (RLS) pada database</li>
                <li>Access control berbasis role</li>
                <li>Audit log untuk aksi penting</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-h2 text-on-surface mb-4">5. Hak Anda</h2>
              <p className="text-body-md text-on-surface-variant mb-4">
                Anda memiliki hak untuk:
              </p>
              <ul className="list-disc list-inside space-y-2 text-body-md text-on-surface-variant">
                <li>Mengakses data pribadi Anda</li>
                <li>Memperbarui atau mengoreksi data</li>
                <li>Menghapus akun Anda</li>
                <li>Menarik persetujuan pemrosesan data</li>
                <li>Mengekspor data Anda dalam format yang dapat dibaca mesin</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-h2 text-on-surface mb-4">6. Kontak</h2>
              <p className="text-body-md text-on-surface-variant">
                Untuk pertanyaan mengenai privasi, hubungi kami di:{' '}
                <Link href="mailto:privacy@sananexplorer.id" className="text-primary hover:underline">
                  privacy@sananexplorer.id
                </Link>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}