"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { signOut } from "@/lib/actions/auth";

type NavItem = {
  icon: string;
  label: string;
  href: string;
};

type DashboardNavProps = {
  title: string;
  subtitle: string;
  items: NavItem[];
  cta?: {
    label: string;
    href: string;
    icon?: string;
  };
};

export function DashboardNav({ title, subtitle, items, cta }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <>
    {/* Bar bawah untuk layar sempit — sidebar desktop tersembunyi di bawah md,
        jadi navigasi + Logout harus tetap tersedia di mobile. */}
    <nav
      aria-label={`Navigasi ${title}`}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center gap-1 border-t border-slate-200 bg-slate-50 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5",
                active ? "bg-amber-500/10 text-amber-700" : "text-slate-600"
              )}
            >
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">{item.icon}</span>
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <form action={signOut} className="shrink-0">
        <button type="submit" className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-red-600">
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">logout</span>
          <span className="text-[10px] leading-tight">Logout</span>
        </button>
      </form>
    </nav>

    <nav className="hidden md:flex fixed left-0 top-0 h-full w-[280px] border-r border-slate-200 bg-slate-50 p-4 flex-col gap-2 z-40 overflow-y-auto">
      {/* Logo mengarah ke beranda dashboard, BUKAN situs publik — klik logo
          sempat dikira "auto logout" karena melempar user keluar dashboard. */}
      <Link href={items[0]?.href ?? "/"} className="mb-6 flex items-center gap-2.5 px-4 py-2">
        <Logo className="h-9 w-9 shrink-0" />
        <div>
          <h1 className="text-lg font-black text-slate-900 font-heading leading-tight">{title}</h1>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>
      </Link>

      <div className="flex-1 flex flex-col gap-2">
        {items.map((item) => {
          // Exact match for dashboard root items to prevent double-highlight
          const isExactMatch = pathname === item.href;
          const isChildMatch = pathname.startsWith(`${item.href}/`);
          // Only highlight via startsWith if this item is NOT the root dashboard page
          const isRootDashboard = item.href === "/dashboard/admin" || item.href === "/dashboard/user" || item.href === "/dashboard/owner";
          const active = isRootDashboard ? isExactMatch : (isExactMatch || isChildMatch);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                active
                  ? "bg-amber-500/10 text-amber-700 font-bold"
                  : "text-slate-600 hover:bg-slate-200"
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {cta ? (
        <Button asChild className="w-full bg-primary-container text-on-primary-container text-sm py-2">
          <Link href={cta.href}>
            {cta.icon ? <span className="material-symbols-outlined">{cta.icon}</span> : null}
            {cta.label}
          </Link>
        </Button>
      ) : null}

      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors"
      >
        <span className="material-symbols-outlined">public</span>
        <span>Lihat Situs</span>
      </Link>

      <form action={signOut} className="mt-2">
        <Button type="submit" variant="ghost" className="w-full text-sm text-red-600 hover:bg-red-50 justify-start gap-3 px-4 py-3">
          <span className="material-symbols-outlined">logout</span>
          Logout
        </Button>
      </form>
    </nav>
    </>
  );
}

export const adminNavItems: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard/admin" },
  { icon: "storefront", label: "Outlets", href: "/dashboard/admin/outlets" },
  { icon: "panorama", label: "Panorama 360°", href: "/dashboard/admin/panoramas" },
  { icon: "category", label: "Categories", href: "/dashboard/admin/categories" },
  { icon: "inventory_2", label: "Products", href: "/dashboard/admin/products" },
  { icon: "rate_review", label: "Reviews", href: "/dashboard/admin/reviews" },
  { icon: "people", label: "Users", href: "/dashboard/admin/users" },
  { icon: "flag", label: "Reports", href: "/dashboard/admin/reports" },
  { icon: "analytics", label: "Analytics", href: "/dashboard/admin/analytics" },
];

export const userNavItems: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard/user" },
  { icon: "storefront", label: "Jelajah Outlet", href: "/outlets" },
  { icon: "favorite", label: "Favorites", href: "/dashboard/user/favorites" },
  { icon: "rate_review", label: "Reviews", href: "/dashboard/user/reviews" },
  { icon: "flag", label: "Laporan Saya", href: "/dashboard/user/reports" },
  { icon: "settings", label: "Preferences", href: "/dashboard/user/settings" },
];

export const ownerNavItems: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard/owner" },
  { icon: "panorama", label: "Panorama 360°", href: "/dashboard/owner/panoramas" },
  { icon: "inventory_2", label: "Products", href: "/dashboard/owner/products" },
  { icon: "rate_review", label: "Reviews", href: "/dashboard/owner/reviews" },
  { icon: "flag", label: "Laporan", href: "/dashboard/owner/reports" },
];
