"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { createClient } from "@/lib/supabase/client";

type ProductRow = {
  id: string;
  name: string;
  price: number;
  category: string | null;
  image_url: string | null;
  image_alt: string | null;
  is_available: boolean;
  outlets: { name: string; slug: string } | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from("products")
        .select("*, outlets(name, slug)")
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(`Gagal memuat produk: ${queryError.message}`);
        setProducts([]);
      } else {
        setProducts((data ?? []) as unknown as ProductRow[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

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
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            aria-label="Cari produk"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-12 text-center text-on-surface-variant" role="status">
            Memuat produk...
          </div>
        ) : (
          <div className="rounded-xl border border-outline-variant bg-surface overflow-hidden">
            <div className="overflow-x-auto">
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
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
                            {product.image_url ? (
                              <Image src={product.image_url} alt={product.image_alt ?? product.name} fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-on-surface-variant">
                                <span className="material-symbols-outlined" aria-hidden="true">storefront</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-on-surface">{product.name}</p>
                            <p className="text-xs text-on-surface-variant">{product.category ?? "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant">{product.outlets?.name ?? "-"}</td>
                      <td className="p-4 text-on-surface">Rp {product.price.toLocaleString("id-ID")}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium ${product.is_available ? "bg-tertiary/10 text-tertiary" : "bg-error-container text-on-error-container"}`}>
                          {product.is_available ? "Tersedia" : "Habis"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`}>
                          <span className="material-symbols-outlined text-xl" aria-hidden="true">edit</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                        {products.length === 0
                          ? "Belum ada produk dari outlet mana pun."
                          : "Tidak ada produk yang cocok dengan pencarian."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
