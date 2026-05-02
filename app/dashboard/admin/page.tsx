import { Button } from "@/components/ui/button";
import { dashboardStats } from "@/lib/mock-data";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";

export default function AdminDashboardPage() {
  const stats = dashboardStats.admin;

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] flex flex-col h-full overflow-y-auto bg-surface-container-lowest">
        <header className="sticky top-0 z-40 flex justify-between items-center bg-surface/95 backdrop-blur-md border-b border-outline-variant px-8 py-4 shadow-[var(--shadow-level-1)]">
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-h2 text-on-surface">System Overview</h2>
            <span className="rounded-full border border-primary-container/30 bg-primary-container/20 px-3 py-1 text-label-caps text-on-primary-container">Live Data</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input placeholder="Search outlets, users..." className="pl-10 pr-4 py-2 bg-surface-container rounded-lg border-none text-body-sm w-64 shadow-sm focus:ring-2 focus:ring-primary" />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error"></span>
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container font-bold text-sm">A</div>
          </div>
        </header>

        <div className="p-8 mx-auto w-full max-w-[1280px] flex flex-col gap-8">
          {/* Key Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              ["Total Outlets", stats.totalOutlets.toString(), "store", "text-primary", "+12% vs last month", "text-tertiary"],
              ["Pending Verification", stats.pendingVerification.toString(), "pending_actions", "text-secondary", "Action Required", "text-error"],
              ["Reported Issues", stats.reportedIssues.toString(), "report_problem", "text-error", "5 high priority tickets", "text-on-surface-variant"],
            ].map(([title, value, icon, iconColor, trend, trendColor]) => (
              <div key={title} className="rounded-xl border border-outline-variant bg-surface p-6 shadow-[var(--shadow-level-1)] flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-label-caps text-on-surface-variant mb-1 uppercase">{title}</p>
                    <h3 className="font-heading text-h1 text-on-surface">{value}</h3>
                  </div>
                  <div className={`p-3 bg-surface-container-high rounded-lg ${iconColor}`}>
                    <span className="material-symbols-outlined text-3xl">{icon}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-sm ${trendColor}`}>
                  {icon === "store" && <span className="flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> {trend}</span>}
                  {icon === "pending_actions" && <span className="flex items-center"><span className="material-symbols-outlined text-sm">priority_high</span> {trend}</span>}
                  {icon === "report_problem" && <span>{trend}</span>}
                </div>
              </div>
            ))}
          </section>

          {/* Main Data Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Outlet Management Table */}
            <div className="lg:col-span-2 rounded-xl border border-outline-variant bg-surface shadow-[var(--shadow-level-1)] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                <div>
                  <h3 className="font-heading text-h3 text-on-surface">Outlet Management</h3>
                  <p className="text-body-sm text-on-surface-variant">Recent verification requests and status updates.</p>
                </div>
                <Button variant="ghost" className="text-primary">
                  View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase border-b border-outline-variant">
                      <th className="p-4 font-medium">Outlet Name</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">A11y Score</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-sm divide-y divide-outline-variant">
                    {[
                      ["Warung Kopi Sanan", "Food & Beverage", "Verified", 85, "tertiary"],
                      ["Toko Oleh-Oleh Asli", "Souvenir", "Pending", 40, "primary"],
                      ["Studio Seni Kerajinan", "Crafts", "Issues Found", 20, "error"],
                    ].map(([name, category, status, score, statusColor]) => (
                      <tr key={name} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                              <span className="material-symbols-outlined">restaurant</span>
                            </div>
                            <div>
                              <p className="font-medium text-on-surface">{name}</p>
                              <p className="text-on-surface-variant text-xs">ID: OUT-1042</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-on-surface-variant">{category}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${status === "Verified" ? "bg-tertiary/10 text-tertiary" : status === "Pending" ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status === "Verified" ? "bg-tertiary" : status === "Pending" ? "bg-secondary" : "bg-error"}`}></span>
                            {status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-full max-w-[60px] bg-surface-container rounded-full overflow-hidden">
                              <div className={`h-full rounded-full bg-${statusColor}`} style={{ width: `${score}%` }}></div>
                            </div>
                            <span className="text-xs font-medium text-on-surface">{score}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="icon">
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Platform Traffic */}
              <div className="rounded-xl border border-outline-variant bg-surface p-6 shadow-[var(--shadow-level-1)]">
                <h3 className="font-heading text-h3 text-on-surface">Platform Traffic</h3>
                <p className="text-body-sm text-on-surface-variant">Visits and searches this week</p>
                <div className="mt-4 flex items-end justify-between gap-2 h-40 pb-4 border-b border-outline-variant px-2 relative">
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-on-surface-variant">
                    <span>1k</span><span>500</span><span>0</span>
                  </div>
                  <div className="ml-6 w-full flex items-end justify-between gap-2 h-full">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                      <div key={day} className={`w-full rounded-t-sm ${i === 2 ? "bg-primary-container" : "bg-primary-container/40"} hover:bg-primary-container transition-colors`} style={{ height: `${30 + i * 10}%` }}></div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant ml-8 mt-2">
                  {["M", "T", "W", "T", "F", "S", "S"].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>

              {/* Review Moderation */}
              <div className="rounded-xl border border-outline-variant bg-surface flex-1 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
                  <h3 className="font-heading text-h3 text-on-surface">Recent Reviews</h3>
                  <p className="text-body-sm text-on-surface-variant">Require moderation</p>
                </div>
                <div className="flex flex-col divide-y divide-outline-variant flex-1 overflow-y-auto">
                  {([
                    ["John Doe", "2h ago", 4, "Great place, but the wheelchair ramp was partially blocked during my visit.", false],
                    ["Anita S.", "5h ago", 1, "Store was closed during stated open hours. Very disappointing.", true],
                  ] as const).map(([name, time, rating, comment, flagged]) => (
                    <div key={name} className={`p-4 hover:bg-surface-container-lowest transition-colors flex gap-4 ${flagged ? "bg-error-container/10" : ""}`}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold">
                        {name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-start justify-between">
                          <h4 className="text-sm font-medium text-on-surface">{name}</h4>
                          <span className="text-xs text-on-surface-variant">{time}</span>
                        </div>
                        <div className="mb-1 flex text-primary text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: i < rating ? '"FILL" 1' : '"FILL" 0' }}>star</span>
                          ))}
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{comment}</p>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-xs text-tertiary hover:underline">Approve</Button>
                          <Button variant="ghost" size="sm" className="text-xs text-error hover:underline">Flag</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}