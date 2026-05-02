import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { dashboardStats } from "@/lib/mock-data";

export default function AdminAnalyticsPage() {
  const stats = dashboardStats.admin;

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Analytics</h2>
          <p className="text-body-sm text-on-surface-variant">Statistik penggunaan platform</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Outlets", value: stats.totalOutlets, icon: "storefront", color: "text-primary" },
            { label: "Total Users", value: stats.totalUsers, icon: "people", color: "text-secondary" },
            { label: "Total Reviews", value: stats.totalReviews, icon: "rate_review", color: "text-tertiary" },
            { label: "A11y Score", value: `${stats.accessibilityScore}%`, icon: "accessibility_new", color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-outline-variant bg-surface p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
              </div>
              <p className="font-heading text-h2 text-on-surface">{stat.value}</p>
              <p className="text-body-sm text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-outline-variant bg-surface p-6">
            <h3 className="font-heading text-h3 text-on-surface mb-4">Kunjungan Harian</h3>
            <div className="flex items-end justify-between gap-2 h-48 pb-4 border-b border-outline-variant">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t bg-primary-container/60 hover:bg-primary-container transition-colors" style={{ height: `${30 + Math.random() * 70}%` }} />
                  <span className="text-xs text-on-surface-variant">{day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface p-6">
            <h3 className="font-heading text-h3 text-on-surface mb-4">Top Outlet (Views)</h3>
            <div className="space-y-4">
              {[
                { name: "Keripik Tempe Bu Noer", views: 1250 },
                { name: "Sentra Oleh-Oleh Sanan", views: 890 },
                { name: "Toko Tempe Sanan Jaya", views: 670 },
                { name: "Warung Kopi Sanan", views: 420 },
                { name: "Es Dawet Mbok Sri", views: 380 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-body-sm text-on-surface-variant w-4">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-body-sm font-medium text-on-surface">{item.name}</p>
                    <div className="mt-1 h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary-container rounded-full" style={{ width: `${(item.views / 1250) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-body-sm text-on-surface-variant">{item.views}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}