"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { getReports, resolveReport } from "@/lib/actions/reports";

type ReportRow = {
  id: string;
  outlet_id: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
  outlets?: { name: string } | null;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReports();
      if (result.error) {
        setError(`Gagal memuat laporan: ${result.error}`);
        setReports([]);
      } else {
        setReports((result.data ?? []) as unknown as ReportRow[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  async function handleResolve(id: string, status: "resolved" | "rejected") {
    setMessage(null);
    const result = await resolveReport(id, status);
    if (!result.success) {
      setMessage(`Gagal memperbarui laporan: ${result.error}`);
    } else {
      setMessage(status === "resolved" ? "Laporan ditandai selesai." : "Laporan ditolak.");
    }
    loadReports();
  }

  const statusColors: Record<string, string> = {
    open: "bg-error-container text-on-error-container",
    in_review: "bg-secondary-container text-on-secondary-container",
    resolved: "bg-tertiary/10 text-tertiary",
    rejected: "bg-surface-container-high text-on-surface-variant",
  };

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Laporan Data Salah</h2>
          <p className="text-body-sm text-on-surface-variant">Kelola laporan dari pengguna tentang data yang tidak akurat</p>
        </header>

        {message && (
          <div className="mb-6 rounded-lg bg-secondary-container p-3 text-body-sm text-on-secondary-container" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-2">
          {["all", "open", "in_review", "resolved", "rejected"].map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
              className="capitalize"
            >
              {s === "all" ? "Semua" : s.replace(/_/g, " ")}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant" role="status">Loading...</div>
        ) : (
          <div className="rounded-xl border border-outline-variant bg-surface overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase border-b border-outline-variant">
                  <th className="p-4 font-medium">Outlet</th>
                  <th className="p-4 font-medium">Tipe</th>
                  <th className="p-4 font-medium">Deskripsi</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-body-sm divide-y divide-outline-variant">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                      {reports.length === 0
                        ? "Belum ada laporan dari pengguna."
                        : "Tidak ada laporan dengan status ini."}
                    </td>
                  </tr>
                )}
                {filtered.map((report) => (
                  <tr key={report.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-on-surface">{report.outlets?.name ?? "Outlet"}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(report.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </td>
                    <td className="p-4 text-on-surface-variant capitalize">{report.type.replace(/_/g, " ")}</td>
                    <td className="p-4 text-on-surface-variant max-w-[300px] truncate">{report.description}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium ${statusColors[report.status] ?? statusColors.open}`}>
                        {report.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      {report.status === "open" || report.status === "in_review" ? (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="text-tertiary text-xs" onClick={() => handleResolve(report.id, "resolved")}>
                            Resolve
                          </Button>
                          <Button variant="ghost" size="sm" className="text-error text-xs" onClick={() => handleResolve(report.id, "rejected")}>
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
