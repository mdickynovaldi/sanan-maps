"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { categories } from "@/lib/mock-data";

export default function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-h2 text-on-surface">Kategori</h2>
            <p className="text-body-sm text-on-surface-variant">Kelola kategori produk UMKM</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Kategori
          </Button>
        </header>

        {showForm && (
          <div className="mb-6 rounded-xl border border-outline-variant bg-surface p-6">
            <h3 className="font-heading text-h3 text-on-surface mb-4">Tambah Kategori Baru</h3>
            <form className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="cat-name" className="text-label-caps text-on-surface-variant block mb-1">Nama Kategori</label>
                <input id="cat-name" className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" placeholder="Nama kategori..." />
              </div>
              <div className="flex-1">
                <label htmlFor="cat-desc" className="text-label-caps text-on-surface-variant block mb-1">Deskripsi</label>
                <input id="cat-desc" className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" placeholder="Deskripsi singkat..." />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="bg-primary-container text-on-primary-container">Simpan</Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-outline-variant bg-surface p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                    <span className="material-symbols-outlined">{cat.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-body-lg text-on-surface">{cat.name}</h3>
                    <p className="text-body-sm text-on-surface-variant">{cat.outletCount} outlet</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" aria-label="Edit kategori">
                  <span className="material-symbols-outlined">edit</span>
                </Button>
              </div>
              <p className="text-body-sm text-on-surface-variant">{cat.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}