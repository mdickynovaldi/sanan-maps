"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { isOutletOpenNow } from "@/lib/geo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SortOption = "name" | "rating";

type OutletItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  landmark: string;
  accessibility: string;
  category: string;
  rating: number | null;
  reviewCount: number;
  isOpen: boolean | null;
  image: string | null;
  imageAlt: string | null;
};

type OutletRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  landmark_description: string;
  accessibility_description: string;
  opening_hours: Record<string, string> | null;
  outlet_categories: Array<{ categories: { name: string } | null }> | null;
  reviews: Array<{ rating: number; status: string }> | null;
  products: Array<{ image_url: string | null; image_alt: string | null }> | null;
};

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from("outlets")
        .select(
          "id, slug, name, description, address, latitude, longitude, landmark_description, accessibility_description, opening_hours, outlet_categories(categories(name)), reviews(rating, status), products(image_url, image_alt)",
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(`Gagal memuat daftar outlet: ${queryError.message}`);
        setOutlets([]);
        return;
      }

      const mapped = ((data ?? []) as unknown as OutletRow[]).map((row) => {
        const ratings = (row.reviews ?? []).filter((r) => r.status === "approved");
        const rating =
          ratings.length > 0
            ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
            : null;
        const firstPhoto = (row.products ?? []).find((p) => p.image_url);
        return {
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.description,
          address: row.address,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          landmark: row.landmark_description,
          accessibility: row.accessibility_description,
          category: row.outlet_categories?.[0]?.categories?.name ?? "UMKM",
          rating,
          reviewCount: ratings.length,
          isOpen: isOutletOpenNow(row.opening_hours),
          image: firstPhoto?.image_url ?? null,
          imageAlt: firstPhoto?.image_alt ?? null,
        } satisfies OutletItem;
      });
      setOutlets(mapped);
    } catch {
      setError("Terjadi kesalahan saat memuat daftar outlet. Silakan coba lagi.");
      setOutlets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryOptions = useMemo(() => {
    const names = new Set<string>();
    outlets.forEach((o) => names.add(o.category));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [outlets]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    const results = outlets.filter((outlet) => {
      const matchSearch =
        term === "" ||
        outlet.name.toLowerCase().includes(term) ||
        outlet.landmark.toLowerCase().includes(term) ||
        outlet.address.toLowerCase().includes(term) ||
        outlet.description.toLowerCase().includes(term);

      const matchCategory = categoryFilter === "all" || outlet.category === categoryFilter;

      return matchSearch && matchCategory;
    });

    return [...results].sort((a, b) => {
      if (sortBy === "rating") return (b.rating ?? -1) - (a.rating ?? -1);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [outlets, search, categoryFilter, sortBy]);

  return (
    <>
      <a href="#main-content" className="skip-link">Lewati ke konten utama</a>
      <a href="#outlet-list" className="skip-link">Lewati ke daftar outlet</a>
      <Header activeNav="outlets" />
      <main id="main-content" className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-[1280px] p-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-h1 text-on-background">Outlet Aksesibel</h1>
              <p className="text-body-lg text-on-surface-variant">Daftar outlet dengan informasi aksesibilitas terperinci.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/map"><span className="material-symbols-outlined text-sm" aria-hidden="true">map</span>Buka Mode Peta</Link>
            </Button>
          </div>

          <section aria-labelledby="filter-heading" className="mb-8 space-y-4 rounded-xl border border-outline-variant bg-surface-container p-6 shadow-sm">
            <h2 id="filter-heading" className="sr-only">Saring Daftar Outlet</h2>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label htmlFor="local-search" className="mb-2 block text-body-sm font-semibold text-on-surface">Cari berdasarkan Nama atau Landmark</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">search</span>
                  <input
                    id="local-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full rounded-lg border border-outline-variant bg-surface py-3 pl-10 pr-4 text-body-md text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Contoh: Toko Oleh-oleh Sanan..."
                    type="search"
                  />
                </div>
              </div>
              <div className="w-full md:w-auto">
                <label htmlFor="filter-category" className="mb-2 block text-body-sm font-semibold text-on-surface">Kategori Produk</label>
                <select
                  id="filter-category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full rounded-lg border border-outline-variant bg-surface py-3 px-4 text-body-md text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Semua Kategori</option>
                  {categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="w-full md:w-auto">
                <label htmlFor="sort-by" className="mb-2 block text-body-sm font-semibold text-on-surface">Urutkan</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="block w-full rounded-lg border border-outline-variant bg-surface py-3 px-4 text-body-md text-on-surface shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="rating">Rating Tertinggi</option>
                  <option value="name">Nama A-Z</option>
                </select>
              </div>
            </div>
          </section>

          {!loading && !error && (
            <p className="mb-4 text-body-sm text-on-surface-variant" aria-live="polite">Menampilkan {filtered.length} outlet</p>
          )}

          <section aria-label="Daftar Outlet" id="outlet-list" className="space-y-6">
            {loading && (
              <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant" role="status">
                <span className="material-symbols-outlined text-4xl mb-4 block animate-spin" aria-hidden="true">progress_activity</span>
                <p className="text-body-md">Memuat daftar outlet...</p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-error/40 bg-error-container p-8 text-center" role="alert">
                <span className="material-symbols-outlined text-4xl text-on-error-container mb-4 block" aria-hidden="true">error</span>
                <h3 className="font-heading text-h3 text-on-error-container mb-2">Gagal memuat data</h3>
                <p className="text-body-md text-on-error-container mb-4">{error}</p>
                <Button variant="outline" onClick={load}>
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">refresh</span>
                  Coba Lagi
                </Button>
              </div>
            )}

            {!loading && !error && outlets.length === 0 && (
              <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block" aria-hidden="true">storefront</span>
                <h3 className="font-heading text-h3 text-on-surface mb-2">Belum ada outlet</h3>
                <p className="text-body-md text-on-surface-variant">Belum ada outlet yang disetujui untuk ditampilkan saat ini. Silakan kembali lagi nanti.</p>
              </div>
            )}

            {!loading && !error && outlets.length > 0 && filtered.length === 0 && (
              <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block" aria-hidden="true">search_off</span>
                <h3 className="font-heading text-h3 text-on-surface mb-2">Tidak ada outlet ditemukan</h3>
                <p className="text-body-md text-on-surface-variant">Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
              </div>
            )}

            {!loading && !error && filtered.map((outlet) => (
              <article key={outlet.id} className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface p-6 shadow-sm transition-shadow hover:shadow-md md:flex-row">
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-surface-container-high md:w-1/3">
                  {outlet.image ? (
                    <Image src={outlet.image} alt={outlet.imageAlt ?? `Foto produk ${outlet.name}`} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-container-high text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl" aria-hidden="true">storefront</span>
                    </div>
                  )}
                  <div className={cn("absolute left-3 top-3 flex items-center gap-1 rounded-full px-3 py-1 text-label-caps shadow-sm", outlet.isOpen ? "bg-tertiary text-on-tertiary" : "bg-surface text-on-surface border border-outline")}>
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">storefront</span>
                    {outlet.isOpen === null ? "Lihat Jam Buka" : outlet.isOpen ? "Buka" : "Tutup"}
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-h3 text-on-surface">
                        <Link href={`/outlets/${outlet.slug}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">{outlet.name}</Link>
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-body-sm text-on-surface-variant">
                        <span className="flex items-center text-primary-container">
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }} aria-hidden="true">star</span>
                          <span className="font-semibold text-on-surface ml-1">{outlet.rating ?? "–"}</span>
                        </span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{outlet.reviewCount} ulasan</span>
                        <span aria-hidden="true">&middot;</span>
                        <span className="inline-flex items-center rounded-full bg-tertiary-fixed px-2 py-0.5 text-[10px] font-semibold uppercase text-on-tertiary-fixed-variant">{outlet.category}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mb-4 text-body-md text-on-surface">{outlet.description}</p>
                  <div className="mb-4 rounded-lg border border-surface-variant bg-surface-container-low p-4">
                    <h4 className="mb-2 flex items-center gap-2 text-label-caps uppercase text-on-surface">
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">accessible</span>
                      Informasi Aksesibilitas
                    </h4>
                    <p className="text-body-sm text-on-surface-variant">{outlet.accessibility}</p>
                    <p className="text-body-sm text-on-surface-variant mt-2 italic">{outlet.landmark}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-3 border-t border-outline-variant pt-4">
                    <Button variant="outline" className="border-primary text-primary">
                      <span className="material-symbols-outlined" aria-hidden="true">volume_up</span>
                      Dengarkan Ringkasan
                    </Button>
                    <Button asChild className="bg-primary-container text-on-primary-container">
                      <Link href={`/outlets/${outlet.slug}`}>
                        <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
                        Buka Detail
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="ml-auto">
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${outlet.latitude},${outlet.longitude}`} target="_blank" rel="noopener noreferrer">
                        <span className="material-symbols-outlined" aria-hidden="true">directions</span>
                        Arahkan ke Lokasi
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
