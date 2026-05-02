import { Button } from "@/components/ui/button";
import { DashboardNav, userNavItems } from "@/components/layout/dashboard-nav";
import { allOutlets } from "@/lib/mock-data";

export default function UserReviewsPage() {
  const myReviews = allOutlets
    .flatMap((o) => o.reviews.map((r) => ({ ...r, outletName: o.name })))
    .slice(0, 5);

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Sanan Explorer" subtitle="User Dashboard" items={userNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Review Saya</h2>
          <p className="text-body-sm text-on-surface-variant">Riwayat review yang pernah Anda tulis</p>
        </header>

        <div className="space-y-4">
          {myReviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-outline-variant bg-surface p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-on-surface">{review.outletName}</p>
                  <p className="text-body-sm text-on-surface-variant">{review.date}</p>
                </div>
                <div className="flex text-primary-container">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < review.rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                  ))}
                </div>
              </div>
              <p className="text-body-md text-on-surface-variant mb-4">{review.comment}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-error">
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}