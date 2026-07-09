"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardNav, ownerNavItems } from "@/components/layout/dashboard-nav";
import { OutletForm } from "@/components/features/outlet-form";
import {
  OpeningHoursField,
  openingHoursToRows,
  rowsToOpeningHours,
  type OpeningHoursRow,
} from "@/components/features/opening-hours-field";
import { PanoramaViewer, type PanoramaData } from "@/components/features/panorama-viewer";
import { getOutletPanoramas } from "@/lib/actions/panoramas";
import { resubmitOutlet } from "@/lib/actions/outlets";
import { createClient } from "@/lib/supabase/client";

type OwnerOutlet = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  whatsapp: string | null;
  landmark_description: string;
  accessibility_description: string;
  opening_hours: Record<string, string>;
  status: string;
  latitude: number;
  longitude: number;
};

const STATUS_BANNERS: Record<string, { icon: string; className: string; text: string }> = {
  pending: {
    icon: "hourglass_top",
    className: "bg-secondary-container text-on-secondary-container",
    text: "Outlet Anda sedang menunggu persetujuan admin. Setelah disetujui, outlet akan tampil di peta publik.",
  },
  rejected: {
    icon: "block",
    className: "bg-error-container text-on-error-container",
    text: "Pendaftaran outlet Anda ditolak admin. Perbarui data outlet lalu ajukan ulang untuk ditinjau kembali.",
  },
  approved: {
    icon: "check_circle",
    className: "bg-tertiary/10 text-tertiary",
    text: "Outlet Anda sudah disetujui dan tampil di peta publik.",
  },
};

