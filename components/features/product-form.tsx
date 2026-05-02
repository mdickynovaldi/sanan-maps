"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { uploadImage } from "@/lib/actions/upload";

interface ProductFormProps {
  outletId: string;
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    imageUrl?: string;
    imageAlt?: string;
    isAvailable?: boolean;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ outletId, mode, initialData, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadImage(fd, "photos");
    if (result.success && result.url) {
      setUploadedUrl(result.url);
    } else {
      setError(result.error ?? "Upload gagal");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      outletId,
      name: form.get("name") as string,
      description: form.get("description") as string,
      price: parseInt(form.get("price") as string, 10),
      category: (form.get("category") as string) || null,
      imageUrl: uploadedUrl || (form.get("imageUrl") as string) || null,
      imageAlt: (form.get("imageAlt") as string) || null,
      isAvailable: form.get("isAvailable") === "on",
    };

    let result;
    if (mode === "edit" && initialData?.id) {
      result = await updateProduct(initialData.id, data);
    } else {
      result = await createProduct(data);
    }

    if (!result.success) {
      setError(result.error ?? "Gagal menyimpan produk");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="product-name" className="text-body-sm font-medium text-on-surface block mb-1">Nama Produk *</label>
          <input
            id="product-name"
            name="name"
            required
            minLength={2}
            defaultValue={initialData?.name}
            placeholder="Keripik Tempe Original"
            className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="product-price" className="text-body-sm font-medium text-on-surface block mb-1">Harga (Rp) *</label>
          <input
            id="product-price"
            name="price"
            type="number"
            required
            min={0}
            defaultValue={initialData?.price}
            placeholder="25000"
            className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="product-description" className="text-body-sm font-medium text-on-surface block mb-1">Deskripsi *</label>
        <textarea
          id="product-description"
          name="description"
          required
          minLength={5}
          rows={2}
          defaultValue={initialData?.description}
          placeholder="Deskripsi produk..."
          className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="product-category" className="text-body-sm font-medium text-on-surface block mb-1">Kategori</label>
          <input
            id="product-category"
            name="category"
            defaultValue={initialData?.category ?? ""}
            placeholder="Keripik, Minuman, dll"
            className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="product-upload" className="text-body-sm font-medium text-on-surface block mb-1">Upload Gambar</label>
          <input
            id="product-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileUpload}
            className="w-full text-body-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-container file:px-3 file:py-2 file:text-on-primary-container file:text-sm file:font-medium"
          />
          {uploading && <p className="text-body-sm text-on-surface-variant mt-1">Uploading...</p>}
          {uploadedUrl && <p className="text-body-sm text-tertiary mt-1">Foto berhasil diupload</p>}
        </div>
      </div>

      {!uploadedUrl && (
        <div>
          <label htmlFor="product-imageUrl" className="text-body-sm font-medium text-on-surface block mb-1">Atau URL Gambar Manual</label>
          <input
            id="product-imageUrl"
            name="imageUrl"
            type="url"
            defaultValue={initialData?.imageUrl ?? ""}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      <div>
        <label htmlFor="product-imageAlt" className="text-body-sm font-medium text-on-surface block mb-1">Alt Text Gambar</label>
        <input
          id="product-imageAlt"
          name="imageAlt"
          defaultValue={initialData?.imageAlt ?? ""}
          placeholder="Deskripsi gambar untuk screen reader"
          className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="product-available"
          name="isAvailable"
          type="checkbox"
          defaultChecked={initialData?.isAvailable ?? true}
          className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
        />
        <label htmlFor="product-available" className="text-body-sm text-on-surface">Produk tersedia</label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-outline-variant">
        <Button type="submit" disabled={loading} className="bg-primary-container text-on-primary-container">
          {loading ? "Menyimpan..." : mode === "create" ? "Tambah Produk" : "Simpan Perubahan"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
