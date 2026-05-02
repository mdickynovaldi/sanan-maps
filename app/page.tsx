"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuredOutlets as mockFeaturedOutlets } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

type HomeOutlet = {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
};

export default function Home() {
  const [outlets, setOutlets] = useState<HomeOutlet[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("outlets")
          .select("id, slug, name, description, latitude, longitude")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(3);

        if (data && data.length > 0) {
          setOutlets(data as unknown as HomeOutlet[]);
          return;
        }
      } catch {
        // fallback below
      }

      setOutlets(mockFeaturedOutlets.map((o) => ({
        id: String(o.id),
        slug: o.slug,
        name: o.name,
        description: o.description,
        latitude: o.latitude,
        longitude: o.longitude,
      })));
    }
    load();
  }, []);

  const visibleOutlets = useMemo(() => {
    if (outlets.length > 0) return outlets;
    return mockFeaturedOutlets.map((o) => ({
      id: String(o.id),
      slug: o.slug,
      name: o.name,
      description: o.description,
      latitude: o.latitude,
      longitude: o.longitude,
    }));
  }, [outlets]);

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
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
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
                <span className="material-symbols-outlined pl-2 text-outline">search</span>
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
                  <Link href="/map">
                    <span className="material-symbols-outlined text-[18px]">map</span>
                    Buka Peta
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-outline px-6 py-6 text-label-caps text-on-surface hover:bg-surface-container-high"
                >
                  <Link href="/outlets">
                    <span className="material-symbols-outlined text-[18px]">accessible</span>
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
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                    storefront
                  </span>
                </div>
                <div>
                  <p className="font-heading text-h3 text-on-surface">{outlets.length > 0 ? `${outlets.length}+` : "120+"}</p>
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
                Lihat Semua <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleOutlets.map((outlet) => (
                <Card key={outlet.id} className="group overflow-hidden">
                  <div className="relative h-48 overflow-hidden bg-surface-container-high">
                    <Image src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80" alt={outlet.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute left-4 top-4 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm bg-[#e6f4ea] text-[#137333]">
                      Buka
                    </div>
                  </div>
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-h3 text-on-surface">{outlet.name}</h3>
                        <p className="mt-1 text-body-sm text-on-surface-variant">{outlet.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-primary-container">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                          star
                        </span>
                        <span className="text-label-caps text-on-surface">4.5</span>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-outline-variant/40 pt-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-secondary-container px-2.5 py-1 text-[12px] text-on-secondary-container">
                          UMKM
                        </span>
                      </div>
                      <Button asChild variant="ghost" size="icon" aria-label={`Arahkan ke ${outlet.name}`}>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${outlet.latitude},${outlet.longitude}`} target="_blank" rel="noopener noreferrer">
                          <span className="material-symbols-outlined">directions</span>
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
