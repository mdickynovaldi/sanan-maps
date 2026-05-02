"use server";

type CoverageResult = {
  available: boolean;
  panoId?: string;
  location?: { lat: number; lng: number };
  error?: string;
};

export async function checkStreetViewCoverage(
  latitude: number,
  longitude: number,
  radius: number = 50
): Promise<CoverageResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { available: false, error: "Google Maps API key belum dikonfigurasi" };
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/streetview/metadata");
    url.searchParams.set("location", `${latitude},${longitude}`);
    url.searchParams.set("radius", radius.toString());
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!response.ok) {
      return { available: false, error: `Google API error: ${response.status}` };
    }

    const data = await response.json();

    if (data.status === "OK") {
      return {
        available: true,
        panoId: data.pano_id,
        location: data.location ? { lat: data.location.lat, lng: data.location.lng } : undefined,
      };
    }

    return { available: false };
  } catch (err) {
    return { available: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
