"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isOutletOpenNow } from "@/lib/geo";
import { DEFAULT_THUMBNAIL, getCategoryThumbnail } from "@/lib/thumbnails";
import { createReport } from "@/lib/actions/reports";
import { ReviewForm } from "@/components/features/review-form";
import { FavoriteButton } from "@/components/features/favorite-button";
import { PanoramaViewer, type PanoramaData } from "@/components/features/panorama-viewer";
import { DirectionPanel } from "@/components/features/direction-panel";

type OutletData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  landmark_description: string;
  accessibility_description: string;
  whatsapp: string | null;
  opening_hours: Record<string, string>;
  status: string;
};

type ProductData = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  image_alt: string | null;
  is_available: boolean;
  category: string | null;
};

type ReviewData = {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  tags: string[] | null;
  owner_reply: string | null;
  created_at: string;
};

const reportTypeMap: Record<string, string> = {
  "Lokasi salah": "wrong_location",
  "Jam buka salah": "wrong_hours",
  "Informasi aksesibilitas tidak akurat": "accessibility_issue",
  "Outlet sudah tutup permanen": "other",
  "Lainnya": "other",
};

/** Sel foto hero: tampilkan foto produk bila ada, jika tidak thumbnail bertema. */
function HeroPhoto({ src, alt, fallbackSrc, priority = false, className }: { src: string | null; alt: string; fallbackSrc?: string; priority?: boolean; className?: string }) {
  if (!src) {
    return (
      <Image
        src={fallbackSrc ?? DEFAULT_THUMBNAIL}
        alt={`Ilustrasi — ${alt} belum tersedia`}
        fill
        priority={priority}
        unoptimized
        className={`object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <Image src={src} alt={alt} fill priority={priority} className={`object-cover transition-transform duration-500 group-hover:scale-105 ${className ?? ""}`} />
  );
}

export default function OutletDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [activeTab, setActiveTab] = useState<"products" | "reviews" | "360view">("products");
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [outlet, setOutlet] = useState<OutletData | null>(null);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [panoramas, setPanoramas] = useState<PanoramaData[]>([]);
  const [hasStreetView, setHasStreetView] = useState(false);

  const [reportType, setReportType] = useState("Lokasi salah");
  const [reportDescription, setReportDescription] = useState("");
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  async function loadData(initial = false) {
    // Refresh senyap (mis. setelah kirim review) tidak boleh memicu loading
    // layar penuh — itu me-unmount form dan menghapus pesan konfirmasinya.
    if (initial) setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();

      // Tanpa filter status: RLS sudah membatasi anon ke outlet approved,
      // sedangkan admin/owner tetap bisa membuka pratinjau outlet pending.
      const { data: outletData } = await supabase
        .from("outlets")
        .select("*, outlet_categories(categories(slug))")
        .eq("slug", slug)
        .single();

      if (outletData) {
        const o = outletData as unknown as OutletData & {
          outlet_categories?: Array<{ categories: { slug: string } | null }> | null;
        };
        setOutlet(o);
        setCategorySlug(o.outlet_categories?.[0]?.categories?.slug ?? null);

        const [{ data: prods }, { data: revs }, { data: panos }] = await Promise.all([
          supabase.from("products").select("*").eq("outlet_id", o.id).order("name"),
          supabase.from("reviews").select("*").eq("outlet_id", o.id).eq("status", "approved").order("created_at", { ascending: false }),
          supabase.from("panoramas").select("*").eq("outlet_id", o.id).order("order_index"),
        ]);

        setProducts((prods as unknown as ProductData[]) ?? []);
        setReviews((revs as unknown as ReviewData[]) ?? []);
        setPanoramas((panos as unknown as PanoramaData[]) ?? []);

        // Google Street View embed bersifat keyless dan selalu bisa dicoba;
        // panorama 360 milik toko tetap jadi tampilan default di viewer.
        setHasStreetView(true);
      } else {
        setNotFound(true);
      }
    } catch {
      // Gagal memuat / outlet tidak ada — jangan tampilkan data fiktif.
      setNotFound(true);
    }

    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(true); }, [slug]);

  async function handleSubmitReport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!outlet) return;

    const result = await createReport({
      outletId: outlet.id,
      type: (reportTypeMap[reportType] ?? "other") as "wrong_location" | "wrong_hours" | "abusive_review" | "accessibility_issue" | "other",
      description: reportDescription,
    });

    if (result.success) {
      setReportStatus("Laporan berhasil dikirim.");
      setReportDescription("");
      setShowReportForm(false);
    } else {
      setReportStatus(result.error ?? "Gagal mengirim laporan.");
    }
  }

  if (notFound) {
    return (
      <>
        <Header activeNav="outlets" />
        <main className="min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center gap-4">
          <p className="text-on-surface">Outlet tidak ditemukan atau belum disetujui.</p>
          <Button asChild variant="outline">
            <Link href="/outlets">Kembali ke daftar outlet</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  if (loading || !outlet) {
    return (
      <>
        <Header activeNav="outlets" />
        <main className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center">
          <p className="text-on-surface-variant">Loading outlet...</p>
        </main>
        <Footer />
      </>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${outlet.latitude},${outlet.longitude}`;
  const isOpenNow = isOutletOpenNow(outlet.opening_hours);

  return (
    <>
      <Header activeNav="outlets" />
      <main className="flex-grow">
        <div className="mx-auto w-full max-w-[1280px] px-6 py-8">
          <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="grid h-[400px] grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-xl">
                <div className="relative col-span-2 row-span-1 md:col-span-1 md:row-span-2 group bg-surface-container-high">
                  <HeroPhoto src={products[0]?.image_url ?? null} alt={products[0]?.image_alt || `Foto utama ${outlet.name}`} fallbackSrc={getCategoryThumbnail(categorySlug)} priority />
                </div>
                <div className="relative hidden group md:block bg-surface-container-high">
                  <HeroPhoto src={products[1]?.image_url ?? null} alt={products[1]?.image_alt || `Produk ${outlet.name}`} fallbackSrc={getCategoryThumbnail(categorySlug)} />
                </div>
                <div className="relative hidden group md:block bg-surface-container-high">
                  <HeroPhoto src={products[2]?.image_url ?? null} alt={products[2]?.image_alt || `Etalase ${outlet.name}`} fallbackSrc={getCategoryThumbnail(categorySlug)} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center rounded-xl border border-surface-variant bg-surface p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-surface-container-high px-2 py-1 text-[10px] font-semibold uppercase text-on-surface-variant">Outlet</span>
                    {isOpenNow === true && (
                      <span className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold bg-green-100 text-green-800">
                        <span className="material-symbols-outlined text-[12px]" aria-hidden="true">check_circle</span>
                        Buka
                      </span>
                    )}
                    {isOpenNow === false && (
                      <span className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold bg-surface-container-high text-on-surface-variant">
                        <span className="material-symbols-outlined text-[12px]" aria-hidden="true">schedule</span>
                        Tutup
                      </span>
                    )}
                    {outlet.status !== "approved" && (
                      <span className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold bg-amber-100 text-amber-800">
                        <span className="material-symbols-outlined text-[12px]">visibility_off</span>
                        {outlet.status === "pending" ? "Menunggu Persetujuan — belum tampil publik" : "Ditolak — belum tampil publik"}
                      </span>
                    )}
                  </div>
                  <h1 className="flex items-center gap-2 font-heading text-h1 text-on-background">
                    {outlet.name}
                    <span className="material-symbols-outlined text-primary-container" title="Verified Sanan Partner">verified</span>
                  </h1>
                </div>
                <FavoriteButton outletId={outlet.id} size="icon" />
              </div>

              <div className="mt-4 flex items-center gap-2 text-primary-container">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                <span className="font-semibold text-on-background">
                  {reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "-"}
                </span>
                <span className="text-on-surface-variant">({reviews.length} ulasan)</span>
              </div>

              <p className="mt-4 text-on-surface-variant">{outlet.description}</p>

              <div className="mt-6 flex flex-col gap-3">
                {outlet.whatsapp && (
                  <Button asChild className="w-full bg-[#25D366] text-white hover:bg-[#25D366]/90">
                    <a href={`https://wa.me/${outlet.whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <span className="material-symbols-outlined">chat</span>
                      WhatsApp Contact
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" className="w-full">
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined">directions</span>
                    Buka Arah di Google Maps
                  </a>
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setActiveTab("360view")}>
                  <span className="material-symbols-outlined">360</span>
                  Buka Sanan 360 View
                </Button>
              </div>
            </div>
          </section>

          <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-h3 text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  Jam Buka
                </h3>
                <dl className="space-y-2">
                  {Object.entries(outlet.opening_hours ?? {}).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-body-sm">
                      <dt className="text-on-surface-variant">{day}</dt>
                      <dd className="text-on-surface font-medium">{hours}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-h3 text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  Lokasi & Patokan
                </h3>
                <p className="text-body-sm text-on-surface-variant mb-3">{outlet.address}</p>
                <div className="rounded-lg bg-surface-container-low p-3 border border-outline-variant">
                  <p className="text-body-sm text-on-surface-variant italic">{outlet.landmark_description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-h3 text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">accessible</span>
                  Aksesibilitas
                </h3>
                <p className="text-body-sm text-on-surface-variant mb-3">{outlet.accessibility_description}</p>
              </CardContent>
            </Card>
          </section>

          <section className="mb-8">
            <div className="flex border-b border-outline-variant mb-6">
              {[
                { key: "products", label: `Produk / Menu (${products.length})`, icon: "inventory_2" },
                { key: "reviews", label: `Ulasan (${reviews.length})`, icon: "rate_review" },
                { key: "360view", label: "360 View", icon: "360" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-body-md font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "products" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <div className="relative h-48 bg-surface-container-high">
                      <Image
                        src={product.image_url ?? getCategoryThumbnail(categorySlug)}
                        alt={product.image_url ? (product.image_alt ?? product.name) : `Ilustrasi produk ${product.name} — foto belum tersedia`}
                        fill
                        unoptimized={!product.image_url}
                        className="object-cover rounded-t-xl"
                      />
                      {!product.is_available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-xl">
                          <span className="text-white font-semibold">Habis</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-heading text-body-lg text-on-surface">{product.name}</h4>
                      <p className="text-body-sm text-on-surface-variant mt-1">{product.description}</p>
                      <p className="mt-2 font-semibold text-on-surface">Rp {product.price.toLocaleString("id-ID")}</p>
                    </CardContent>
                  </Card>
                ))}
                {products.length === 0 && (
                  <div className="col-span-full rounded-xl border border-outline-variant bg-surface p-6 text-center text-on-surface-variant">
                    Belum ada produk pada outlet ini.
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                <ReviewForm outletId={outlet.id} onSuccess={loadData} />

                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-outline-variant bg-surface p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-on-surface">Pengguna</p>
                        <p className="text-body-sm text-on-surface-variant">
                          {new Date(review.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex text-primary-container">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < review.rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-body-md text-on-surface-variant mb-2">{review.comment}</p>
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] text-on-surface-variant capitalize">{tag}</span>
                        ))}
                      </div>
                    )}
                    {review.owner_reply && (
                      <div className="rounded-lg bg-surface-container-low p-3 border border-outline-variant mt-3">
                        <p className="text-body-sm font-medium text-on-surface mb-1">Balasan pemilik:</p>
                        <p className="text-body-sm text-on-surface-variant">{review.owner_reply}</p>
                      </div>
                    )}
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className="rounded-xl border border-outline-variant bg-surface p-6 text-center text-on-surface-variant">
                    Belum ada review.
                  </div>
                )}
              </div>
            )}

            {activeTab === "360view" && (
              <PanoramaViewer
                panoramas={panoramas}
                fallbackImageUrl={products[0]?.image_url || "/placeholder-outlet.svg"}
                outletName={outlet.name}
                outletDescription={`Tampak depan toko ${outlet.name}. ${outlet.description}. Lokasi: ${outlet.address}. Patokan: ${outlet.landmark_description}. Aksesibilitas: ${outlet.accessibility_description}.`}
                latitude={outlet.latitude}
                longitude={outlet.longitude}
                hasStreetView={hasStreetView}
              />
            )}
          </section>

          {/* Direction Panel */}
          <section className="mb-8">
            <DirectionPanel
              outletName={outlet.name}
              latitude={outlet.latitude}
              longitude={outlet.longitude}
              address={outlet.address}
              landmarkDescription={outlet.landmark_description}
              accessibilityDescription={outlet.accessibility_description}
            />
          </section>

          <section className="mb-8">
            <div className="rounded-xl border border-outline-variant bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-h3 text-on-surface">Ada data yang salah?</h3>
                  <p className="text-body-sm text-on-surface-variant">Bantu kami memperbaiki informasi outlet ini</p>
                </div>
                <Button variant="outline" onClick={() => setShowReportForm(!showReportForm)}>
                  <span className="material-symbols-outlined text-sm">flag</span>
                  Laporkan
                </Button>
              </div>

              {reportStatus && (
                <div className="mt-4 rounded-lg bg-surface-container-low p-3 text-body-sm text-on-surface-variant" role="status">
                  {reportStatus}
                </div>
              )}

              {showReportForm && (
                <form className="mt-4 space-y-4 border-t border-outline-variant pt-4" onSubmit={handleSubmitReport}>
                  <div>
                    <label htmlFor="report-type" className="text-label-caps text-on-surface-variant block mb-1">Tipe Laporan</label>
                    <select
                      id="report-type"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>Lokasi salah</option>
                      <option>Jam buka salah</option>
                      <option>Informasi aksesibilitas tidak akurat</option>
                      <option>Outlet sudah tutup permanen</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="report-desc" className="text-label-caps text-on-surface-variant block mb-1">Deskripsi</label>
                    <textarea
                      id="report-desc"
                      rows={3}
                      required
                      minLength={5}
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Jelaskan data yang salah..."
                      className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  <Button type="submit" className="bg-primary-container text-on-primary-container">
                    Kirim Laporan
                  </Button>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
