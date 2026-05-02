"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createOutlet, updateOutlet } from "@/lib/actions/outlets";
import type { CreateOutletInput } from "@/lib/validations/outlet";

interface OutletFormProps {
  mode: "create" | "edit";
  initialData?: Partial<CreateOutletInput> & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OutletForm({ mode, initialData, onSuccess, onCancel }: OutletFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data: CreateOutletInput = {
      name: form.get("name") as string,
      slug: (form.get("name") as string).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: form.get("description") as string,
      address: form.get("address") as string,
      latitude: parseFloat(form.get("latitude") as string),
      longitude: parseFloat(form.get("longitude") as string),
      landmarkDescription: form.get("landmarkDescription") as string,
      accessibilityDescription: form.get("accessibilityDescription") as string,
      whatsapp: (form.get("whatsapp") as string) || null,
      openingHours: { "Senin-Jumat": form.get("openingHours") as string || "08:00 - 17:00" },
      status: "pending",
    };

    let result;
    if (mode === "edit" && initialData?.id) {
      result = await updateOutlet({ ...data, id: initialData.id });
    } else {
      result = await createOutlet(data);
    }

    if (!result.success) {
      setError(result.error ?? "Gagal menyimpan outlet");
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
          <label htmlFor="outlet-name" className="text-body-sm font-medium text-on-surface block mb-1">Nama Outlet *</label>
          <input
            id="outlet-name"
            name="name"
            required
            minLength={3}
            defaultValue={initialData?.name}
            placeholder="Nama outlet..."
            className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="outlet-whatsapp" className="text-body-sm font-medium text-on-surface block mb-1">WhatsApp</label>
          <input
            id="outlet-whatsapp"
            name="whatsapp"
            defaultValue={initialData?.whatsapp ?? ""}
            placeholder="6281234567890"
            className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="outlet-description" className="text-body-sm font-medium text-on-surface block mb-1">Deskripsi *</label>
        <textarea
          id="outlet-description"
          name="description"
          required
          minLength={20}
          rows={3}
          defaultValue={initialData?.description}
          placeholder="Deskripsi outlet minimal 20 karakter..."
          className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div>
        <label htmlFor="outlet-address" className="text-body-sm font-medium text-on-surface block mb-1">Alamat Lengkap *</label>
        <input
          id="outlet-address"
          name="address"
          required
          minLength={10}
          defaultValue={initialData?.address}
          placeholder="Jl. Sanan No. ..."
          className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="outlet-lat" className="text-body-sm font-medium text-on-surface block mb-1">Latitude *</label>
          <input
            id="outlet-lat"
            name="latitude"
            type="number"
            step="any"
            required
            defaultValue={initialData?.latitude ?? -7.9768}
            className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="outlet-lng" className="text-body-sm font-medium text-on-surface block mb-1">Longitude *</label>
          <input
            id="outlet-lng"
            name="longitude"
            type="number"
            step="any"
            required
            defaultValue={initialData?.longitude ?? 112.6312}
            className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="outlet-landmark" className="text-body-sm font-medium text-on-surface block mb-1">Patokan Lokasi *</label>
        <textarea
          id="outlet-landmark"
          name="landmarkDescription"
          required
          minLength={10}
          rows={2}
          defaultValue={initialData?.landmarkDescription}
          placeholder="Dari gapura Kampung Sanan, masuk lurus..."
          className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div>
        <label htmlFor="outlet-accessibility" className="text-body-sm font-medium text-on-surface block mb-1">Deskripsi Aksesibilitas *</label>
        <textarea
          id="outlet-accessibility"
          name="accessibilityDescription"
          required
          minLength={20}
          rows={2}
          defaultValue={initialData?.accessibilityDescription}
          placeholder="Pintu masuk lebar tanpa tangga..."
          className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div>
        <label htmlFor="outlet-hours" className="text-body-sm font-medium text-on-surface block mb-1">Jam Buka</label>
        <input
          id="outlet-hours"
          name="openingHours"
          defaultValue="08:00 - 17:00"
          placeholder="08:00 - 17:00"
          className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-outline-variant">
        <Button type="submit" disabled={loading} className="bg-primary-container text-on-primary-container">
          {loading ? "Menyimpan..." : mode === "create" ? "Tambah Outlet" : "Simpan Perubahan"}
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
