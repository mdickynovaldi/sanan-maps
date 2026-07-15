"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, ownerNavItems } from "@/components/layout/dashboard-nav";
import { ProductForm } from "@/components/features/product-form";
import { getOutletProducts, deleteProduct } from "@/lib/actions/products";
import { createClient } from "@/lib/supabase/client";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string | null;
  image_url: string | null;
  image_alt: string | null;
  is_available: boolean;
};

type OwnerOutlet = { id: string; name: string; status: string };

export default function OwnerProductsPage() {
  const [outlet, setOutlet] = useState<OwnerOutlet | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: outletData, error } = await supabase
        .from("outlets")
        .select("id, name, status")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        setMessage(`Gagal memuat outlet: ${error.message}`);
        return;
      }
      if (!outletData) {
        setOutlet(null);
        return;
      }

      const o = outletData as unknown as OwnerOutlet;
      setOutlet(o);

      const result = await getOutletProducts(o.id);
      if (result.error) {
        setMessage(`Gagal memuat produk: ${result.error}`);
        setProducts([]);
      } else {
        setProducts((result.data ?? []) as unknown as ProductRow[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    const result = await deleteProduct(id);
    if (!result.success) setMessage(`Gagal menghapus produk: ${result.error}`);
    load();
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav
        title="Mitra Sanan"
        subtitle="Management Portal"
        items={ownerNavItems}
      />

      <main className="flex-1 md:ml-[280px] p-6 pb-24 md:pb-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div>
            <h2 className="font-heading text-h2 text-on-surface">My Products</h2>
            <p className="text-body-sm text-on-surface-variant">
              {outlet ? `Kelola produk untuk ${outlet.name}` : "Kelola produk outlet Anda"}
            </p>
          </div>
          {outlet && (
            <Button
              onClick={() => { setEditingProduct(null); setShowForm(!showForm); }}
              className="bg-primary-container text-on-primary-container"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">{showForm ? "close" : "add"}</span>
              {showForm ? "Tutup Form" : "Tambah Produk"}
            </Button>
          )}
        </header>

        {message && (
          <div className="mb-6 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant" role="status">Loading...</div>
        ) : !outlet ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block" aria-hidden="true">storefront</span>
            <p className="text-body-md text-on-surface mb-4">
              Anda belum memiliki outlet. Daftarkan outlet terlebih dahulu untuk mengelola produk.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/owner">Daftarkan Outlet</Link>
            </Button>
          </div>
        ) : (
          <>
            {showForm && (
              <div className="mb-8 rounded-xl border border-outline-variant bg-surface p-6">
                <h3 className="font-heading text-h3 text-on-surface mb-4">
                  {editingProduct ? `Edit: ${editingProduct.name}` : "Tambah Produk Baru"}
                </h3>
                <ProductForm
                  key={editingProduct?.id ?? "create"}
                  outletId={outlet.id}
                  mode={editingProduct ? "edit" : "create"}
                  initialData={editingProduct ? {
                    id: editingProduct.id,
                    name: editingProduct.name,
                    description: editingProduct.description,
                    price: editingProduct.price,
                    category: editingProduct.category ?? undefined,
                    imageUrl: editingProduct.image_url ?? undefined,
                    imageAlt: editingProduct.image_alt ?? undefined,
                    isAvailable: editingProduct.is_available,
                  } : undefined}
                  onSuccess={() => { setShowForm(false); setEditingProduct(null); load(); }}
                  onCancel={() => { setShowForm(false); setEditingProduct(null); }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="rounded-xl border border-outline-variant bg-surface overflow-hidden shadow-sm">
                  <div className="relative h-48 bg-surface-container-high">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.image_alt ?? product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-5xl" aria-hidden="true">image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading text-h3 text-on-surface">{product.name}</h3>
                        <p className="text-body-sm text-on-surface-variant">{product.category ?? "-"}</p>
                      </div>
                      <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium ${product.is_available ? "bg-tertiary/10 text-tertiary" : "bg-error-container text-on-error-container"}`}>
                        {product.is_available ? "Tersedia" : "Habis"}
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant line-clamp-2">{product.description}</p>
                    <p className="font-semibold text-on-surface">Rp {product.price.toLocaleString("id-ID")}</p>
                    <div className="flex gap-2 pt-2 border-t border-outline-variant">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => { setEditingProduct(product); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-error" aria-label={`Hapus ${product.name}`} onClick={() => handleDelete(product.id)}>
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                  Belum ada produk. Klik &quot;Tambah Produk&quot; untuk menambahkan yang pertama.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
