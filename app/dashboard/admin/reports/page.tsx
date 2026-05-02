"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { getReports, resolveReport } from "@/lib/actions/reports";
import { mockReports } from "@/lib/mock-data";

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
  const [filter, setFilter] = useState<string>("all");

  async function loadReports() {
    setLoading(true);
    try {
      const result = await getReports();
      if (result.data && result.data.length > 0) {
        setReports(result.data as unknown as ReportRow[]);
      } else {
        throw new Error("empty");
      }
    } catch {
      setReports(mockReports.map((r) => ({
        id: String(r.id),
        outlet_id: "",
        type: r.type,
        description: r.description,
        status: r.status,
        created_at: new Date().toISOString(),
        outlets: { name: r.outletName },
      })));
    }
    setLoading(false);
  }

  useEffect(() => { loadReports(); }, []);

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  async function handleResolve(id: string) {
    await resolveReport(id, "resolved");
    loadReports();
  }

  async function handleReject(id: string) {
    await resolveReport(id, "rejected");
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
          <div className="text-center py-12 text-on-surface-variant">Loading...</div>
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
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">Tidak ada laporan.</td>
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
                          <Button variant="ghost" size="sm" className="text-tertiary text-xs" onClick={() => handleResolve(report.id)}>
                            Resolve
                          </Button>
                          <Button variant="ghost" size="sm" className="text-error text-xs" onClick={() => handleReject(report.id)}>
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
