"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { PanoramaForm } from "@/components/features/panorama-form";
import { StreetViewChecker } from "@/components/features/street-view-checker";
import { PanoramaViewer, type PanoramaData } from "@/components/features/panorama-viewer";
import { getOutletPanoramas, deletePanorama } from "@/lib/actions/panoramas";
import { createClient } from "@/lib/supabase/client";

type PanoramaRow = {
  id: string;
  outlet_id: string;
  title: string;
  image_360_url: string;
  text_description: string;
  audio_description_url: string | null;
  latitude: number | null;
  longitude: number | null;
  heading: number | null;
  order_index: number;
  created_at: string;
};

type OutletOption = {
  id: string;
  name: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
};

export default function AdminPanoramasPage() {
  const [outlets, setOutlets] = useState<OutletOption[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<OutletOption | null>(null);
  const [panoramas, setPanoramas] = useState<PanoramaRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasStreetView, setHasStreetView] = useState(false);

  const loadPanoramas = useCallback(async (outletId: string) => {
    const result = await getOutletPanoramas(outletId);
    if (result.data) {
      setPanoramas(result.data as unknown as PanoramaRow[]);
    }
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("outlets")
        .select("id, name, description, latitude, longitude")
        .order("name");

      if (data && data.length > 0) {
        const outletList = data as unknown as OutletOption[];
        setOutlets(outletList);
        setSelectedOutlet(outletList[0]);
        await loadPanoramas(outletList[0].id);
      }
      setLoading(false);
    }
    load();
  }, [loadPanoramas]);

  async function handleOutletChange(outletId: string) {
    const outlet = outlets.find((o) => o.id === outletId);
    if (!outlet) return;
    setSelectedOutlet(outlet);
    setHasStreetView(false);
    await loadPanoramas(outlet.id);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus panorama ini?")) return;
    await deletePanorama(id);
    if (selectedOutlet) await loadPanoramas(selectedOutlet.id);
  }

  const panoramaViewerData: PanoramaData[] = panoramas.map((p) => ({
    id: p.id,
    title: p.title,
    image_360_url: p.image_360_url,
    text_description: p.text_description,
    audio_description_url: p.audio_description_url,
  }));

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav
        title="Admin Panel"
        subtitle="Sanan Maps"
        items={adminNavItems}
      />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-h2 text-on-surface">Kelola Panorama 360°</h2>
            <p className="text-body-sm text-on-surface-variant">
              Upload dan kelola foto panorama untuk semua outlet
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-container text-on-primary-container"
            disabled={!selectedOutlet}
          >
            <span className="material-symbols-outlined text-sm">{showForm ? "close" : "add"}</span>
            {showForm ? "Tutup Form" : "Tambah Panorama"}
          </Button>
        </header>

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Loading...</div>
        ) : outlets.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
            Belum ada outlet terdaftar.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <label htmlFor="outlet-select" className="text-label-caps text-on-surface-variant block mb-2">
                Pilih Outlet
              </label>
              <select
                id="outlet-select"
                value={selectedOutlet?.id ?? ""}
                onChange={(e) => handleOutletChange(e.target.value)}
                className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
              >
                {outlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedOutlet && (
              <StreetViewChecker
                latitude={selectedOutlet.latitude}
                longitude={selectedOutlet.longitude}
                onResult={setHasStreetView}
              />
            )}

            {showForm && selectedOutlet && (
              <div className="rounded-xl border border-outline-variant bg-surface p-6">
                <h3 className="font-heading text-h3 text-on-surface mb-4">
                  Upload Panorama untuk {selectedOutlet.name}
                </h3>
                <PanoramaForm
                  outletId={selectedOutlet.id}
                  onSuccess={() => {
                    setShowForm(false);
                    loadPanoramas(selectedOutlet.id);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {panoramas.length > 0 && selectedOutlet && (
              <div className="rounded-xl border border-outline-variant bg-surface p-6">
                <h3 className="font-heading text-h3 text-on-surface mb-4">Preview Panorama</h3>
                <PanoramaViewer
                  panoramas={panoramaViewerData}
                  fallbackImageUrl="/placeholder-panorama.jpg"
                  outletName={selectedOutlet.name}
                  outletDescription={selectedOutlet.description}
                  latitude={selectedOutlet.latitude ?? -7.9826}
                  longitude={selectedOutlet.longitude ?? 112.6308}
                  hasStreetView={hasStreetView}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {panoramas.map((panorama) => (
                <div key={panorama.id} className="rounded-xl border border-outline-variant bg-surface overflow-hidden shadow-sm">
                  <div className="relative h-40 bg-surface-container-high">
                    <Image
                      src={panorama.image_360_url}
                      alt={panorama.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 rounded-full bg-surface/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-on-surface">
                      #{panorama.order_index}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-heading text-body-lg text-on-surface">{panorama.title}</h4>
                    <p className="text-body-sm text-on-surface-variant line-clamp-2">{panorama.text_description}</p>
                    {panorama.latitude && panorama.longitude && (
                      <p className="text-body-sm text-on-surface-variant/60">
                        📍 {panorama.latitude.toFixed(4)}, {panorama.longitude.toFixed(4)}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-outline-variant">
                      <Button variant="ghost" size="sm" className="text-error flex-1" onClick={() => handleDelete(panorama.id)}>
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {panoramas.length === 0 && (
                <div className="col-span-full rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-2 block">panorama</span>
                  <p className="text-body-md">Belum ada panorama untuk outlet ini</p>
                  <p className="text-body-sm text-on-surface-variant/60 mt-1">
                    Klik &quot;Tambah Panorama&quot; untuk upload foto 360°.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
