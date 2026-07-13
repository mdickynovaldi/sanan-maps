"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LngLatBounds } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Header } from "@/components/layout/header";
import { useAccessibility } from "@/components/providers/accessibility-provider";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerPopup,
  useMap,
  type MapRef,
} from "@/components/ui/map";
import {
  SANAN_CENTER,
  SANAN_DEFAULT_ZOOM,
  formatDistance,
  formatDuration,
  haversineMeters,
  isOutletOpenNow,
  type WalkingRoute,
} from "@/lib/geo";
import { getWalkingRoute } from "@/lib/actions/routing";
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
  isOpen: boolean | null;
  rating: number | null;
  reviewCount: number;
  accessibility: string;
};

type UserLocation = { latitude: number; longitude: number };

type ActiveRoute = WalkingRoute & {
  outletName: string;
  outletId: string;
  destLatitude: number;
  destLongitude: number;
};

/** Fit peta ke seluruh marker sekali saja setelah data outlet masuk. */
function FitToOutlets({ points }: { points: [number, number][] }) {
  const { map, isLoaded } = useMap();
  const { prefs } = useAccessibility();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!map || !isLoaded || fittedRef.current || points.length === 0) return;
    fittedRef.current = true;
    const bounds = points.reduce(
      (b, p) => b.extend(p),
      new LngLatBounds(points[0], points[0]),
    );
    map.fitBounds(bounds, { padding: 100, maxZoom: 17, duration: prefs.reducedMotion ? 0 : 600 });
  }, [map, isLoaded, points, prefs.reducedMotion]);

  return null;
}

type OutletRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  accessibility_description: string;
  opening_hours: Record<string, string> | null;
  outlet_categories: Array<{ categories: { name: string } | null }> | null;
  reviews: Array<{ rating: number; status: string }> | null;
};

