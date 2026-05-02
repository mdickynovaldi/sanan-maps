"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { moderateReview } from "@/lib/actions/reviews";
import { createClient } from "@/lib/supabase/client";
import { allOutlets } from "@/lib/mock-data";

type ReviewRow = {
  id: string;
  outlet_id: string;
  user_id: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  outletName?: string;
  userName?: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  async function loadReviews() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setReviews(data as unknown as ReviewRow[]);
      } else {
        // Fallback to mock
        const mockReviews = allOutlets.flatMap((o) =>
          o.reviews.map((r) => ({
            id: String(r.id),
            outlet_id: String(o.id),
            user_id: r.userName,
            rating: r.rating,
            comment: r.comment,
            status: r.status,
            created_at: r.date,
            outletName: o.name,
            userName: r.userName,
          }))
        );
        setReviews(mockReviews);
      }
    } catch {
      const mockReviews = allOutlets.flatMap((o) =>
        o.reviews.map((r) => ({
          id: String(r.id),
          outlet_id: String(o.id),
          user_id: r.userName,
          rating: r.rating,
          comment: r.comment,
          status: r.status,
          created_at: r.date,
          outletName: o.name,
          userName: r.userName,
        }))
      );
      setReviews(mockReviews);
    }
    setLoading(false);
  }

  useEffect(() => { loadReviews(); }, []);

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  async function handleModerate(id: string, status: string) {
    await moderateReview(id, status);
    loadReviews();
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Moderasi Review</h2>
          <p className="text-body-sm text-on-surface-variant">Kelola dan moderasi review pengguna</p>
        </header>

        <div className="mb-6 flex gap-2">
          {["all", "approved", "pending", "hidden"].map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
              className="capitalize"
            >
              {s === "all" ? "Semua" : s}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Loading...</div>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                Tidak ada review dengan status ini.
              </div>
            )}
            {filtered.map((review) => (
              <div key={review.id} className="rounded-xl border border-outline-variant bg-surface p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-on-surface">{review.userName ?? "User"}</span>
                      {review.outletName && (
                        <span className="text-body-sm text-on-surface-variant">&rarr; {review.outletName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex text-primary-container">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < review.rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                        ))}
                      </div>
                      <span className="text-body-sm text-on-surface-variant">
                        {new Date(review.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${
                    review.status === "approved" ? "bg-tertiary/10 text-tertiary" :
                    review.status === "pending" ? "bg-secondary-container text-on-secondary-container" :
                    "bg-error-container text-on-error-container"
                  }`}>
                    {review.status}
                  </span>
                </div>
                <p className="text-body-md text-on-surface-variant mb-4">{review.comment}</p>
                <div className="flex gap-2">
                  {review.status !== "approved" && (
                    <Button variant="ghost" size="sm" className="text-tertiary" onClick={() => handleModerate(review.id, "approved")}>
                      <span className="material-symbols-outlined text-sm">check</span> Approve
                    </Button>
                  )}
                  {review.status !== "hidden" && (
                    <Button variant="ghost" size="sm" className="text-error" onClick={() => handleModerate(review.id, "hidden")}>
                      <span className="material-symbols-outlined text-sm">visibility_off</span> Hide
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-on-surface-variant" onClick={() => handleModerate(review.id, "deleted")}>
                    <span className="material-symbols-outlined text-sm">delete</span> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
