"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, ownerNavItems } from "@/components/layout/dashboard-nav";
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

type OutletBasic = {
  id: string;
  name: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
};

export default function OwnerPanoramasPage() {
  const [outlet, setOutlet] = useState<OutletBasic | null>(null);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("outlets")
        .select("id, name, description, latitude, longitude")
        .eq("owner_id", user.id)
        .single();

      if (data) {
        const o = data as unknown as OutletBasic;
        setOutlet(o);
        await loadPanoramas(o.id);
      }
      setLoading(false);
    }
    load();
  }, [loadPanoramas]);

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus panorama ini?")) return;
    await deletePanorama(id);
    if (outlet) await loadPanoramas(outlet.id);
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
        title="Mitra Sanan"
        subtitle="Management Portal"
        items={ownerNavItems}
        cta={{ label: "Tambah Panorama", href: "#", icon: "add" }}
      />

      <main className="flex-1 md:ml-[280px] p-6 pb-24 md:pb-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div>
            <h2 className="font-heading text-h2 text-on-surface">Panorama 360°</h2>
            <p className="text-body-sm text-on-surface-variant">
              Kelola foto panorama 360° untuk {outlet?.name ?? "outlet Anda"}
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-container text-on-primary-container"
            disabled={!outlet}
          >
            <span className="material-symbols-outlined text-sm">{showForm ? "close" : "add"}</span>
            {showForm ? "Tutup Form" : "Tambah Panorama"}
          </Button>
        </header>

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Loading...</div>
        ) : !outlet ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
            Anda belum memiliki outlet. Hubungi admin untuk mendaftarkan outlet.
          </div>
        ) : (
          <div className="space-y-6">
            <StreetViewChecker
              latitude={outlet.latitude}
              longitude={outlet.longitude}
              onResult={setHasStreetView}
            />

            {showForm && (
              <div className="rounded-xl border border-outline-variant bg-surface p-6">
                <h3 className="font-heading text-h3 text-on-surface mb-4">Upload Panorama Baru</h3>
                <PanoramaForm
                  outletId={outlet.id}
                  onSuccess={() => {
                    setShowForm(false);
                    loadPanoramas(outlet.id);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {panoramas.length > 0 && (
              <div className="rounded-xl border border-outline-variant bg-surface p-6">
                <h3 className="font-heading text-h3 text-on-surface mb-4">Preview Panorama</h3>
                <PanoramaViewer
                  panoramas={panoramaViewerData}
                  fallbackImageUrl="/placeholder-panorama.jpg"
                  outletName={outlet.name}
                  outletDescription={outlet.description}
                  latitude={outlet.latitude ?? -7.9826}
                  longitude={outlet.longitude ?? 112.6308}
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
                  <p className="text-body-md">Belum ada panorama 360°</p>
                  <p className="text-body-sm text-on-surface-variant/60 mt-1">
                    Upload foto panorama 360 (equirectangular 2:1) untuk pengalaman virtual tour — bisa diambil
                    dengan kamera 360 atau mode foto 360 aplikasi Google Street View. Tanpa panorama pun,
                    halaman outlet otomatis menampilkan Google Street View.
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
