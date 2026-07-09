/**
 * Utilitas geografis untuk kawasan Kampung Sanan, Malang.
 *
 * Koordinat referensi mengikuti Jalan Sanan di OpenStreetMap (way 148916551):
 * bounding box lat -7.9622..-7.9602, lon 112.6424..112.6455
 * (Kel. Purwantoro, Kec. Blimbing, Kota Malang).
 */

/** Titik tengah Kampung Sanan sebagai [longitude, latitude] (format MapLibre). */
export const SANAN_CENTER: [number, number] = [112.644, -7.9612];

/** Zoom default yang menampilkan seluruh kampung + jalan sekitarnya. */
export const SANAN_DEFAULT_ZOOM = 16;

/** Jarak haversine antara dua titik, dalam meter. */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Format jarak meter menjadi teks ramah: "850 m" / "1,2 km". */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return "-";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} km`;
}

/** Format durasi detik menjadi "5 mnt" / "1 jam 20 mnt". */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return "-";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${Math.max(1, minutes)} mnt`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} jam ${m} mnt` : `${h} jam`;
}

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/**
 * Cek apakah outlet sedang buka berdasarkan opening_hours JSON, mis.
 * { "Senin-Jumat": "07:00 - 17:00", "Sabtu": "07:00 - 15:00", "Minggu": "Tutup" }.
 *
 * Kunci bisa berupa satu hari ("Sabtu") atau rentang ("Senin-Jumat").
 * Nilai "Tutup" (atau tidak ada entri untuk hari ini) dianggap tutup.
 * Mengembalikan null jika format tidak bisa diparse (status tak diketahui).
 */
export function isOutletOpenNow(
  openingHours: Record<string, string> | null | undefined,
  now: Date = new Date(),
): boolean | null {
  if (!openingHours || Object.keys(openingHours).length === 0) return null;

  const today = now.getDay();
  let todaysHours: string | null = null;

  for (const [key, value] of Object.entries(openingHours)) {
    const range = key.split(/\s*[-–]\s*/).map((s) => s.trim());
    if (range.length === 2) {
      const start = DAY_NAMES.findIndex((d) => d.toLowerCase() === range[0].toLowerCase());
      const end = DAY_NAMES.findIndex((d) => d.toLowerCase() === range[1].toLowerCase());
      if (start === -1 || end === -1) continue;
      // Rentang hari melingkar: Senin-Jumat, Jumat-Senin, dst.
      const inRange =
        start <= end ? today >= start && today <= end : today >= start || today <= end;
      if (inRange) {
        todaysHours = value;
        break;
      }
    } else {
      const day = DAY_NAMES.findIndex((d) => d.toLowerCase() === key.trim().toLowerCase());
      if (day === today) {
        todaysHours = value;
        break;
      }
    }
  }

  if (todaysHours === null) return false;
  if (/tutup|libur|closed/i.test(todaysHours)) return false;

  const match = todaysHours.match(/(\d{1,2})[.:](\d{2})\s*[-–]\s*(\d{1,2})[.:](\d{2})/);
  if (!match) return null;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const openMin = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  const closeMin = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
  if (closeMin < openMin) {
    // Lewat tengah malam (mis. 18:00 - 02:00)
    return nowMin >= openMin || nowMin < closeMin;
  }
  return nowMin >= openMin && nowMin < closeMin;
}

export type WalkingRoute = {
  /** Koordinat rute sebagai pasangan [longitude, latitude]. */
  coordinates: [number, number][];
  /** Jarak total dalam meter. */
  distanceMeters: number;
  /** Estimasi durasi dalam detik. */
  durationSeconds: number;
};
