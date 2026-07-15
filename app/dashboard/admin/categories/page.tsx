"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { createClient } from "@/lib/supabase/client";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  outlet_categories: { outlet_id: string }[] | null;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*, outlet_categories(outlet_id)")
        .order("name", { ascending: true });

      if (error) {
        setMessage(`Gagal memuat kategori: ${error.message}`);
        setCategories([]);
      } else {
        setCategories((data ?? []) as unknown as CategoryRow[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("Nama kategori wajib diisi.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").insert({
        name: name.trim(),
        slug: slugify(name),
        description: description.trim() || null,
        icon: "category",
      } as never);
      if (error) {
        setMessage(`Gagal menambah kategori: ${error.message}`);
        return;
      }
      setName("");
      setDescription("");
      setShowForm(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, categoryName: string) {
    if (!confirm(`Yakin ingin menghapus kategori "${categoryName}"?`)) return;
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      setMessage(`Gagal menghapus kategori: ${error.message}`);
      return;
    }
    await load();
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 pb-24 md:pb-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div>
            <h2 className="font-heading text-h2 text-on-surface">Kategori</h2>
            <p className="text-body-sm text-on-surface-variant">Kelola kategori produk UMKM</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">{showForm ? "close" : "add"}</span>
            {showForm ? "Tutup Form" : "Tambah Kategori"}
          </Button>
        </header>

        {message && (
          <div className="mb-6 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
            {message}
          </div>
        )}

        {showForm && (
          <div className="mb-6 rounded-xl border border-outline-variant bg-surface p-6">
            <h3 className="font-heading text-h3 text-on-surface mb-4">Tambah Kategori Baru</h3>
            <form className="flex flex-col md:flex-row gap-4" onSubmit={handleCreate}>
              <div className="flex-1">
                <label htmlFor="cat-name" className="text-label-caps text-on-surface-variant block mb-1">Nama Kategori</label>
                <input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" placeholder="Nama kategori..." />
              </div>
              <div className="flex-1">
                <label htmlFor="cat-desc" className="text-label-caps text-on-surface-variant block mb-1">Deskripsi</label>
                <input id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary" placeholder="Deskripsi singkat..." />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting} className="bg-primary-container text-on-primary-container">
                  {submitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant" role="status">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block" aria-hidden="true">category</span>
            <p className="text-body-md text-on-surface">
              Belum ada kategori. Klik &quot;Tambah Kategori&quot; untuk menambahkan yang pertama.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="rounded-xl border border-outline-variant bg-surface p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                      <span className="material-symbols-outlined" aria-hidden="true">{cat.icon ?? "category"}</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-body-lg text-on-surface">{cat.name}</h3>
                      <p className="text-body-sm text-on-surface-variant">{cat.outlet_categories?.length ?? 0} outlet</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-error" aria-label={`Hapus kategori ${cat.name}`} onClick={() => handleDelete(cat.id, cat.name)}>
                    <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                  </Button>
                </div>
                {cat.description && (
                  <p className="text-body-sm text-on-surface-variant">{cat.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
