"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isOutletOpenNow } from "@/lib/geo";
import { getCategoryThumbnail } from "@/lib/thumbnails";
import { createClient } from "@/lib/supabase/client";

type HomeOutlet = {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  categorySlug: string | null;
  rating: number | null;
  isOpen: boolean | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

type OutletRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  opening_hours: Record<string, string> | null;
  outlet_categories: Array<{ categories: { name: string; slug: string } | null }> | null;
  reviews: Array<{ rating: number; status: string }> | null;
  products: Array<{ image_url: string | null; image_alt: string | null }> | null;
};

export default function Home() {
  const [outlets, setOutlets] = useState<HomeOutlet[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const [featuredResult, countResult] = await Promise.all([
        supabase
          .from("outlets")
          .select(
            "id, slug, name, description, latitude, longitude, opening_hours, outlet_categories(categories(name, slug)), reviews(rating, status), products(image_url, image_alt)",
          )
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("outlets")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),
      ]);

      if (featuredResult.error) {
        setError(`Gagal memuat outlet unggulan: ${featuredResult.error.message}`);
        setOutlets([]);
        setLoading(false);
        return;
      }

      const mapped = ((featuredResult.data ?? []) as unknown as OutletRow[]).map((row) => {
        // Hanya review approved yang menghitung rating publik (viewer login bisa
        // "melihat" review pending miliknya sendiri via RLS).
        const ratings = (row.reviews ?? []).filter((r) => r.status === "approved");
        const rating =
          ratings.length > 0
            ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
            : null;
        const firstPhoto = (row.products ?? []).find((p) => p.image_url) ?? null;
        return {
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.description,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          category: row.outlet_categories?.[0]?.categories?.name ?? "UMKM",
          categorySlug: row.outlet_categories?.[0]?.categories?.slug ?? null,
          rating,
          isOpen: isOutletOpenNow(row.opening_hours),
          imageUrl: firstPhoto?.image_url ?? null,
          imageAlt: firstPhoto?.image_alt ?? null,
        } satisfies HomeOutlet;
      });

      setOutlets(mapped);
      setTotalCount(countResult.count ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>
      <Header activeNav="explore" />
      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden py-16 md:py-24 bg-[var(--gradient-hero)]">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-high px-3 py-1 text-label-caps text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">location_on</span>
                  Sentra Industri Keripik Tempe
                </span>
                <h1 className="font-heading text-h1 text-on-background">
                  Jelajahi UMKM <br />
                  <span className="text-primary-container">Sanan Malang</span>
                </h1>
                <p className="max-w-xl text-body-lg text-on-surface-variant">
                  Temukan pusat oleh-oleh khas Malang, produk lokal berkualitas, ulasan terpercaya, rute wisata,
                  hingga tur virtual di kampung tempe legendaris.
                </p>
              </div>

              <div className="flex w-full max-w-xl items-center gap-3 rounded-[1rem] border border-outline-variant bg-surface-container-lowest p-2 shadow-[var(--shadow-level-1)]">
                <span className="material-symbols-outlined pl-2 text-outline" aria-hidden="true">search</span>
                <input
                  className="w-full bg-transparent py-2 text-body-md text-on-surface outline-none placeholder:text-outline-variant"
                  placeholder="Cari outlet, produk, atau lokasi..."
                  type="text"
                />
                <Button asChild className="rounded-xl bg-primary-container px-4 py-2 text-label-caps text-on-primary-container hover:bg-primary-container/90">
                  <Link href="/outlets">Cari</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button asChild className="rounded-full bg-primary-container px-6 py-6 text-label-caps text-on-primary-container hover:bg-primary-container/90">
                  {/* ?view=map = niat eksplisit membuka peta, melewati preferensi Mode Daftar */}
                  <Link href="/map?view=map">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">map</span>
                    Buka Peta
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-outline px-6 py-6 text-label-caps text-on-surface hover:bg-surface-container-high"
                >
                  <Link href="/outlets">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">accessible</span>
                    Daftar Outlet Aksesibel
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative h-[420px] overflow-hidden rounded-[2rem] border-[8px] border-surface-container-lowest shadow-[var(--shadow-level-2)] md:h-[560px]">
              <Image
                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80"
                alt="Suasana sentra UMKM Sanan dengan etalase produk oleh-oleh khas Malang"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute bottom-8 left-8 flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest/90 p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-center rounded-full bg-primary-container p-3 text-on-primary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }} aria-hidden="true">
                    storefront
                  </span>
                </div>
                <div>
                  <p className="font-heading text-h3 text-on-surface">{loading ? "…" : totalCount}</p>
                  <p className="text-body-sm text-on-surface-variant">UMKM Aktif</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container py-20">
          <div className="mx-auto max-w-[1280px] space-y-10 px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-h2 text-on-background">Outlet Unggulan</h2>
                <p className="text-body-md text-on-surface-variant">
                  Pilihan destinasi terbaik untuk pengalaman belanja dan kuliner yang autentik.
                </p>
              </div>
              <Link href="/outlets" className="flex items-center gap-1 text-label-caps text-primary hover:underline">
                Lihat Semua <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>

            {error ? (
              <div role="alert" className="rounded-xl border border-outline-variant bg-error-container p-8 text-center text-on-error-container">
                {error}
              </div>
            ) : loading ? (
              <div role="status" className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                Memuat outlet unggulan...
              </div>
            ) : outlets.length === 0 ? (
              <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                Belum ada outlet unggulan.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {outlets.map((outlet) => {
                  const openLabel =
                    outlet.isOpen === null ? "Lihat jam buka" : outlet.isOpen ? "Buka" : "Tutup";
                  const badgeClass =
                    outlet.isOpen === null
                      ? "bg-surface-container-high text-on-surface-variant"
                      : outlet.isOpen
                        ? "bg-[#e6f4ea] text-[#137333]"
                        : "bg-error-container text-on-error-container";

                  return (
                    <Card key={outlet.id} className="group overflow-hidden">
                      <div className="relative h-48 overflow-hidden bg-surface-container-high">
                        <Image
                          src={outlet.imageUrl ?? getCategoryThumbnail(outlet.categorySlug)}
                          alt={outlet.imageUrl ? (outlet.imageAlt ?? outlet.name) : `Ilustrasi kategori ${outlet.category} — foto belum tersedia`}
                          fill
                          unoptimized={!outlet.imageUrl}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className={`absolute left-4 top-4 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm ${badgeClass}`}>
                          {openLabel}
                        </div>
                      </div>
                      <CardContent className="flex flex-col gap-4 p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-heading text-h3 text-on-surface">{outlet.name}</h3>
                            <p className="mt-1 text-body-sm text-on-surface-variant">{outlet.description}</p>
                          </div>
                          <div className="flex items-center gap-1 text-primary-container">
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }} aria-hidden="true">
                              star
                            </span>
                            <span className="text-label-caps text-on-surface">{outlet.rating !== null ? outlet.rating : "–"}</span>
                          </div>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-outline-variant/40 pt-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-secondary-container px-2.5 py-1 text-[12px] text-on-secondary-container">
                              {outlet.category}
                            </span>
                          </div>
                          <Button asChild variant="ghost" size="icon" aria-label={`Arahkan ke ${outlet.name}`}>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${outlet.latitude},${outlet.longitude}`} target="_blank" rel="noopener noreferrer">
                              <span className="material-symbols-outlined" aria-hidden="true">directions</span>
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
