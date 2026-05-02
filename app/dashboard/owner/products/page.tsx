"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, ownerNavItems } from "@/components/layout/dashboard-nav";
import { ProductForm } from "@/components/features/product-form";
import { getOutletProducts, deleteProduct } from "@/lib/actions/products";
import { allOutlets } from "@/lib/mock-data";

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

export default function OwnerProductsPage() {
  const myOutlet = allOutlets[0];
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    const result = await getOutletProducts(myOutlet.id.toString());
    if (result.data && result.data.length > 0) {
      setProducts(result.data as unknown as ProductRow[]);
    } else {
      // Fallback to mock data
      setProducts(myOutlet.products.map((p) => ({
        id: String(p.id),
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        image_url: p.image,
        image_alt: p.imageAlt,
        is_available: p.isAvailable,
      })));
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadProducts(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    await deleteProduct(id);
    loadProducts();
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav
        title="Mitra Sanan"
        subtitle="Management Portal"
        items={ownerNavItems}
        cta={{ label: "Add New Product", href: "#", icon: "add" }}
      />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-h2 text-on-surface">My Products</h2>
            <p className="text-body-sm text-on-surface-variant">Kelola produk untuk {myOutlet.name}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined text-sm">{showForm ? "close" : "add"}</span>
            {showForm ? "Tutup Form" : "Tambah Produk"}
          </Button>
        </header>

        {showForm && (
          <div className="mb-8 rounded-xl border border-outline-variant bg-surface p-6">
            <h3 className="font-heading text-h3 text-on-surface mb-4">Tambah Produk Baru</h3>
            <ProductForm
              outletId={myOutlet.id.toString()}
              mode="create"
              onSuccess={() => { setShowForm(false); loadProducts(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="rounded-xl border border-outline-variant bg-surface overflow-hidden shadow-sm">
                <div className="relative h-48 bg-surface-container-high">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.image_alt ?? product.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl">image</span>
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
                    <Button variant="outline" size="sm" className="flex-1">
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-error" onClick={() => handleDelete(product.id)}>
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-full rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
                Belum ada produk.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
