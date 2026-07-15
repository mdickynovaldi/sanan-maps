"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardNav, ownerNavItems } from "@/components/layout/dashboard-nav";
import { createClient } from "@/lib/supabase/client";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  tags: string[] | null;
  status: string;
  owner_reply: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  approved: { label: "Tampil publik", className: "bg-tertiary/10 text-tertiary" },
  pending: { label: "Menunggu moderasi", className: "bg-secondary-container text-on-secondary-container" },
  hidden: { label: "Disembunyikan", className: "bg-surface-container-high text-on-surface-variant" },
};

export default function OwnerReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [outletName, setOutletName] = useState<string | null>(null);
  const [hasOutlet, setHasOutlet] = useState(true);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: outlet, error: oErr } = await supabase
        .from("outlets")
        .select("id, name")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (oErr) {
        setError(oErr.message);
        return;
      }
      if (!outlet) {
        setHasOutlet(false);
        return;
      }

      const o = outlet as unknown as { id: string; name: string };
      setOutletName(o.name);

      const { data: revs, error: rErr } = await supabase
        .from("reviews")
        .select("id, rating, comment, tags, status, owner_reply, created_at")
        .eq("outlet_id", o.id)
        .order("created_at", { ascending: false });

      if (rErr) {
        setError(rErr.message);
        return;
      }
      setReviews((revs ?? []) as unknown as ReviewRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav
        title="Mitra Sanan"
        subtitle="Management Portal"
        items={ownerNavItems}
        cta={{ label: "Add New Product", href: "/dashboard/owner/products", icon: "add" }}
      />

      <main className="flex-1 md:ml-[280px] p-6 pb-24 md:pb-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Outlet Reviews</h2>
          <p className="text-body-sm text-on-surface-variant">
            {outletName ? `Review pelanggan untuk ${outletName}` : "Review pelanggan outlet Anda"}
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
            Gagal memuat review: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant" role="status">Loading...</div>
        ) : !hasOutlet ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center">
            <p className="text-body-md text-on-surface mb-4">
              Anda belum memiliki outlet. Daftarkan outlet terlebih dahulu.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/owner">Daftarkan Outlet</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const status = STATUS_LABELS[review.status] ?? STATUS_LABELS.approved;
              return (
                <div key={review.id} className="rounded-xl border border-outline-variant bg-surface p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-on-surface">Pengunjung</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {new Date(review.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                      <div className="flex text-primary-container" aria-label={`Rating ${review.rating} dari 5`}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-sm" aria-hidden="true" style={{ fontVariationSettings: i < review.rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {review.comment && <p className="text-body-md text-on-surface-variant mb-3">{review.comment}</p>}

                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {review.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] text-on-surface-variant capitalize">{tag}</span>
                      ))}
                    </div>
                  )}

                  {review.owner_reply && (
                    <div className="rounded-lg bg-surface-container-low p-4 border border-outline-variant">
                      <p className="text-body-sm font-medium text-on-surface mb-1">Balasan Anda:</p>
                      <p className="text-body-sm text-on-surface-variant">{review.owner_reply}</p>
                    </div>
                  )}
                </div>
              );
            })}
            {reviews.length === 0 && (
              <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                Belum ada review untuk outlet Anda.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
