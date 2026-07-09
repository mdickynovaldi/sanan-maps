"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardNav, userNavItems } from "@/components/layout/dashboard-nav";
import { deleteReview } from "@/lib/actions/reviews";
import { createClient } from "@/lib/supabase/client";

type MyReview = {
  id: string;
  rating: number;
  comment: string;
  tags: string[] | null;
  status: string;
  created_at: string;
  outlets: { name: string; slug: string } | null;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  approved: { label: "Tampil publik", className: "bg-tertiary/10 text-tertiary" },
  pending: { label: "Menunggu moderasi", className: "bg-secondary-container text-on-secondary-container" },
  hidden: { label: "Disembunyikan", className: "bg-surface-container-high text-on-surface-variant" },
};

export default function UserReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, tags, status, created_at, outlets(name, slug)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`Gagal memuat review: ${error.message}`);
        return;
      }
      setReviews((data ?? []) as unknown as MyReview[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus review ini?")) return;
    const result = await deleteReview(id);
    setMessage(result.success ? "Review dihapus." : `Gagal menghapus: ${result.error}`);
    load();
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Sanan Explorer" subtitle="User Dashboard" items={userNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Review Saya</h2>
          <p className="text-body-sm text-on-surface-variant">Riwayat review yang pernah Anda tulis</p>
        </header>

        {message && (
          <div
            className={`mb-6 rounded-lg p-3 text-body-sm ${message.startsWith("Gagal") ? "bg-error-container text-on-error-container" : "bg-tertiary/10 text-tertiary"}`}
            role="status"
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant" role="status">Loading...</div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const status = STATUS_LABELS[review.status] ?? STATUS_LABELS.pending;
              return (
                <div key={review.id} className="rounded-xl border border-outline-variant bg-surface p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {review.outlets ? (
                        <Link href={`/outlets/${review.outlets.slug}`} className="font-medium text-on-surface hover:text-primary hover:underline">
                          {review.outlets.name}
                        </Link>
                      ) : (
                        <p className="font-medium text-on-surface">Outlet</p>
                      )}
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
                  <p className="text-body-md text-on-surface-variant mb-4">{review.comment}</p>
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] text-on-surface-variant capitalize">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-error" onClick={() => handleDelete(review.id)}>
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                      Hapus
                    </Button>
                  </div>
                </div>
              );
            })}
            {reviews.length === 0 && (
              <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                Anda belum menulis review. Kunjungi halaman outlet untuk menulis review pertama Anda.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
