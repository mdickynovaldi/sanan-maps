"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardNav, ownerNavItems } from "@/components/layout/dashboard-nav";
import { getReportsForMyOutlets } from "@/lib/actions/reports";

type ReportRow = {
  id: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
  outlets?: { name: string; slug: string } | null;
};

const TYPE_LABELS: Record<string, string> = {
  wrong_location: "Lokasi salah",
  wrong_hours: "Jam buka salah",
  abusive_review: "Review kasar",
  accessibility_issue: "Info aksesibilitas tidak akurat",
  other: "Lainnya",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  open: { label: "Terbuka", className: "bg-error-container text-on-error-container" },
  in_review: { label: "Sedang ditinjau admin", className: "bg-secondary-container text-on-secondary-container" },
  resolved: { label: "Selesai", className: "bg-tertiary/10 text-tertiary" },
  rejected: { label: "Ditolak", className: "bg-surface-container-high text-on-surface-variant" },
};

export default function OwnerReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const result = await getReportsForMyOutlets();
      if (result.error) {
        setError(`Gagal memuat laporan: ${result.error}`);
        setReports([]);
      } else {
        setReports((result.data ?? []) as unknown as ReportRow[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Sanan Explorer" subtitle="Owner Dashboard" items={ownerNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 pb-24 md:pb-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Laporan Pengunjung</h2>
          <p className="text-body-sm text-on-surface-variant">
            Masukan dari pengunjung tentang data outlet Anda — perbarui data outlet bila laporan benar,
            atau hubungi admin bila perlu bantuan. Status laporan dikelola admin.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant" role="status">Memuat laporan...</div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block" aria-hidden="true">flag</span>
            <p>Belum ada laporan untuk outlet Anda. Itu pertanda data Anda akurat!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const status = STATUS_LABELS[report.status] ?? STATUS_LABELS.open;
              return (
                <article key={report.id} className="rounded-xl border border-outline-variant bg-surface p-6">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-on-surface">{report.outlets?.name ?? "Outlet"}</span>
                      <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                        {TYPE_LABELS[report.type] ?? report.type}
                      </span>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-body-md text-on-surface-variant">{report.description}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-outline-variant/50 pt-3">
                    <span className="text-body-sm text-on-surface-variant">
                      {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    {report.outlets?.slug && (
                      <Link href={`/outlets/${report.outlets.slug}`} className="text-body-sm text-primary hover:underline">
                        Lihat outlet &rarr;
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