export default function OwnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [outlet, setOutlet] = useState<OwnerOutlet | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [panoramas, setPanoramas] = useState<PanoramaData[]>([]);
  const [hoursRows, setHoursRows] = useState<OpeningHoursRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resubmitting, setResubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("outlets")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      // Kegagalan query BUKAN berarti belum punya outlet — jangan tampilkan
      // form pendaftaran (bisa berujung outlet ganda), tampilkan error.
      if (error) {
        setLoadError(error.message);
        return;
      }

      if (data) {
        const o = data as unknown as OwnerOutlet;
        setOutlet(o);
        setHoursRows(openingHoursToRows(o.opening_hours));

        const [{ count: rc }, { count: pc }, panoResult] = await Promise.all([
          supabase.from("reviews").select("*", { count: "exact", head: true }).eq("outlet_id", o.id),
          supabase.from("products").select("*", { count: "exact", head: true }).eq("outlet_id", o.id),
          getOutletPanoramas(o.id),
        ]);
        setReviewCount(rc ?? 0);
        setProductCount(pc ?? 0);
        if (panoResult.data) {
          setPanoramas(
            panoResult.data.map((p: Record<string, unknown>) => ({
              id: p.id as string,
              title: p.title as string,
              image_360_url: p.image_360_url as string,
              text_description: p.text_description as string,
              audio_description_url: p.audio_description_url as string | null,
              heading: (p.heading as number | null) ?? null,
            })),
          );
        }
      } else {
        setOutlet(null);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Gagal memuat data outlet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!outlet) return;
    setSaving(true);
    setSaveMsg(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase
      .from("outlets")
      .update({
        name: form.get("name") as string,
        description: form.get("description") as string,
        address: form.get("address") as string,
        whatsapp: (form.get("whatsapp") as string) || null,
        landmark_description: form.get("landmark") as string,
        accessibility_description: form.get("accessibility") as string,
        opening_hours: rowsToOpeningHours(hoursRows),
      } as never)
      .eq("id", outlet.id);

    if (error) {
      setSaveMsg("Gagal menyimpan: " + error.message);
    } else {
      setSaveMsg("Perubahan berhasil disimpan!");
      load();
    }
    setSaving(false);
  }

  const banner = outlet ? STATUS_BANNERS[outlet.status] : null;

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav
        title="Mitra Sanan"
        subtitle="Management Portal"
        items={ownerNavItems}
        cta={{ label: "Add New Product", href: "/dashboard/owner/products", icon: "add" }}
      />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-h1 text-on-background">My Outlet</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              {outlet
                ? "Kelola profil toko, menu, dan informasi aksesibilitas Anda."
                : "Daftarkan toko Anda agar tampil di peta UMKM Sanan."}
            </p>
          </div>
          {outlet && outlet.status === "approved" && (
            <Link href={`/outlets/${outlet.slug}`}>
              <Button variant="outline">Lihat Halaman Publik</Button>
            </Link>
          )}
        </header>

        {loading && (
          <div className="py-16 text-center text-on-surface-variant" role="status">
            Memuat data outlet...
          </div>
        )}

        {/* ===== Gagal memuat: jangan tampilkan form pendaftaran ===== */}
        {!loading && loadError && (
          <div className="max-w-[640px] rounded-xl border border-outline-variant bg-error-container p-6" role="alert">
            <p className="text-body-md text-on-error-container mb-4">
              Gagal memuat data outlet: {loadError}
            </p>
            <Button type="button" variant="outline" onClick={load}>
              Coba Lagi
            </Button>
          </div>
        )}

        {/* ===== Belum punya outlet: form pendaftaran ===== */}
        {!loading && !loadError && !outlet && (
          <div className="max-w-[860px]">
            <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-low p-6 flex gap-4">
              <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">storefront</span>
              <div>
                <h2 className="font-heading text-h3 text-on-surface">Daftarkan Outlet Anda</h2>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  Isi data toko dan tentukan lokasinya di peta. Setelah dikirim, admin akan meninjau
                  pendaftaran Anda — outlet tampil di peta publik begitu disetujui.
                </p>
              </div>
            </div>
            <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
              <OutletForm
                mode="create"
                onSuccess={() => {
                  setSaveMsg("Outlet berhasil didaftarkan dan sedang menunggu persetujuan admin.");
                  load();
                }}
              />
            </section>
          </div>
        )}

        {/* ===== Sudah punya outlet: kelola ===== */}
        {!loading && outlet && (
          <>
            {banner && (
              <div className={`mb-6 flex flex-wrap items-center gap-3 rounded-lg p-4 text-body-sm ${banner.className}`} role="status">
                <span className="material-symbols-outlined" aria-hidden="true">{banner.icon}</span>
                <span className="flex-1">{banner.text}</span>
                {outlet.status === "rejected" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={resubmitting}
                    onClick={async () => {
                      setResubmitting(true);
                      const result = await resubmitOutlet(outlet.id);
                      setSaveMsg(
                        result.success
                          ? "Outlet diajukan ulang dan menunggu peninjauan admin."
                          : `Gagal mengajukan ulang: ${result.error}`,
                      );
                      setResubmitting(false);
                      if (result.success) load();
                    }}
                  >
                    {resubmitting ? "Mengajukan..." : "Ajukan Ulang untuk Ditinjau"}
                  </Button>
                )}
              </div>
            )}

            {saveMsg && (
              <div
                className={`mb-6 rounded-lg p-3 text-body-sm ${saveMsg.includes("Gagal") ? "bg-error-container text-on-error-container" : "bg-tertiary/10 text-tertiary"}`}
                role="status"
              >
                {saveMsg}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Content */}
                <div className="md:col-span-8 flex flex-col gap-6">
                  <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                    <h3 className="font-heading text-h3 text-on-background mb-6">Outlet Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="owner-name" className="text-label-caps text-on-surface-variant block mb-1">Outlet Name</label>
                        <input id="owner-name" name="name" defaultValue={outlet.name} className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                        <label htmlFor="owner-whatsapp" className="text-label-caps text-on-surface-variant block mb-1">WhatsApp</label>
                        <input id="owner-whatsapp" name="whatsapp" defaultValue={outlet.whatsapp ?? ""} placeholder="6281234567890" className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="owner-desc" className="text-label-caps text-on-surface-variant block mb-1">Description</label>
                        <textarea id="owner-desc" name="description" defaultValue={outlet.description} rows={3} className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="owner-address" className="text-label-caps text-on-surface-variant block mb-1">Address</label>
                        <input id="owner-address" name="address" defaultValue={outlet.address} className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </div>
                  </section>

                  <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                    <OpeningHoursField
                      rows={hoursRows}
                      onChange={setHoursRows}
                      legendClassName="font-heading text-h3 text-on-background"
                      inputClassName="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
                    />
                  </section>

                  <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                    <h3 className="font-heading text-h3 text-on-background mb-4">Accessibility & Discovery</h3>
                    <p className="text-body-sm text-on-surface-variant mb-4">Bantu pengunjung menemukan dan mengakses toko Anda dengan mudah.</p>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="owner-landmark" className="text-label-caps text-on-surface-variant block mb-1">Patokan Lokasi (Landmark)</label>
                        <textarea id="owner-landmark" name="landmark" defaultValue={outlet.landmark_description} rows={2} placeholder="Dari gapura Kampung Sanan, masuk lurus..." className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none" />
                      </div>
                      <div>
                        <label htmlFor="owner-accessibility" className="text-label-caps text-on-surface-variant block mb-1">Deskripsi Aksesibilitas</label>
                        <textarea id="owner-accessibility" name="accessibility" defaultValue={outlet.accessibility_description} rows={2} placeholder="Pintu masuk lebar tanpa tangga..." className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none" />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Sidebar */}
                <div className="md:col-span-4 flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
                      <span className="material-symbols-outlined text-secondary mb-2 text-3xl" aria-hidden="true">rate_review</span>
                      <h4 className="font-heading text-h2 text-on-background">{reviewCount}</h4>
                      <p className="text-label-caps text-on-surface-variant mt-1">Reviews</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
                      <span className="material-symbols-outlined text-on-surface-variant mb-2 text-3xl" aria-hidden="true">inventory_2</span>
                      <h4 className="font-heading text-h2 text-on-background">{productCount}</h4>
                      <p className="text-label-caps text-on-surface-variant mt-1">Products</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center col-span-2">
                      <span className="material-symbols-outlined text-primary mb-2 text-3xl" aria-hidden="true">panorama</span>
                      <h4 className="font-heading text-h2 text-on-background">{panoramas.length}</h4>
                      <p className="text-label-caps text-on-surface-variant mt-1">Panorama 360°</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 space-y-3">
                    <h3 className="font-heading text-h3 text-on-surface mb-2">Quick Links</h3>
                    <Link href="/dashboard/owner/products" className="flex items-center gap-3 rounded-lg border border-outline-variant p-3 hover:bg-surface-container-low transition-colors">
                      <span className="material-symbols-outlined text-primary" aria-hidden="true">inventory_2</span>
                      <span className="text-body-md text-on-surface">Manage Products</span>
                    </Link>
                    <Link href="/dashboard/owner/reviews" className="flex items-center gap-3 rounded-lg border border-outline-variant p-3 hover:bg-surface-container-low transition-colors">
                      <span className="material-symbols-outlined text-primary" aria-hidden="true">rate_review</span>
                      <span className="text-body-md text-on-surface">View Reviews</span>
                    </Link>
                    <Link href="/dashboard/owner/panoramas" className="flex items-center gap-3 rounded-lg border border-outline-variant p-3 hover:bg-surface-container-low transition-colors">
                      <span className="material-symbols-outlined text-primary" aria-hidden="true">panorama</span>
                      <span className="text-body-md text-on-surface">Kelola Panorama 360°</span>
                    </Link>
                  </div>

                  <Button type="submit" disabled={saving} className="w-full bg-primary-container text-on-primary-container">
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </div>
            </form>

            {panoramas.length > 0 && (
              <section className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-h3 text-on-surface">Preview Panorama 360°</h3>
                  <Link href="/dashboard/owner/panoramas">
                    <Button variant="outline" size="sm">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">settings</span>
                      Kelola
                    </Button>
                  </Link>
                </div>
                <PanoramaViewer
                  panoramas={panoramas}
                  fallbackImageUrl="/placeholder-panorama.jpg"
                  outletName={outlet.name}
                  outletDescription={outlet.description}
                  latitude={outlet.latitude}
                  longitude={outlet.longitude}
                />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
