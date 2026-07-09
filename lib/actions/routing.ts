"use server";

import type { WalkingRoute } from "@/lib/geo";

type LatLng = { latitude: number; longitude: number };

type RouteResult = { route: WalkingRoute | null; error?: string };

/**
 * Rute jalan kaki dari openrouteservice (foot-walking) — dipanggil di server
 * agar OPENROUTESERVICE_API_KEY tidak pernah terekspos ke browser.
 * ORS mengembalikan durasi pejalan kaki yang sebenarnya (bukan estimasi mobil).
 *
 * Bila key belum di-set, jatuh ke OSRM demo agar routing tetap jalan saat dev
 * (durasi diestimasi ~4,5 km/jam). Untuk produksi WAJIB set OPENROUTESERVICE_API_KEY.
 */
export async function getWalkingRoute(from: LatLng, to: LatLng): Promise<RouteResult> {
  const key = process.env.OPENROUTESERVICE_API_KEY;

  if (key) {
    try {
      const res = await fetch(
        "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
        {
          method: "POST",
          headers: {
            Authorization: key,
            "Content-Type": "application/json",
            Accept: "application/geo+json",
          },
          body: JSON.stringify({
            coordinates: [
              [from.longitude, from.latitude],
              [to.longitude, to.latitude],
            ],
          }),
          // Jangan cache — rute bergantung pada lokasi pengguna saat itu.
          cache: "no-store",
        },
      );

      if (!res.ok) {
        return { route: null, error: `Layanan rute menolak permintaan (${res.status}).` };
      }

      const json = (await res.json()) as {
        features?: Array<{
          geometry: { coordinates: [number, number][] };
          properties: { summary?: { distance: number; duration: number } };
        }>;
      };
      const feature = json.features?.[0];
      const summary = feature?.properties?.summary;
      if (!feature || !summary) {
        return { route: null, error: "Rute tidak ditemukan." };
      }

      return {
        route: {
          coordinates: feature.geometry.coordinates,
          distanceMeters: summary.distance,
          durationSeconds: summary.duration,
        },
      };
    } catch {
      return { route: null, error: "Gagal menghubungi layanan rute." };
    }
  }

  // Fallback dev: OSRM demo (tanpa key). Durasi mobil diabaikan, diestimasi
  // dari jarak untuk pejalan kaki (~4,5 km/jam).
  try {
    const url =
      `https://router.project-osrm.org/route/v1/foot/` +
      `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
      `?overview=full&geometries=geojson`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { route: null, error: "Layanan rute sedang tidak tersedia." };
    const json = (await res.json()) as {
      code?: string;
      routes?: Array<{ geometry: { coordinates: [number, number][] }; distance: number }>;
    };
    const route = json.routes?.[0];
    if (json.code !== "Ok" || !route) return { route: null, error: "Rute tidak ditemukan." };
    return {
      route: {
        coordinates: route.geometry.coordinates,
        distanceMeters: route.distance,
        durationSeconds: route.distance / 1.25,
      },
    };
  } catch {
    return { route: null, error: "Gagal menghubungi layanan rute." };
  }
}
