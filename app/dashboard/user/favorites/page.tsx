"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DashboardNav, userNavItems } from "@/components/layout/dashboard-nav";
import { createClient } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/actions/favorites";

type FavoriteOutlet = {
  id: string;
  outlet_id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  image: string | null;
  imageAlt: string | null;
  rating: number | null;
};

type FavoriteRow = {
  id: string;
  outlet_id: string;
  outlets: {
    slug: string;
    name: string;
    description: string;
    outlet_categories: Array<{ categories: { name: string } | null }> | null;
    reviews: Array<{ rating: number; status: string }> | null;
    products: Array<{ image_url: string | null; image_alt: string | null }> | null;
  } | null;
};

export default function UserFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("Anda perlu masuk untuk melihat outlet favorit.");
        setFavorites([]);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select(
          "id, outlet_id, outlets(slug, name, description, outlet_categories(categories(name)), reviews(rating, status), products(image_url, image_alt))",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`Gagal memuat favorit: ${error.message}`);
        setFavorites([]);
        return;
      }

      const mapped = ((data ?? []) as unknown as FavoriteRow[])
        .filter((row) => row.outlets !== null)
        .map((row) => {
          const outlet = row.outlets!;
          const ratings = (outlet.reviews ?? []).filter((r) => r.status === "approved");
          const rating =
            ratings.length > 0
              ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
              : null;
          const photo = (outlet.products ?? []).find((p) => p.image_url)?.image_url ?? null;
          const photoAlt = (outlet.products ?? []).find((p) => p.image_url)?.image_alt ?? null;
          return {
            id: row.id,
            outlet_id: row.outlet_id,
            name: outlet.name,
            slug: outlet.slug,
            description: outlet.description,
            category: outlet.outlet_categories?.[0]?.categories?.name ?? "UMKM",
            image: photo,
            imageAlt: photoAlt,
            rating,
          } satisfies FavoriteOutlet;
        });

      setFavorites(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  async function handleRemove(outletId: string) {
    setMessage(null);
    setRemovingId(outletId);
    const result = await toggleFavorite(outletId);
    if (!result.success) {
      setMessage(`Gagal menghapus favorit: ${result.error}`);
      setRemovingId(null);
      return;
    }
    setRemovingId(null);
    loadFavorites();
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Sanan Explorer" subtitle="User Dashboard" items={userNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Favorite Outlets</h2>
          <p className="text-body-sm text-on-surface-variant">Outlet yang Anda simpan untuk dikunjungi nanti</p>
        </header>

        {message && (
          <div className="mb-6 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant" role="status">Loading...</div>
        ) : favorites.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block" aria-hidden="true">favorite_border</span>
            <p>Belum ada outlet favorit. Jelajahi outlet dan simpan yang Anda suka!</p>
            <Link href="/outlets" className="text-primary hover:underline mt-2 inline-block">Jelajahi Outlet</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((outlet) => (
              <div key={outlet.id} className="rounded-xl border border-outline-variant bg-surface overflow-hidden shadow-sm">
                <div className="relative h-48 bg-surface-container-high">
                  {outlet.image ? (
                    <Image src={outlet.image} alt={outlet.imageAlt ?? outlet.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl" aria-hidden="true">storefront</span>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-h3 text-on-surface">{outlet.name}</h3>
                      <p className="text-body-sm text-on-surface-variant">{outlet.category}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Hapus ${outlet.name} dari favorit`}
                      disabled={removingId === outlet.outlet_id}
                      onClick={() => handleRemove(outlet.outlet_id)}
                    >
                      <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: '"FILL" 1' }} aria-hidden="true">favorite</span>
                    </Button>
                  </div>
                  <p className="text-body-sm text-on-surface-variant line-clamp-2">{outlet.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-primary-container" style={{ fontVariationSettings: '"FILL" 1' }} aria-hidden="true">star</span>
                      <span className="text-body-sm text-on-surface">{outlet.rating !== null ? outlet.rating : "–"}</span>
                    </div>
                    <Link href={`/outlets/${outlet.slug}`}>
                      <Button size="sm">Lihat Detail</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
