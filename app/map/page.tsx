"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, type MapRef } from "@/components/ui/map";
import { allOutlets as mockOutlets } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const filterOptions = ["Semua", "Keripik Tempe", "Oleh-oleh", "Kuliner", "Buka Sekarang", "Rating Tinggi", "Ramah Disabilitas"];

type MapOutlet = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  rating: number;
  distance: string;
  accessibility: string;
};

export default function MapPage() {
  const mapRef = useRef<MapRef | null>(null);
  const [outlets, setOutlets] = useState<MapOutlet[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("Semua");

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
          const mapped = data.map((item: unknown) => {
            const row = item as {
              id: string;
              slug: string;
              name: string;
              description: string;
              latitude: number;
              longitude: number;
              accessibility_description: string;
            };
            return {
              id: row.id,
              slug: row.slug,
              name: row.name,
              description: row.description,
              category: "UMKM",
              latitude: row.latitude,
              longitude: row.longitude,
              isOpen: true,
              rating: 4.5,
              distance: "-",
              accessibility: row.accessibility_description,
            } satisfies MapOutlet;
          });
          setOutlets(mapped);
          if (mapped.length > 0) setSelectedOutletId(mapped[0].id);
          return;
        }
      } catch {
        // fallback below
      }

      const fallback = mockOutlets.map((o) => ({
        id: String(o.id),
        slug: o.slug,
        name: o.name,
        description: o.description,
        category: o.category,
        latitude: o.latitude,
        longitude: o.longitude,
        isOpen: o.isOpen,
        rating: o.rating,
        distance: o.distance,
        accessibility: o.accessibility,
      } satisfies MapOutlet));
      setOutlets(fallback);
      if (fallback.length > 0) setSelectedOutletId(fallback[0].id);
    }
    load();
  }, []);

  const filteredOutlets = useMemo(() => {
    return outlets.filter((outlet) => {
      const matchesSearch =
        searchQuery === "" ||
        outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outlet.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === "Semua" ||
        (activeFilter === "Keripik Tempe" && outlet.category === "Keripik Tempe") ||
        (activeFilter === "Oleh-oleh" && outlet.category === "Oleh-oleh") ||
        (activeFilter === "Kuliner" && outlet.category === "Kuliner") ||
        (activeFilter === "Buka Sekarang" && outlet.isOpen) ||
        (activeFilter === "Rating Tinggi" && outlet.rating >= 4.7) ||
        (activeFilter === "Ramah Disabilitas" && outlet.accessibility.toLowerCase().includes("kursi roda"));

      return matchesSearch && matchesFilter;
    });
  }, [outlets, searchQuery, activeFilter]);

  const selectedOutlet = useMemo(
    () => filteredOutlets.find((o) => o.id === selectedOutletId) ?? filteredOutlets[0],
    [filteredOutlets, selectedOutletId],
  );

  const mapCenter: [number, number] = selectedOutlet
    ? [selectedOutlet.longitude, selectedOutlet.latitude]
    : [112.6312, -7.9768];

  const handleOutletClick = (outletId: string) => {
    const outlet = filteredOutlets.find((item) => item.id === outletId);
    if (!outlet) return;

    setSelectedOutletId(outletId);

    mapRef.current?.flyTo({
      center: [outlet.longitude, outlet.latitude],
      zoom: 16,
      duration: 900,
      essential: true,
    });
  };

  return (
    <>
      <Header activeNav="explore" />
      <main className="flex h-[calc(100vh-4.5rem)] flex-row">
        <aside className="hidden w-[380px] flex-shrink-0 flex-col overflow-hidden border-r border-outline-variant bg-surface md:flex">
          <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-container-low p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-h3 text-on-surface">Direktori UMKM</h2>
              <span className="material-symbols-outlined text-on-surface-variant">tune</span>
            </div>
            <div className="flex rounded-lg bg-surface-variant p-1">
              <Button className="flex-1 rounded-md bg-surface shadow-sm text-label-caps text-primary" size="sm">
                Mode Peta
              </Button>
              <Button asChild variant="ghost" className="flex-1 rounded-md text-label-caps text-on-surface-variant" size="sm">
                <Link href="/outlets">Daftar Aksesibel</Link>
              </Button>
            </div>
            <p className="text-body-sm text-on-surface-variant">Menampilkan {filteredOutlets.length} outlet di sekitar Anda.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-4">
              {filteredOutlets.length === 0 && (
                <p className="text-body-sm text-on-surface-variant text-center py-8">Tidak ada outlet ditemukan.</p>
              )}
              {filteredOutlets.map((outlet) => {
                const isSelected = outlet.id === selectedOutletId;

                return (
                  <article
                    key={outlet.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOutletClick(outlet.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleOutletClick(outlet.id);
                      }
                    }}
                    className={cn(
                      "group cursor-pointer rounded-xl border bg-surface-container-lowest p-4 transition-colors focus:outline-none",
                      isSelected
                        ? "border-primary ring-2 ring-primary/25"
                        : "border-outline-variant hover:border-primary",
                    )}
                    aria-label={`${outlet.name}, rating ${outlet.rating}, ${outlet.isOpen ? "buka sekarang" : "tutup"}, ${outlet.distance} dari lokasi Anda`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="mb-2 inline-block rounded-full bg-tertiary-fixed px-2 py-1 text-[10px] font-semibold uppercase text-on-tertiary-fixed-variant">
                          {outlet.category}
                        </span>
                        <h3 className="font-heading text-body-lg text-on-surface group-hover:text-primary">{outlet.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 rounded-md bg-surface-container px-2 py-1">
                        <span className="material-symbols-outlined text-sm text-primary-container" style={{ fontVariationSettings: '"FILL" 1' }}>
                          star
                        </span>
                        <span className="text-label-caps text-on-surface">{outlet.rating}</span>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-body-sm text-on-surface-variant">{outlet.description}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1 text-tertiary">
                        <span className="material-symbols-outlined text-sm">storefront</span>
                        <span className="text-label-caps">{outlet.isOpen ? "Buka Sekarang" : "Tutup"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">directions_walk</span>
                        <span className="text-body-sm">{outlet.distance}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/outlets/${outlet.slug}`} className="text-body-sm text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                        Detail
                      </Link>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${outlet.latitude},${outlet.longitude}`} target="_blank" rel="noopener noreferrer" className="text-body-sm text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                        Arah
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex-1 relative bg-surface-container-highest">
          <Map ref={mapRef} className="absolute inset-0" center={mapCenter} zoom={14}>
            <MapControls showZoom showLocate showCompass />
            {filteredOutlets.map((outlet) => {
              const isSelected = outlet.id === selectedOutletId;
              return (
                <MapMarker key={outlet.id} longitude={outlet.longitude} latitude={outlet.latitude}>
                  <MarkerContent>
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 border-white shadow-md transition-all",
                        isSelected ? "bg-primary scale-125" : "bg-tertiary",
                      )}
                    />
                  </MarkerContent>
                  <MarkerPopup closeButton>
                    <div className="space-y-2 p-2">
                      <p className="font-medium text-sm">{outlet.name}</p>
                      <p className="text-xs text-muted-foreground">{outlet.category} &middot; {outlet.isOpen ? "Buka" : "Tutup"}</p>
                      <div className="flex gap-2">
                        <Link href={`/outlets/${outlet.slug}`} className="text-xs text-primary hover:underline">Detail</Link>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${outlet.latitude},${outlet.longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Arah</a>
                      </div>
                    </div>
                  </MarkerPopup>
                </MapMarker>
              );
            })}
          </Map>

          <div className="absolute left-6 right-6 top-6 z-10 pointer-events-none flex flex-col gap-4">
            <div className="pointer-events-auto flex max-w-md items-center rounded-full border border-outline-variant bg-surface px-4 py-3 shadow-[var(--shadow-level-1)]">
              <span className="material-symbols-outlined mr-3 text-on-surface-variant">search</span>
              <input
                className="flex-1 bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
                placeholder="Cari oleh-oleh, warung, atau lokasi..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button variant="ghost" size="icon" aria-label="Clear search" className="ml-1 text-on-surface-variant" onClick={() => setSearchQuery("")}>
                  <span className="material-symbols-outlined text-sm">close</span>
                </Button>
              )}
            </div>
            <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {filterOptions.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap rounded-full"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
