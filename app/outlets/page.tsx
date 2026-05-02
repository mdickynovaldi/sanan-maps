"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { allOutlets as mockOutlets, categories } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SortOption = "name" | "rating" | "distance";

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
  categorySlug: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  distance: string;
  image: string;
};

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("outlets")
          .select("*")
          .eq("status", "approved")
          .order("name");

        if (data && data.length > 0) {
          setOutlets(data.map((item: unknown) => {
            const o = item as {
              id: string;
              slug: string;
              name: string;
              description: string;
              address: string;
              latitude: number;
              longitude: number;
              landmark_description: string;
              accessibility_description: string;
            };
            return {
              id: o.id,
              slug: o.slug,
              name: o.name,
              description: o.description,
              address: o.address,
              latitude: o.latitude,
              longitude: o.longitude,
              landmark: o.landmark_description,
              accessibility: o.accessibility_description,
              category: "UMKM",
              categorySlug: "umkm",
              rating: 4.5,
              reviewCount: 0,
              isOpen: true,
              distance: "-",
              image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
            };
          }));
          return;
        }
      } catch {
        // fallback below
      }

      setOutlets(mockOutlets.map((o) => ({
        id: String(o.id),
        slug: o.slug,
        name: o.name,
        description: o.description,
        address: o.address,
        latitude: o.latitude,
        longitude: o.longitude,
        landmark: o.landmark,
        accessibility: o.accessibility,
        category: o.category,
        categorySlug: o.categorySlug,
        rating: o.rating,
        reviewCount: o.reviewCount,
        isOpen: o.isOpen,
        distance: o.distance,
        image: o.image,
      })));
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const results = outlets.filter((outlet) => {
      const matchSearch =
        search === "" ||
        outlet.name.toLowerCase().includes(search.toLowerCase()) ||
        outlet.landmark.toLowerCase().includes(search.toLowerCase()) ||
        outlet.description.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "all" || outlet.categorySlug === categoryFilter;

      return matchSearch && matchCategory;
    });

    return [...results].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
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
              <Link href="/map"><span className="material-symbols-outlined text-sm">map</span>Buka Mode Peta</Link>
            </Button>
          </div>

          <section aria-labelledby="filter-heading" className="mb-8 space-y-4 rounded-xl border border-outline-variant bg-surface-container p-6 shadow-sm">
            <h2 id="filter-heading" className="sr-only">Saring Daftar Outlet</h2>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label htmlFor="local-search" className="mb-2 block text-body-sm font-semibold text-on-surface">Cari berdasarkan Nama atau Landmark</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
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
                  {categories.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
                  <option value="umkm">UMKM</option>
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
                  <option value="distance">Jarak Terdekat</option>
                </select>
              </div>
            </div>
          </section>

          <p className="mb-4 text-body-sm text-on-surface-variant" aria-live="polite">Menampilkan {filtered.length} outlet</p>

          <section aria-label="Daftar Outlet" id="outlet-list" className="space-y-6">
            {filtered.length === 0 && (
              <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">search_off</span>
                <h3 className="font-heading text-h3 text-on-surface mb-2">Tidak ada outlet ditemukan</h3>
                <p className="text-body-md text-on-surface-variant">Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
              </div>
            )}

            {filtered.map((outlet) => (
              <article key={outlet.id} className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface p-6 shadow-sm transition-shadow hover:shadow-md md:flex-row">
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-surface-container-high md:w-1/3">
                  <Image src={outlet.image} alt={`Foto ${outlet.name}`} fill className="object-cover" />
                  <div className={cn("absolute left-3 top-3 flex items-center gap-1 rounded-full px-3 py-1 text-label-caps shadow-sm", outlet.isOpen ? "bg-tertiary text-on-tertiary" : "bg-surface text-on-surface border border-outline")}>
                    <span className="material-symbols-outlined text-[14px]">storefront</span>
                    {outlet.isOpen ? "Buka" : "Tutup"}
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
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                          <span className="font-semibold text-on-surface ml-1">{outlet.rating}</span>
                        </span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{outlet.reviewCount} ulasan</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{outlet.distance}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mb-4 text-body-md text-on-surface">{outlet.description}</p>
                  <div className="mb-4 rounded-lg border border-surface-variant bg-surface-container-low p-4">
                    <h4 className="mb-2 flex items-center gap-2 text-label-caps uppercase text-on-surface">
                      <span className="material-symbols-outlined text-[16px]">accessible</span>
                      Informasi Aksesibilitas
                    </h4>
                    <p className="text-body-sm text-on-surface-variant">{outlet.accessibility}</p>
                    <p className="text-body-sm text-on-surface-variant mt-2 italic">{outlet.landmark}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-3 border-t border-outline-variant pt-4">
                    <Button variant="outline" className="border-primary text-primary">
                      <span className="material-symbols-outlined">volume_up</span>
                      Dengarkan Ringkasan
                    </Button>
                    <Button asChild className="bg-primary-container text-on-primary-container">
                      <Link href={`/outlets/${outlet.slug}`}>
                        <span className="material-symbols-outlined">visibility</span>
                        Buka Detail
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="ml-auto">
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${outlet.latitude},${outlet.longitude}`} target="_blank" rel="noopener noreferrer">
                        <span className="material-symbols-outlined">directions</span>
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
