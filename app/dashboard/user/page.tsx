"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardNav, userNavItems } from "@/components/layout/dashboard-nav";
import { createClient } from "@/lib/supabase/client";
import { getUserFavorites } from "@/lib/actions/favorites";

type AccessibilityPreferences = {
  highContrast?: boolean;
  largeText?: boolean;
  reducedMotion?: boolean;
  defaultListView?: boolean;
  audioGuide?: boolean;
  textDirections?: boolean;
};

type ProfileData = {
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  accessibility_preferences: AccessibilityPreferences | null;
};

type FavoriteOutlet = {
  id: string;
  slug: string;
  name: string;
};

type FavoriteRow = {
  id: string;
  outlets: FavoriteOutlet | null;
};

const PREFERENCE_LABELS: Record<string, { label: string; desc: string }> = {
  highContrast: { label: "High Contrast", desc: "Enhance visual readability" },
  largeText: { label: "Large Text", desc: "Increase font sizes" },
  reducedMotion: { label: "Reduced Motion", desc: "Minimize animations" },
  defaultListView: { label: "Default List View", desc: "Prefer list over map" },
  audioGuide: { label: "Audio Guide", desc: "Enable audio descriptions" },
  textDirections: { label: "Text Directions", desc: "Step-by-step text routes" },
};

export default function UserDashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [favCount, setFavCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [favorites, setFavorites] = useState<FavoriteOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favError, setFavError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      setFavError(null);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Anda harus masuk untuk melihat dashboard.");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setError(`Gagal memuat profil: ${profileError.message}`);
          return;
        }
        setProfile(profileData as unknown as ProfileData);

        const { count: fc } = await supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        setFavCount(fc ?? 0);

        const { count: rc } = await supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        setReviewCount(rc ?? 0);

        const favResult = await getUserFavorites();
        if (favResult.error) {
          setFavError(`Gagal memuat outlet favorit: ${favResult.error}`);
        } else {
          const rows = (favResult.data ?? []) as unknown as FavoriteRow[];
          setFavorites(
            rows
              .map((row) => row.outlets)
              .filter((outlet): outlet is FavoriteOutlet => outlet !== null),
          );
        }
      } catch {
        setError("Terjadi kesalahan saat memuat dashboard.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displayName = profile?.name ?? "";
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "";
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  const prefEntries = Object.entries(profile?.accessibility_preferences ?? {}).filter(
    (entry): entry is [string, boolean] =>
      typeof entry[1] === "boolean" && entry[0] in PREFERENCE_LABELS,
  );

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Sanan Explorer" subtitle="User Dashboard" items={userNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        {loading ? (
          <div className="text-center py-16 text-on-surface-variant" role="status">
            Memuat dashboard...
          </div>
        ) : error ? (
          <div className="rounded-lg bg-error-container p-4 text-body-md text-on-error-container" role="alert">
            {error}
          </div>
        ) : profile ? (
          <>
            <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-h2 text-on-background mb-1">Welcome back, {displayName}!</h2>
                <p className="text-body-sm text-on-surface-variant">Ready to explore more of Sanan today?</p>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest relative flex items-center justify-center">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-heading text-h3 text-on-surface" aria-hidden="true">{initial}</span>
                  )}
                </div>
                <div>
                  <p className="text-body-md font-semibold text-on-surface">{displayName}</p>
                  <p className="text-body-sm text-on-surface-variant">{profile.role}</p>
                </div>
              </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Reviews", value: reviewCount, icon: "rate_review", href: "/dashboard/user/reviews" },
                { label: "Favorites", value: favCount, icon: "favorite", href: "/dashboard/user/favorites" },
                { label: "Joined", value: joinDate, icon: "calendar_today", href: "#" },
                { label: "Role", value: profile.role, icon: "badge", href: "#" },
              ].map((stat) => (
                <Link key={stat.label} href={stat.href} className="rounded-xl border border-outline-variant bg-surface p-4 hover:shadow-md transition-shadow">
                  <span className="material-symbols-outlined text-primary-container mb-2" aria-hidden="true">{stat.icon}</span>
                  <p className="font-heading text-h3 text-on-surface">{stat.value}</p>
                  <p className="text-body-sm text-on-surface-variant">{stat.label}</p>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Favorite Outlets */}
              <section className="md:col-span-8 rounded-xl border border-outline-variant/30 bg-surface p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-heading text-h3 text-on-surface">Favorite Outlets</h3>
                  <Link href="/dashboard/user/favorites" className="text-body-sm text-primary hover:underline">View All</Link>
                </div>
                {favError ? (
                  <div className="rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
                    {favError}
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-6 text-center text-body-sm text-on-surface-variant">
                    Belum ada outlet favorit. Jelajahi peta untuk menambahkan.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.slice(0, 4).map((outlet) => (
                      <Card key={outlet.id} className="overflow-hidden">
                        <div className="relative h-32 flex items-center justify-center bg-surface-container-high">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant" aria-hidden="true">storefront</span>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-semibold text-on-surface">{outlet.name}</h4>
                          <Link href={`/outlets/${outlet.slug}`} className="text-body-sm text-primary hover:underline mt-1 inline-block">
                            Lihat Detail &rarr;
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {/* Quick Preferences */}
              <section className="md:col-span-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-h3 text-on-surface">Quick Preferences</h3>
                  <Link href="/dashboard/user/settings" className="text-body-sm text-primary hover:underline">Edit</Link>
                </div>
                {prefEntries.length > 0 ? (
                  <div className="space-y-4">
                    {prefEntries.map(([key, enabled]) => {
                      const meta = PREFERENCE_LABELS[key];
                      if (!meta) return null;
                      return (
                        <div key={key} className="flex items-center justify-between rounded-lg border border-outline-variant/50 bg-surface p-3">
                          <div>
                            <p className="text-body-md font-semibold text-on-surface">{meta.label}</p>
                            <p className="text-body-sm text-on-surface-variant">{meta.desc}</p>
                          </div>
                          <div
                            role="img"
                            aria-label={`${meta.label}: ${enabled ? "aktif" : "nonaktif"}`}
                            className={`h-6 w-11 rounded-full ${enabled ? "bg-primary-container" : "bg-surface-variant"}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-body-sm text-on-surface-variant">
                    Belum ada preferensi aksesibilitas.{" "}
                    <Link href="/dashboard/user/settings" className="text-primary hover:underline">Atur preferensi</Link>
                  </p>
                )}
              </section>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
