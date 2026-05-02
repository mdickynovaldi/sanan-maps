import type { Outlet } from "@/lib/mock-data";

export type SupabaseOutletRow = {
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
  opening_hours: Record<string, string> | null;
  status: "pending" | "approved" | "rejected" | "archived";
};

export function adaptSupabaseOutletToUi(
  outlet: SupabaseOutletRow,
  extras?: {
    rating?: number;
    reviewCount?: number;
    isOpen?: boolean;
    distance?: string;
    category?: string;
    categorySlug?: string;
    image?: string;
  }
): Outlet {
  return {
    id: Number.parseInt(outlet.id.replace(/-/g, "").slice(0, 8), 16) || Date.now(),
    slug: outlet.slug,
    name: outlet.name,
    category: extras?.category ?? "UMKM",
    categorySlug: extras?.categorySlug ?? "umkm",
    longitude: outlet.longitude,
    latitude: outlet.latitude,
    rating: extras?.rating ?? 4.5,
    reviewCount: extras?.reviewCount ?? 0,
    isOpen: extras?.isOpen ?? true,
    distance: extras?.distance ?? "-",
    description: outlet.description,
    address: outlet.address,
    landmark: outlet.landmark_description,
    accessibility: outlet.accessibility_description,
    whatsapp: outlet.whatsapp ?? "",
    image:
      extras?.image ??
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    openingHours: outlet.opening_hours ?? { "Senin-Minggu": "08:00 - 17:00" },
    facilities: [],
    products: [],
    reviews: [],
    status: outlet.status,
  };
}
