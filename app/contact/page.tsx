import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function ContactPage() {
  return (
    <>
      <Header activeNav="about" />
      <main className="flex-1">
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          <div className="mb-12">
            <h1 className="font-heading text-h1 text-on-background mb-4">Hubungi Kami</h1>
            <p className="text-body-lg text-on-surface-variant">
              Punya pertanyaan, saran, atau ingin mendaftarkan UMKM Anda? Kami siap membantu!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                      <span className="material-symbols-outlined text-[28px]">location_on</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-h3 text-on-surface">Alamat Kantor</h3>
                      <p className="text-body-md text-on-surface-variant">
                        Kelurahan Purwantoro, Kecamatan Blimbing<br />
                        Kota Malang, Jawa Timur
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                      <span className="material-symbols-outlined text-[28px]">email</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-h3 text-on-surface">Email</h3>
                      <p className="text-body-md text-on-surface-variant">
                        <Link href="mailto:info@sananexplorer.id" className="text-primary hover:underline">
                          info@sananexplorer.id
                        </Link>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container">
                      <span className="material-symbols-outlined text-[28px]">phone</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-h3 text-on-surface">Telepon / WhatsApp</h3>
                      <p className="text-body-md text-on-surface-variant">
                        <Link href="https://wa.me/6281234567890" className="text-primary hover:underline">
                          +62 812-3456-7890
                        </Link>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-h3 text-on-surface mb-6">Kirim Pesan</h3>
                <form className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-label-caps text-on-surface uppercase">Nama Lengkap</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Masukkan nama Anda"
                      className="h-10 px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-label-caps text-on-surface uppercase">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="h-10 px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="subject" className="text-label-caps text-on-surface uppercase">Subjek</label>
                    <select
                      id="subject"
                      className="h-10 px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>Pilih subjek...</option>
                      <option>Umum</option>
                      <option>Daftar UMKM</option>
                      <option>Laporan masalah</option>
                      <option>Kemitraan</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-label-caps text-on-surface uppercase">Pesan</label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Tulis pesan Anda..."
                      className="px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary-container text-on-primary-container">
                    Kirim Pesan
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 sm:p-8">
            <h2 className="font-heading text-h2 text-on-background mb-6">Pertanyaan Umum</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Bagaimana cara mendaftarkan UMKM saya?",
                  a: "Anda bisa mendaftar melalui halaman Register dengan memilih role 'UMKM Owner'. Setelah itu, admin akan memverifikasi pengajuan Anda."
                },
                {
                  q: "Apakah layanan ini gratis?",
                  a: "Ya, Sanan Explorer sepenuhnya gratis untuk pengunjung dan pemilik UMKM."
                },
                {
                  q: "Bagaimana jika ada data outlet yang salah?",
                  a: "Gunakan fitur 'Laporkan Data Salah' di halaman detail outlet untuk memberitahu kami."
                },
                {
                  q: "Apakah saya bisa menghapus review?",
                  a: "Anda hanya bisa mengedit atau menghapus review yang Anda tulis sendiri. Pemilik UMKM dapat membalas review tetapi tidak bisa menghapus."
                },
              ].map((faq, i) => (
                <div key={i} className="rounded-xl border border-outline-variant bg-surface p-6">
                  <h3 className="font-heading text-h3 text-on-surface mb-2">{faq.q}</h3>
                  <p className="text-body-md text-on-surface-variant">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}