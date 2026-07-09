"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { createClient } from "@/lib/supabase/client";

type RecentOutletRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  outlet_categories: Array<{ categories: { name: string } | null }> | null;
};

type PendingReviewRow = {
  id: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  outlets: { name: string } | null;
  profiles: { name: string } | null;
};

type Metrics = {
  totalOutlets: number;
  pending: number;
  reports: number;
};

function statusChipClasses(status: string): string {
  if (status === "approved") return "bg-tertiary/10 text-tertiary";
  if (status === "pending") return "bg-secondary-container text-on-secondary-container";
  return "bg-error-container text-on-error-container";
}

function statusDotClasses(status: string): string {
  if (status === "approved") return "bg-tertiary";
  if (status === "pending") return "bg-secondary";
  return "bg-error";
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({ totalOutlets: 0, pending: 0, reports: 0 });
  const [recentOutlets, setRecentOutlets] = useState<RecentOutletRow[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const [totalRes, pendingRes, reportsRes, outletsRes, reviewsRes] = await Promise.all([
        supabase.from("outlets").select("*", { count: "exact", head: true }),
        supabase.from("outlets").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase
          .from("outlets")
          .select("id, name, slug, status, outlet_categories(categories(name))")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("reviews")
          .select("*, outlets(name), profiles(name)")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Data outlet adalah metrik inti — kalau gagal, tampilkan error, bukan angka palsu.
      if (totalRes.error || pendingRes.error || outletsRes.error) {
        setError(
          `Gagal memuat data dashboard: ${
            totalRes.error?.message ?? pendingRes.error?.message ?? outletsRes.error?.message
          }`,
        );
        return;
      }

      setMetrics({
        totalOutlets: totalRes.count ?? 0,
        pending: pendingRes.count ?? 0,
        // Tabel reports opsional — kalau tidak bisa dibaca, tampilkan 0, bukan gagal total.
        reports: reportsRes.error ? 0 : reportsRes.count ?? 0,
      });
      setRecentOutlets((outletsRes.data ?? []) as unknown as RecentOutletRow[]);
      setPendingReviews(reviewsRes.error ? [] : ((reviewsRes.data ?? []) as unknown as PendingReviewRow[]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const metricCards: Array<{ title: string; value: number; icon: string; iconColor: string; note: string; noteColor: string }> = [
    {
      title: "Total Outlets",
      value: metrics.totalOutlets,
      icon: "store",
      iconColor: "text-primary",
      note: "Seluruh outlet terdaftar",
      noteColor: "text-on-surface-variant",
    },
    {
      title: "Pending Verification",
      value: metrics.pending,
      icon: "pending_actions",
      iconColor: "text-secondary",
      note: metrics.pending > 0 ? "Perlu verifikasi" : "Semua sudah diverifikasi",
      noteColor: metrics.pending > 0 ? "text-error" : "text-on-surface-variant",
    },
    {
      title: "Reported Issues",
      value: metrics.reports,
      icon: "report_problem",
      iconColor: "text-error",
      note: metrics.reports > 0 ? "Perlu ditinjau" : "Tidak ada laporan",
      noteColor: metrics.reports > 0 ? "text-error" : "text-on-surface-variant",
    },
  ];

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] flex flex-col h-full overflow-y-auto bg-surface-container-lowest">
        <header className="sticky top-0 z-40 flex justify-between items-center bg-surface/95 backdrop-blur-md border-b border-outline-variant px-8 py-4 shadow-[var(--shadow-level-1)]">
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-h2 text-on-surface">System Overview</h2>
            {!loading && !error && (
              <span className="rounded-full border border-primary-container/30 bg-primary-container/20 px-3 py-1 text-label-caps text-on-primary-container">Live Data</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true">search</span>
              <input placeholder="Search outlets, users..." aria-label="Cari outlet atau pengguna" className="pl-10 pr-4 py-2 bg-surface-container rounded-lg border-none text-body-sm w-64 shadow-sm focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container font-bold text-sm">A</div>
          </div>
        </header>

        {loading ? (
          <div className="p-8 text-center text-on-surface-variant" role="status">Memuat data dashboard...</div>
        ) : error ? (
          <div className="p-8 mx-auto w-full max-w-[1280px]">
            <div className="rounded-xl border border-outline-variant bg-error-container p-6 text-on-error-container" role="alert">
              <p className="font-medium">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={load}>
                <span className="material-symbols-outlined text-sm" aria-hidden="true">refresh</span>
                Coba lagi
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 mx-auto w-full max-w-[1280px] flex flex-col gap-8">
            {/* Key Metrics */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metricCards.map((card) => (
                <div key={card.title} className="rounded-xl border border-outline-variant bg-surface p-6 shadow-[var(--shadow-level-1)] flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-label-caps text-on-surface-variant mb-1 uppercase">{card.title}</p>
                      <h3 className="font-heading text-h1 text-on-surface">{card.value}</h3>
                    </div>
                    <div className={`p-3 bg-surface-container-high rounded-lg ${card.iconColor}`}>
                      <span className="material-symbols-outlined text-3xl" aria-hidden="true">{card.icon}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${card.noteColor}`}>
                    {card.note}
                  </div>
                </div>
              ))}
            </section>

            {/* Main Data Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Outlet Management Table */}
              <div className="lg:col-span-2 rounded-xl border border-outline-variant bg-surface shadow-[var(--shadow-level-1)] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                  <div>
                    <h3 className="font-heading text-h3 text-on-surface">Outlet Management</h3>
                    <p className="text-body-sm text-on-surface-variant">Outlet terbaru dan status verifikasinya.</p>
                  </div>
                  <Button asChild variant="ghost" className="text-primary">
                    <Link href="/dashboard/admin/outlets">
                      View All <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                    </Link>
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase border-b border-outline-variant">
                        <th className="p-4 font-medium">Outlet Name</th>
                        <th className="p-4 font-medium">Category</th>
                        <th className="p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-sm divide-y divide-outline-variant">
                      {recentOutlets.map((outlet) => (
                        <tr key={outlet.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                                <span className="material-symbols-outlined" aria-hidden="true">storefront</span>
                              </div>
                              <p className="font-medium text-on-surface">{outlet.name}</p>
                            </div>
                          </td>
                          <td className="p-4 text-on-surface-variant">
                            {outlet.outlet_categories?.[0]?.categories?.name ?? "UMKM"}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${statusChipClasses(outlet.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusDotClasses(outlet.status)}`}></span>
                              {outlet.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {recentOutlets.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-on-surface-variant">Belum ada outlet terdaftar.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Review Moderation */}
              <div className="flex flex-col gap-6">
                <div className="rounded-xl border border-outline-variant bg-surface flex-1 overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                    <div>
                      <h3 className="font-heading text-h3 text-on-surface">Recent Reviews</h3>
                      <p className="text-body-sm text-on-surface-variant">Menunggu moderasi</p>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="text-primary">
                      <Link href="/dashboard/admin/reviews">Moderasi</Link>
                    </Button>
                  </div>
                  <div className="flex flex-col divide-y divide-outline-variant flex-1 overflow-y-auto">
                    {pendingReviews.map((review) => {
                      const name = review.profiles?.name ?? "Pengguna";
                      const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <Link
                          key={review.id}
                          href="/dashboard/admin/reviews"
                          className="p-4 hover:bg-surface-container-lowest transition-colors flex gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold">
                            {initials}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <h4 className="text-sm font-medium text-on-surface">{name}</h4>
                              <span className="text-xs text-on-surface-variant shrink-0">
                                {new Date(review.created_at).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                            {review.outlets?.name && (
                              <p className="text-xs text-on-surface-variant mb-1">&rarr; {review.outlets.name}</p>
                            )}
                            <div className="mb-1 flex text-primary text-sm" aria-label={`Rating ${review.rating} dari 5`}>
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-[14px]" aria-hidden="true" style={{ fontVariationSettings: i < review.rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                              ))}
                            </div>
                            <p className="text-xs text-on-surface-variant line-clamp-2">{review.comment}</p>
                          </div>
                        </Link>
                      );
                    })}
                    {pendingReviews.length === 0 && (
                      <div className="p-8 text-center text-on-surface-variant text-body-sm">
                        Tidak ada review yang menunggu moderasi.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
