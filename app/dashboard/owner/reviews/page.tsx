import { Button } from "@/components/ui/button";
import { DashboardNav, ownerNavItems } from "@/components/layout/dashboard-nav";
import { allOutlets } from "@/lib/mock-data";

export default function OwnerReviewsPage() {
  const myOutlet = allOutlets[0];

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav
        title="Mitra Sanan"
        subtitle="Management Portal"
        items={ownerNavItems}
        cta={{ label: "Add New Product", href: "/dashboard/owner/products", icon: "add" }}
      />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Outlet Reviews</h2>
          <p className="text-body-sm text-on-surface-variant">Review pelanggan untuk {myOutlet.name}</p>
        </header>

        <div className="space-y-4">
          {myOutlet.reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-outline-variant bg-surface p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-on-surface">{review.userName}</p>
                  <p className="text-body-sm text-on-surface-variant">{review.date}</p>
                </div>
                <div className="flex text-primary-container">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < review.rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                  ))}
                </div>
              </div>

              <p className="text-body-md text-on-surface-variant mb-4">{review.comment}</p>

              {review.ownerReply ? (
                <div className="rounded-lg bg-surface-container-low p-4 mb-4 border border-outline-variant">
                  <p className="text-body-sm font-medium text-on-surface mb-1">Balasan Anda:</p>
                  <p className="text-body-sm text-on-surface-variant">{review.ownerReply}</p>
                </div>
              ) : null}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-sm">reply</span>
                  Balas Review
                </Button>
                <Button variant="ghost" size="sm" className="text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">flag</span>
                  Laporkan
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}