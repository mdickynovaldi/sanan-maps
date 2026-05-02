"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DashboardNav, userNavItems } from "@/components/layout/dashboard-nav";
import { createClient } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/actions/favorites";
import { featuredOutlets } from "@/lib/mock-data";

type FavoriteOutlet = {
  id: string;
  outlet_id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  rating: number;
};

export default function UserFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteOutlet[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("not logged in");

      const { data } = await supabase
        .from("favorites")
        .select("id, outlet_id, outlets(name, slug, description)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setFavorites(data.map((f: unknown) => {
          const fav = f as { id: string; outlet_id: string; outlets: { name: string; slug: string; description: string } | null };
          return {
            id: fav.id,
            outlet_id: fav.outlet_id,
            name: fav.outlets?.name ?? "Outlet",
            slug: fav.outlets?.slug ?? "",
            description: fav.outlets?.description ?? "",
            category: "UMKM",
            image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
            rating: 4.5,
          };
        }));
      } else {
        throw new Error("empty");
      }
    } catch {
      // Fallback to mock
      setFavorites(featuredOutlets.map((o) => ({
        id: String(o.id),
        outlet_id: String(o.id),
        name: o.name,
        slug: o.slug,
        description: o.description,
        category: o.category,
        image: o.image,
        rating: o.rating,
      })));
    }
    setLoading(false);
  }

  useEffect(() => { loadFavorites(); }, []);

  async function handleRemove(outletId: string) {
    await toggleFavorite(outletId);
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

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((outlet) => (
              <div key={outlet.id} className="rounded-xl border border-outline-variant bg-surface overflow-hidden shadow-sm">
                <div className="relative h-48">
                  <Image src={outlet.image} alt={outlet.name} fill className="object-cover" />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-h3 text-on-surface">{outlet.name}</h3>
                      <p className="text-body-sm text-on-surface-variant">{outlet.category}</p>
                    </div>
                    <Button variant="ghost" size="icon" aria-label="Hapus favorit" onClick={() => handleRemove(outlet.outlet_id)}>
                      <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: '"FILL" 1' }}>favorite</span>
                    </Button>
                  </div>
                  <p className="text-body-sm text-on-surface-variant line-clamp-2">{outlet.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-primary-container" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                      <span className="text-body-sm text-on-surface">{outlet.rating}</span>
                    </div>
                    <Link href={`/outlets/${outlet.slug}`}>
                      <Button size="sm">Lihat Detail</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {favorites.length === 0 && (
              <div className="col-span-full rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">favorite_border</span>
                <p>Belum ada outlet favorit. Jelajahi outlet dan simpan yang Anda suka!</p>
                <Link href="/outlets" className="text-primary hover:underline mt-2 inline-block">Jelajahi Outlet</Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
