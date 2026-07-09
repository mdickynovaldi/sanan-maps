"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { uploadAudio, uploadImage } from "@/lib/actions/upload";
import { createPanorama } from "@/lib/actions/panoramas";

interface PanoramaFormProps {
  outletId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PanoramaForm({ outletId, onSuccess, onCancel }: PanoramaFormProps) {
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreviewSrc(localPreview);
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImage(formData, "panoramas");
    if (!result.success || !result.url) {
      setError(result.error ?? "Gagal upload gambar");
      setPreviewSrc(null);
    } else {
      setImageUrl(result.url);
    }
    setUploading(false);
  }

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAudio(formData, "audio");
    if (!result.success || !result.url) {
      setError(result.error ?? "Gagal upload audio");
    } else {
      setAudioUrl(result.url);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!imageUrl) {
      setError("Upload gambar 360° terlebih dahulu");
      return;
    }

    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const textDescription = form.get("textDescription") as string;
    const latitude = form.get("latitude") as string;
    const longitude = form.get("longitude") as string;
    const heading = form.get("heading") as string;
    const orderIndex = form.get("orderIndex") as string;

    const result = await createPanorama({
      outletId,
      title,
      textDescription,
      image360Url: imageUrl,
      audioDescriptionUrl: audioUrl,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      heading: heading ? parseFloat(heading) : null,
      orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0,
    });

    if (!result.success) {
      setError(result.error ?? "Gagal menyimpan panorama");
    } else {
      onSuccess?.();
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error-container p-3 text-body-sm text-on-error-container">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="pano-image-upload" className="text-label-caps text-on-surface-variant block mb-2">
          Gambar 360° <span className="text-error">*</span>
        </label>
        <button
          id="pano-image-upload"
          type="button"
          className="relative w-full border-2 border-dashed border-outline-variant rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewSrc ? (
            <div className="relative h-48 w-full">
              <Image src={previewSrc} alt="Preview panorama" fill className="object-cover" />
              {uploading && (
                <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
                  <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                  <span className="ml-2 text-body-sm text-on-surface">Uploading...</span>
                </div>
              )}
              {imageUrl && !uploading && (
                <div className="absolute top-2 right-2 rounded-full bg-tertiary p-1">
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl">panorama</span>
              <p className="text-body-sm">Klik untuk upload gambar 360°</p>
              <p className="text-body-sm text-on-surface-variant/60">JPG, PNG, WebP • Maks 5MB</p>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <div>
        <label htmlFor="pano-title" className="text-label-caps text-on-surface-variant block mb-1">
          Judul <span className="text-error">*</span>
        </label>
        <input
          id="pano-title"
          name="title"
          required
          minLength={3}
          maxLength={100}
          placeholder="Contoh: Tampak Depan Toko"
          className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="pano-desc" className="text-label-caps text-on-surface-variant block mb-1">
          Deskripsi Teks <span className="text-error">*</span>
        </label>
        <textarea
          id="pano-desc"
          name="textDescription"
          required
          minLength={10}
          maxLength={500}
          rows={3}
          placeholder="Deskripsi aksesibilitas untuk panorama ini..."
          className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="pano-lat" className="text-label-caps text-on-surface-variant block mb-1">Latitude</label>
          <input
            id="pano-lat"
            name="latitude"
            type="number"
            step="any"
            placeholder="-7.9612"
            className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="pano-lng" className="text-label-caps text-on-surface-variant block mb-1">Longitude</label>
          <input
            id="pano-lng"
            name="longitude"
            type="number"
            step="any"
            placeholder="112.6440"
            className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="pano-heading" className="text-label-caps text-on-surface-variant block mb-1">Heading (0-360°)</label>
          <input
            id="pano-heading"
            name="heading"
            type="number"
            min="0"
            max="360"
            step="any"
            placeholder="0"
            className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pano-order" className="text-label-caps text-on-surface-variant block mb-1">Urutan</label>
        <input
          id="pano-order"
          name="orderIndex"
          type="number"
          min="0"
          defaultValue={0}
          className="w-full px-4 py-2 rounded border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="pano-audio-upload" className="text-label-caps text-on-surface-variant block mb-2">Audio Deskripsi (Opsional)</label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => audioInputRef.current?.click()}
            disabled={uploading}
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            {audioUrl ? "Ganti Audio" : "Upload Audio"}
          </Button>
          {audioUrl && (
            <span className="text-body-sm text-tertiary flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Audio terupload
            </span>
          )}
        </div>
        <input
          id="pano-audio-upload"
          ref={audioInputRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/ogg"
          onChange={handleAudioUpload}
          className="hidden"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-outline-variant">
        <Button
          type="submit"
          disabled={submitting || uploading || !imageUrl}
          className="bg-primary-container text-on-primary-container"
        >
          {submitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              Menyimpan...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">save</span>
              Simpan Panorama
            </>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
