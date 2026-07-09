"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  totalOutlets: number;
  approvedOutlets: number;
  pendingOutlets: number;
  rejectedOutlets: number;
  totalReviews: number;
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const results = await Promise.all([
        supabase.from("outlets").select("*", { count: "exact", head: true }),
        supabase.from("outlets").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("outlets").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("outlets").select("*", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      const failed = results.find((r) => r.error);
      if (failed?.error) {
        setError(`Gagal memuat statistik: ${failed.error.message}`);
        setStats(null);
        return;
      }

      setStats({
        totalOutlets: results[0].count ?? 0,
        approvedOutlets: results[1].count ?? 0,
        pendingOutlets: results[2].count ?? 0,
        rejectedOutlets: results[3].count ?? 0,
        totalReviews: results[4].count ?? 0,
        totalProducts: results[5].count ?? 0,
        totalCategories: results[6].count ?? 0,
        totalUsers: results[7].count ?? 0,
      });
    } catch (e) {
      setError(`Gagal memuat statistik: ${e instanceof Error ? e.message : "kesalahan tidak diketahui"}`);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => n.toLocaleString("id-ID");

  const cards = stats
    ? [
        { label: "Total Outlets", value: fmt(stats.totalOutlets), icon: "storefront", color: "text-primary" },
        { label: "Outlet Disetujui", value: fmt(stats.approvedOutlets), icon: "check_circle", color: "text-tertiary" },
        { label: "Menunggu Verifikasi", value: fmt(stats.pendingOutlets), icon: "pending", color: "text-secondary" },
        { label: "Outlet Ditolak", value: fmt(stats.rejectedOutlets), icon: "cancel", color: "text-error" },
        { label: "Total Review", value: fmt(stats.totalReviews), icon: "rate_review", color: "text-tertiary" },
        { label: "Total Produk", value: fmt(stats.totalProducts), icon: "inventory_2", color: "text-primary" },
        { label: "Total Kategori", value: fmt(stats.totalCategories), icon: "category", color: "text-secondary" },
        { label: "Total Pengguna", value: fmt(stats.totalUsers), icon: "people", color: "text-secondary" },
      ]
    : [];

  const statusBars = stats
    ? [
        { label: "Disetujui", count: stats.approvedOutlets, bar: "bg-tertiary" },
        { label: "Menunggu", count: stats.pendingOutlets, bar: "bg-secondary" },
        { label: "Ditolak", count: stats.rejectedOutlets, bar: "bg-error" },
      ]
    : [];
  const statusTotal = statusBars.reduce((s, b) => s + b.count, 0);
  const isEmpty =
    stats !== null &&
    stats.totalOutlets === 0 &&
    stats.totalReviews === 0 &&
    stats.totalProducts === 0 &&
    stats.totalUsers === 0;

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Analytics</h2>
          <p className="text-body-sm text-on-surface-variant">Statistik penggunaan platform</p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-12 text-center text-on-surface-variant" role="status">
            Memuat statistik...
          </div>
        ) : error ? null : isEmpty ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block" aria-hidden="true">bar_chart</span>
            <p className="text-body-md text-on-surface">
              Belum ada data untuk ditampilkan. Statistik akan muncul setelah ada outlet, produk, dan aktivitas pengguna.
            </p>
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {cards.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-outline-variant bg-surface p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`material-symbols-outlined text-2xl ${stat.color}`} aria-hidden="true">{stat.icon}</span>
                  </div>
                  <p className="font-heading text-h2 text-on-surface">{stat.value}</p>
                  <p className="text-body-sm text-on-surface-variant">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Outlet status distribution (computed from real counts) */}
            <div className="rounded-xl border border-outline-variant bg-surface p-6">
              <h3 className="font-heading text-h3 text-on-surface mb-1">Distribusi Status Outlet</h3>
              <p className="text-body-sm text-on-surface-variant mb-4">
                Dari total {fmt(stats.totalOutlets)} outlet terdaftar
              </p>
              <div className="space-y-4">
                {statusBars.map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-body-sm text-on-surface-variant w-24 shrink-0">{item.label}</span>
                    <div className="flex-1">
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.bar} rounded-full`}
                          style={{ width: `${statusTotal > 0 ? (item.count / statusTotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-body-sm text-on-surface-variant w-10 text-right">{fmt(item.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
