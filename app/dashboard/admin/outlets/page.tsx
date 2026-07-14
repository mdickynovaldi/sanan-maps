"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { OutletForm } from "@/components/features/outlet-form";
import { getAllOutlets, approveOutlet, rejectOutlet } from "@/lib/actions/outlets";

type OutletRow = {
  id: string;
  name: string;
  slug: string;
  address: string;
  status: string;
  latitude: number;
  longitude: number;
  description: string;
  landmark_description: string;
  accessibility_description: string;
  whatsapp: string | null;
  opening_hours: Record<string, string> | null;
};

export default function AdminOutletsPage() {
  const [outlets, setOutlets] = useState<OutletRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<OutletRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadOutlets() {
    setLoading(true);
    const result = await getAllOutlets();
    if (result.error) {
      setMessage(`Gagal memuat outlet: ${result.error}`);
      setOutlets([]);
    } else {
      setOutlets((result.data ?? []) as unknown as OutletRow[]);
    }
    setLoading(false);
  }

  useEffect(() => { loadOutlets(); }, []);

  const filtered = outlets.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleApprove(id: string) {
    setMessage(null);
    const result = await approveOutlet(id);
    setMessage(result.success ? "Outlet disetujui dan kini tampil di peta publik." : `Gagal menyetujui: ${result.error}`);
    loadOutlets();
  }

  async function handleReject(id: string) {
    setMessage(null);
    const result = await rejectOutlet(id);
    setMessage(result.success ? "Outlet ditolak." : `Gagal menolak: ${result.error}`);
    loadOutlets();
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-h2 text-on-surface">Outlet Management</h2>
            <p className="text-body-sm text-on-surface-variant">Kelola semua outlet UMKM Sanan</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined text-sm">{showForm ? "close" : "add"}</span>
            {showForm ? "Tutup Form" : "Tambah Outlet"}
          </Button>
        </header>

        {message && (
          <div
            className={`mb-6 rounded-lg p-3 text-body-sm ${message.startsWith("Gagal") ? "bg-error-container text-on-error-container" : "bg-tertiary/10 text-tertiary"}`}
            role="status"
          >
            {message}
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-xl border border-outline-variant bg-surface p-6">
            <h3 className="font-heading text-h3 text-on-surface mb-4">
              {editingOutlet ? `Edit: ${editingOutlet.name}` : "Tambah Outlet Baru"}
            </h3>
            <OutletForm
              key={editingOutlet?.id ?? "create"}
              mode={editingOutlet ? "edit" : "create"}
              initialData={editingOutlet ? {
                id: editingOutlet.id,
                name: editingOutlet.name,
                address: editingOutlet.address,
                latitude: editingOutlet.latitude,
                longitude: editingOutlet.longitude,
                description: editingOutlet.description,
                landmarkDescription: editingOutlet.landmark_description,
                accessibilityDescription: editingOutlet.accessibility_description,
                whatsapp: editingOutlet.whatsapp,
                openingHours: editingOutlet.opening_hours ?? undefined,
              } : undefined}
              onSuccess={() => { setShowForm(false); setEditingOutlet(null); loadOutlets(); }}
              onCancel={() => { setShowForm(false); setEditingOutlet(null); }}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari outlet..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Semua Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Loading...</div>
        ) : (
          <div className="rounded-xl border border-outline-variant bg-surface overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase border-b border-outline-variant">
                  <th className="p-4 font-medium">Outlet</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-body-sm divide-y divide-outline-variant">
                {filtered.map((outlet) => (
                  <tr key={outlet.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-on-surface">{outlet.name}</p>
                        <p className="text-on-surface-variant text-xs">{outlet.address?.slice(0, 50)}...</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${
                        outlet.status === "approved" ? "bg-tertiary/10 text-tertiary" :
                        outlet.status === "pending" ? "bg-secondary-container text-on-secondary-container" :
                        "bg-error-container text-on-error-container"
                      }`}>
                        {outlet.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button asChild variant="ghost" size="sm" className="text-xs">
                          <Link href={`/outlets/${outlet.slug}`}>View</Link>
                        </Button>
                        {outlet.status === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" className="text-xs text-tertiary" onClick={() => handleApprove(outlet.id)}>
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-error"
                              onClick={() => {
                                if (confirm(`Tolak outlet "${outlet.name}"? Outlet tidak akan tampil publik.`)) handleReject(outlet.id);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setEditingOutlet(outlet); setShowForm(true); }}>
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-on-surface-variant">Tidak ada outlet ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
