"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardNav, ownerNavItems } from "@/components/layout/dashboard-nav";
import { PanoramaViewer, type PanoramaData } from "@/components/features/panorama-viewer";
import { getOutletPanoramas } from "@/lib/actions/panoramas";
import { createClient } from "@/lib/supabase/client";
import { allOutlets, dashboardStats } from "@/lib/mock-data";

type OwnerOutlet = {
  id: string;
  name: string;
  description: string;
  address: string;
  whatsapp: string | null;
  landmark_description: string;
  accessibility_description: string;
  opening_hours: Record<string, string>;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
};

export default function OwnerDashboardPage() {
  const fallback = allOutlets[0];
  const [outlet, setOutlet] = useState<OwnerOutlet | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [panoramas, setPanoramas] = useState<PanoramaData[]>([]);
  const [panoramaCount, setPanoramaCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("outlets")
          .select("*")
          .eq("owner_id", user.id)
          .single();

        if (data) {
          setOutlet(data as unknown as OwnerOutlet);

          const { count: rc } = await supabase.from("reviews").select("*", { count: "exact", head: true }).eq("outlet_id", (data as unknown as OwnerOutlet).id);
          setReviewCount(rc ?? 0);

          const { count: pc } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("outlet_id", (data as unknown as OwnerOutlet).id);
          setProductCount(pc ?? 0);

          const panoResult = await getOutletPanoramas((data as unknown as OwnerOutlet).id);
          if (panoResult.data) {
            setPanoramaCount(panoResult.data.length);
            setPanoramas(panoResult.data.map((p: Record<string, unknown>) => ({
              id: p.id as string,
              title: p.title as string,
              image_360_url: p.image_360_url as string,
              text_description: p.text_description as string,
              audio_description_url: p.audio_description_url as string | null,
            })));
          }
        }
      } catch {
        // fallback
      }
    }
    load();
  }, []);

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
        whatsapp: form.get("whatsapp") as string || null,
        landmark_description: form.get("landmark") as string,
        accessibility_description: form.get("accessibility") as string,
        opening_hours: { "Senin-Jumat": form.get("hours_weekday") as string, "Sabtu-Minggu": form.get("hours_weekend") as string },
      } as never)
      .eq("id", outlet.id);

    if (error) {
      setSaveMsg("Gagal menyimpan: " + error.message);
    } else {
      setSaveMsg("Perubahan berhasil disimpan!");
    }
    setSaving(false);
  }

  const displayName = outlet?.name ?? fallback.name;
  const displayDesc = outlet?.description ?? fallback.description;
  const displayAddress = outlet?.address ?? fallback.address;
  const displayWhatsapp = outlet?.whatsapp ?? fallback.whatsapp;
  const displayLandmark = outlet?.landmark_description ?? fallback.landmark;
  const displayAccessibility = outlet?.accessibility_description ?? fallback.accessibility;
  const displayHours = outlet?.opening_hours ?? fallback.openingHours;

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
            <p className="text-body-md text-on-surface-variant mt-1">Manage your store profile, menu, and accessibility details.</p>
          </div>
          {outlet && (
            <Link href={`/outlets/${outlet.id}`}>
              <Button variant="outline">Preview Profile</Button>
            </Link>
          )}
        </header>

        {saveMsg && (
          <div className={`mb-6 rounded-lg p-3 text-body-sm ${saveMsg.includes("Gagal") ? "bg-error-container text-on-error-container" : "bg-tertiary/10 text-tertiary"}`} role="status">
            {saveMsg}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="md:col-span-8 flex flex-col gap-6">
              {/* Profile Section */}
              <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                <h3 className="font-heading text-h3 text-on-background mb-6">Outlet Profile</h3>
                <div className="relative mb-6 h-48 w-full overflow-hidden rounded-lg bg-surface-variant group">
                  <Image src={fallback.image} alt="Cover" fill className="object-cover" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="owner-name" className="text-label-caps text-on-surface-variant block mb-1">Outlet Name</label>
                    <input id="owner-name" name="name" defaultValue={displayName} className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label htmlFor="owner-whatsapp" className="text-label-caps text-on-surface-variant block mb-1">WhatsApp</label>
                    <input id="owner-whatsapp" name="whatsapp" defaultValue={displayWhatsapp} placeholder="6281234567890" className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="owner-desc" className="text-label-caps text-on-surface-variant block mb-1">Description</label>
                    <textarea id="owner-desc" name="description" defaultValue={displayDesc} rows={3} className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="owner-address" className="text-label-caps text-on-surface-variant block mb-1">Address</label>
                    <input id="owner-address" name="address" defaultValue={displayAddress} className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              </section>

              {/* Opening Hours */}
              <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                <h3 className="font-heading text-h3 text-on-background mb-4">Jam Buka</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hours-weekday" className="text-label-caps text-on-surface-variant block mb-1">Senin - Jumat</label>
                    <input id="hours-weekday" name="hours_weekday" defaultValue={displayHours["Senin-Jumat"] ?? Object.values(displayHours)[0] ?? "08:00 - 17:00"} placeholder="08:00 - 17:00" className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label htmlFor="hours-weekend" className="text-label-caps text-on-surface-variant block mb-1">Sabtu - Minggu</label>
                    <input id="hours-weekend" name="hours_weekend" defaultValue={displayHours["Sabtu-Minggu"] ?? displayHours["Sabtu"] ?? "08:00 - 14:00"} placeholder="08:00 - 14:00" className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              </section>

              {/* Accessibility & Discovery */}
              <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                <h3 className="font-heading text-h3 text-on-background mb-4">Accessibility & Discovery</h3>
                <p className="text-body-sm text-on-surface-variant mb-4">Help visitors find and access your store easily.</p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="owner-landmark" className="text-label-caps text-on-surface-variant block mb-1">Patokan Lokasi (Landmark)</label>
                    <textarea id="owner-landmark" name="landmark" defaultValue={displayLandmark} rows={2} placeholder="Dari gapura Kampung Sanan, masuk lurus..." className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                  <div>
                    <label htmlFor="owner-accessibility" className="text-label-caps text-on-surface-variant block mb-1">Deskripsi Aksesibilitas</label>
                    <textarea id="owner-accessibility" name="accessibility" defaultValue={displayAccessibility} rows={2} placeholder="Pintu masuk lebar tanpa tangga..." className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-4 flex flex-col gap-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
                  <span className="material-symbols-outlined text-tertiary mb-2 text-3xl">visibility</span>
                  <h4 className="font-heading text-h2 text-on-background">{dashboardStats.owner.profileViews}</h4>
                  <p className="text-label-caps text-on-surface-variant mt-1">Profile Views</p>
                </div>
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
                  <span className="material-symbols-outlined text-primary mb-2 text-3xl">directions</span>
                  <h4 className="font-heading text-h2 text-on-background">{dashboardStats.owner.directions}</h4>
                  <p className="text-label-caps text-on-surface-variant mt-1">Directions</p>
                </div>
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
                  <span className="material-symbols-outlined text-secondary mb-2 text-3xl">rate_review</span>
                  <h4 className="font-heading text-h2 text-on-background">{reviewCount || dashboardStats.owner.totalReviews}</h4>
                  <p className="text-label-caps text-on-surface-variant mt-1">Reviews</p>
                </div>
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center">
                  <span className="material-symbols-outlined text-on-surface-variant mb-2 text-3xl">inventory_2</span>
                  <h4 className="font-heading text-h2 text-on-background">{productCount || dashboardStats.owner.totalProducts}</h4>
                  <p className="text-label-caps text-on-surface-variant mt-1">Products</p>
                </div>
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center col-span-2">
                  <span className="material-symbols-outlined text-primary mb-2 text-3xl">panorama</span>
                  <h4 className="font-heading text-h2 text-on-background">{panoramaCount}</h4>
                  <p className="text-label-caps text-on-surface-variant mt-1">Panorama 360°</p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 space-y-3">
                <h3 className="font-heading text-h3 text-on-surface mb-2">Quick Links</h3>
                <Link href="/dashboard/owner/products" className="flex items-center gap-3 rounded-lg border border-outline-variant p-3 hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  <span className="text-body-md text-on-surface">Manage Products</span>
                </Link>
                <Link href="/dashboard/owner/reviews" className="flex items-center gap-3 rounded-lg border border-outline-variant p-3 hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-primary">rate_review</span>
                  <span className="text-body-md text-on-surface">View Reviews</span>
                </Link>
                <Link href="/dashboard/owner/panoramas" className="flex items-center gap-3 rounded-lg border border-outline-variant p-3 hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-primary">panorama</span>
                  <span className="text-body-md text-on-surface">Kelola Panorama 360°</span>
                </Link>
              </div>

              {/* Save Button */}
              <Button type="submit" disabled={saving} className="w-full bg-primary-container text-on-primary-container">
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </form>

        {panoramas.length > 0 && outlet && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-h3 text-on-surface">Preview Panorama 360°</h3>
              <Link href="/dashboard/owner/panoramas">
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-sm">settings</span>
                  Kelola
                </Button>
              </Link>
            </div>
            <PanoramaViewer
              panoramas={panoramas}
              fallbackImageUrl="/placeholder-panorama.jpg"
              outletName={outlet.name}
              outletDescription={outlet.description}
              latitude={(outlet as unknown as { latitude?: number }).latitude ?? -7.9826}
              longitude={(outlet as unknown as { longitude?: number }).longitude ?? 112.6308}
            />
          </section>
        )}
      </main>
    </div>
  );
}
