"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { allOutlets } from "@/lib/mock-data";

export default function AdminProductsPage() {
  const allProducts = allOutlets.flatMap((o) =>
    o.products.map((p) => ({ ...p, outletName: o.name }))
  );
  const [search, setSearch] = useState("");
  const filtered = allProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-h2 text-on-surface">Produk / Menu</h2>
            <p className="text-body-sm text-on-surface-variant">Kelola semua produk dari outlet UMKM</p>
          </div>
        </header>

        <div className="mb-6 relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase border-b border-outline-variant">
                <th className="p-4 font-medium">Produk</th>
                <th className="p-4 font-medium">Outlet</th>
                <th className="p-4 font-medium">Harga</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-on-surface">{product.name}</p>
                    <p className="text-xs text-on-surface-variant">{product.category}</p>
                  </td>
                  <td className="p-4 text-on-surface-variant">{product.outletName}</td>
                  <td className="p-4 text-on-surface">Rp {product.price.toLocaleString("id-ID")}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium ${product.isAvailable ? "bg-tertiary/10 text-tertiary" : "bg-error-container text-on-error-container"}`}>
                      {product.isAvailable ? "Tersedia" : "Habis"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" aria-label="Edit produk">
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}