export default function MapPage() {
  const router = useRouter();
  const { prefs } = useAccessibility();
  const mapRef = useRef<MapRef | null>(null);
  const [outlets, setOutlets] = useState<MapOutlet[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("Semua");

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [route, setRoute] = useState<ActiveRoute | null>(null);
  const [routeLoadingId, setRouteLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  // Fallback Google Maps ketika rute in-app gagal (mis. layanan rute down).
  const [routeErrorMaps, setRouteErrorMaps] = useState<string | null>(null);
  // Penanda permintaan rute terbaru — respons lama yang datang terlambat diabaikan.
  const routeRequestRef = useRef(0);

  // Preferensi "Mode Daftar": arahkan ke daftar outlet aksesibel, kecuali
  // pengguna sengaja membuka peta lewat ?view=map. Query string dibaca dari
  // window (bukan useSearchParams) agar halaman tidak butuh Suspense boundary.
  useEffect(() => {
    if (!prefs.defaultListView) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") !== "map") {
      router.replace("/outlets");
    }
  }, [prefs.defaultListView, router]);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("outlets")
          .select(
            "id, slug, name, description, latitude, longitude, accessibility_description, opening_hours, outlet_categories(categories(name)), reviews(rating, status)",
          )
          .eq("status", "approved")
          .order("name");

        if (data && data.length > 0) {
          const mapped = (data as unknown as OutletRow[]).map((row) => {
            const ratings = (row.reviews ?? []).filter((r) => r.status === "approved");
            const rating =
              ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                : null;
            return {
              id: row.id,
              slug: row.slug,
              name: row.name,
              description: row.description,
              category: row.outlet_categories?.[0]?.categories?.name ?? "UMKM",
              latitude: Number(row.latitude),
              longitude: Number(row.longitude),
              isOpen: isOutletOpenNow(row.opening_hours),
              rating: rating !== null ? Math.round(rating * 10) / 10 : null,
              reviewCount: ratings.length,
              accessibility: row.accessibility_description,
            } satisfies MapOutlet;
          });
          setOutlets(mapped);
          return;
        }
        // Tidak ada outlet approved — tampilkan daftar kosong, bukan data palsu.
        setOutlets([]);
      } catch {
        // Gagal memuat: jangan tampilkan outlet fiktif ke publik.
        setOutlets([]);
      }
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
        (activeFilter === "Buka Sekarang" && outlet.isOpen === true) ||
        (activeFilter === "Rating Tinggi" && (outlet.rating ?? 0) >= 4.5) ||
        (activeFilter === "Ramah Disabilitas" && outlet.accessibility.toLowerCase().includes("kursi roda"));

      return matchesSearch && matchesFilter;
    });
  }, [outlets, searchQuery, activeFilter]);

  const markerPoints = useMemo(
    () => filteredOutlets.map((o) => [o.longitude, o.latitude] as [number, number]),
    [filteredOutlets],
  );

  const distanceTo = useCallback(
    (outlet: MapOutlet): string | null => {
      if (!userLocation) return null;
      return formatDistance(
        haversineMeters(userLocation.latitude, userLocation.longitude, outlet.latitude, outlet.longitude),
      );
    },
    [userLocation],
  );

  const handleOutletClick = (outletId: string) => {
    const outlet = filteredOutlets.find((item) => item.id === outletId);
    if (!outlet) return;

    setSelectedOutletId(outletId);

    mapRef.current?.flyTo({
      center: [outlet.longitude, outlet.latitude],
      zoom: 17,
      duration: prefs.reducedMotion ? 0 : 900,
      essential: true,
    });
  };

  const requestLocation = useCallback((): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Browser ini tidak mendukung geolokasi."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) =>
          reject(
            new Error(
              err.code === err.PERMISSION_DENIED
                ? "Izin lokasi ditolak. Aktifkan izin lokasi untuk melihat rute."
                : "Gagal mendapatkan lokasi Anda.",
            ),
          ),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }, []);

  const handleShowRoute = useCallback(
    async (outlet: MapOutlet) => {
      const requestId = ++routeRequestRef.current;
      setStatusMessage(null);
      setRouteErrorMaps(null);
      setRouteLoadingId(outlet.id);
      setSelectedOutletId(outlet.id);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${outlet.latitude},${outlet.longitude}&travelmode=walking`;
      try {
        const origin = userLocation ?? (await requestLocation());
        setUserLocation(origin);

        const { route: result, error: routeError } = await getWalkingRoute(origin, outlet);
        // Ada permintaan rute yang lebih baru — buang hasil ini.
        if (requestId !== routeRequestRef.current) return;

        if (!result) {
          setStatusMessage(routeError ?? "Layanan rute sedang tidak tersedia.");
          setRouteErrorMaps(mapsUrl);
          return;
        }

        setRoute({
          ...result,
          outletName: outlet.name,
          outletId: outlet.id,
          destLatitude: outlet.latitude,
          destLongitude: outlet.longitude,
        });

        const bounds = result.coordinates.reduce(
          (b, p) => b.extend(p),
          new LngLatBounds(result.coordinates[0], result.coordinates[0]),
        );
        mapRef.current?.fitBounds(bounds, { padding: 100, duration: prefs.reducedMotion ? 0 : 800 });
      } catch (e) {
        if (requestId === routeRequestRef.current) {
          setStatusMessage(e instanceof Error ? e.message : "Gagal menampilkan rute.");
          setRouteErrorMaps(mapsUrl);
        }
      } finally {
        if (requestId === routeRequestRef.current) {
          setRouteLoadingId(null);
        }
      }
    },
    [userLocation, requestLocation, prefs.reducedMotion],
  );

  const clearRoute = useCallback(() => {
    setRoute(null);
    setStatusMessage(null);
    setRouteErrorMaps(null);
  }, []);

  return (
    <>
      <Header activeNav="explore" />
      <main className="flex h-[calc(100vh-4.5rem)] flex-row">
        <aside className="hidden w-[380px] flex-shrink-0 flex-col overflow-hidden border-r border-outline-variant bg-surface md:flex">
          <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-container-low p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-h3 text-on-surface">Direktori UMKM</h2>
              <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">tune</span>
            </div>
            <div className="flex rounded-lg bg-surface-variant p-1">
              <Button className="flex-1 rounded-md bg-surface shadow-sm text-label-caps text-primary" size="sm">
                Mode Peta
              </Button>
              <Button asChild variant="ghost" className="flex-1 rounded-md text-label-caps text-on-surface-variant" size="sm">
                <Link href="/outlets">Daftar Aksesibel</Link>
              </Button>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Menampilkan {filteredOutlets.length} outlet UMKM di Kampung Sanan.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-4">
              {filteredOutlets.length === 0 && (
                <p className="text-body-sm text-on-surface-variant text-center py-8">Tidak ada outlet ditemukan.</p>
              )}
              {filteredOutlets.map((outlet) => {
                const isSelected = outlet.id === selectedOutletId;
                const distance = distanceTo(outlet);
                const openLabel =
                  outlet.isOpen === null ? "jam buka tidak diketahui" : outlet.isOpen ? "buka sekarang" : "tutup";

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
                      "group cursor-pointer rounded-xl border bg-surface-container-lowest p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isSelected
                        ? "border-primary ring-2 ring-primary/25"
                        : "border-outline-variant hover:border-primary",
                    )}
                    aria-label={`${outlet.name}, kategori ${outlet.category}, ${outlet.rating !== null ? `rating ${outlet.rating}` : "belum ada rating"}, ${openLabel}${distance ? `, ${distance} dari lokasi Anda` : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="mb-2 inline-block rounded-full bg-tertiary-fixed px-2 py-1 text-[10px] font-semibold uppercase text-on-tertiary-fixed-variant">
                          {outlet.category}
                        </span>
                        <h3 className="font-heading text-body-lg text-on-surface group-hover:text-primary">{outlet.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 rounded-md bg-surface-container px-2 py-1">
                        <span className="material-symbols-outlined text-sm text-primary-container" style={{ fontVariationSettings: '"FILL" 1' }} aria-hidden="true">
                          star
                        </span>
                        <span className="text-label-caps text-on-surface">
                          {outlet.rating !== null ? outlet.rating : "–"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-body-sm text-on-surface-variant">{outlet.description}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className={cn("flex items-center gap-1", outlet.isOpen ? "text-tertiary" : "text-on-surface-variant")}>
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">storefront</span>
                        <span className="text-label-caps">
                          {outlet.isOpen === null ? "Lihat Jam Buka" : outlet.isOpen ? "Buka Sekarang" : "Tutup"}
                        </span>
                      </div>
                      {distance && (
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm" aria-hidden="true">directions_walk</span>
                          <span className="text-body-sm">{distance}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Link href={`/outlets/${outlet.slug}`} className="text-body-sm text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                        Detail
                      </Link>
                      <button
                        type="button"
                        className="text-body-sm text-primary hover:underline disabled:opacity-60"
                        disabled={routeLoadingId === outlet.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowRoute(outlet);
                        }}
                      >
                        {routeLoadingId === outlet.id ? "Mencari rute..." : "Rute"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex-1 relative bg-surface-container-highest">
          <Map ref={mapRef} className="absolute inset-0" center={SANAN_CENTER} zoom={SANAN_DEFAULT_ZOOM}>
            <MapControls
              showZoom
              showLocate
              showCompass
              onLocate={(coords) => setUserLocation({ latitude: coords.latitude, longitude: coords.longitude })}
              onLocateError={(message) => setStatusMessage(message)}
            />
            <FitToOutlets points={markerPoints} />

            {route && (
              <MapRoute
                coordinates={route.coordinates}
                color="#1a73e8"
                width={5}
                opacity={0.85}
                interactive={false}
              />
            )}

            {userLocation && (
              <MapMarker longitude={userLocation.longitude} latitude={userLocation.latitude}>
                <MarkerContent>
                  <div
                    role="img"
                    aria-label="Lokasi Anda saat ini"
                    className="h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-[0_0_0_6px_rgba(37,99,235,0.25)]"
                  />
                </MarkerContent>
              </MapMarker>
            )}

            {filteredOutlets.map((outlet) => {
              const isSelected = outlet.id === selectedOutletId;
              return (
                <MapMarker
                  key={outlet.id}
                  longitude={outlet.longitude}
                  latitude={outlet.latitude}
                  onClick={() => setSelectedOutletId(outlet.id)}
                >
                  <MarkerContent>
                    <div
                      role="img"
                      aria-label={`Marker outlet ${outlet.name}, kategori ${outlet.category}`}
                      className={cn(
                        "h-4 w-4 rounded-full border-2 border-white shadow-md transition-all",
                        isSelected ? "bg-primary scale-125" : "bg-tertiary",
                      )}
                    />
                  </MarkerContent>
                  <MarkerPopup closeButton>
                    <div className="space-y-2 p-2">
                      <p className="font-medium text-sm">{outlet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {outlet.category} &middot; {outlet.isOpen === null ? "Lihat jam buka" : outlet.isOpen ? "Buka" : "Tutup"}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/outlets/${outlet.slug}`} className="text-xs text-primary hover:underline">Detail</Link>
                        <button type="button" className="text-xs text-primary hover:underline" onClick={() => handleShowRoute(outlet)}>
                          Rute
                        </button>
                      </div>
                    </div>
                  </MarkerPopup>
                </MapMarker>
              );
            })}
          </Map>

          <div className="absolute left-6 right-6 top-6 z-10 pointer-events-none flex flex-col gap-4">
            <div className="pointer-events-auto flex max-w-md items-center rounded-full border border-outline-variant bg-surface px-4 py-3 shadow-[var(--shadow-level-1)]">
              <span className="material-symbols-outlined mr-3 text-on-surface-variant" aria-hidden="true">search</span>
              <input
                className="flex-1 bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
                placeholder="Cari oleh-oleh, warung, atau lokasi..."
                type="text"
                aria-label="Cari outlet UMKM"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button variant="ghost" size="icon" aria-label="Hapus pencarian" className="ml-1 text-on-surface-variant" onClick={() => setSearchQuery("")}>
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
                </Button>
              )}
            </div>
            <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-2 no-scrollbar" role="group" aria-label="Filter outlet">
              {filterOptions.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap rounded-full"
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Status / error pencarian rute */}
          <div aria-live="polite" className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2 px-6 pointer-events-none">
            {statusMessage && (
              <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-outline-variant bg-surface px-4 py-3 shadow-lg">
                <span className="material-symbols-outlined text-error" aria-hidden="true">error</span>
                <p className="text-body-sm text-on-surface">{statusMessage}</p>
                {routeErrorMaps && (
                  <a
                    href={routeErrorMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap text-body-sm font-medium text-primary hover:underline"
                  >
                    Buka di Google Maps
                  </a>
                )}
                <Button variant="ghost" size="icon" aria-label="Tutup pesan" onClick={() => { setStatusMessage(null); setRouteErrorMaps(null); }}>
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
                </Button>
              </div>
            )}

            {route && (
              <div className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-outline-variant bg-surface px-5 py-3 shadow-lg">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">directions_walk</span>
                <div>
                  <p className="text-body-sm font-medium text-on-surface">Rute jalan kaki ke {route.outletName}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {formatDistance(route.distanceMeters)} &middot; sekitar {formatDuration(route.durationSeconds)}
                  </p>
                </div>
                <a
                  className="text-body-sm text-primary hover:underline"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${route.destLatitude},${route.destLongitude}&travelmode=walking`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buka di Google Maps
                </a>
                <Button variant="ghost" size="sm" onClick={clearRoute}>
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
                  Tutup Rute
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
