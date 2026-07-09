"use client";

import { useEffect, useState } from "react";
import type { MapMouseEvent } from "maplibre-gl";
import { Button } from "@/components/ui/button";
import { Map, MapMarker, MarkerContent, MapControls, useMap } from "@/components/ui/map";
import { createOutlet, updateOutlet } from "@/lib/actions/outlets";
import {
  OpeningHoursField,
  openingHoursToRows,
  rowsToOpeningHours,
  type OpeningHoursRow,
} from "@/components/features/opening-hours-field";
import { SANAN_CENTER, SANAN_DEFAULT_ZOOM } from "@/lib/geo";
import { createClient } from "@/lib/supabase/client";
import type { CreateOutletInput } from "@/lib/validations/outlet";

interface OutletFormProps {
  mode: "create" | "edit";
  initialData?: Partial<CreateOutletInput> & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

type CategoryOption = { slug: string; name: string };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Meneruskan klik peta menjadi koordinat pilihan. */
function MapClickPicker({ onPick }: { onPick: (coords: { latitude: number; longitude: number }) => void }) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    const handler = (e: MapMouseEvent) => {
      onPick({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onPick]);

  return null;
}

export function OutletForm({ mode, initialData, onSuccess, onCancel }: OutletFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: initialData?.latitude ?? SANAN_CENTER[1],
    longitude: initialData?.longitude ?? SANAN_CENTER[0],
  });
  const [hoursRows, setHoursRows] = useState<OpeningHoursRow[]>(() =>
    openingHoursToRows(initialData?.openingHours),
  );
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("categories").select("slug, name").order("name");
        if (data) setCategories(data as CategoryOption[]);
      } catch {
        // dropdown kategori tetap opsional bila gagal dimuat
      }
    }
    loadCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data: CreateOutletInput = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      address: form.get("address") as string,
      latitude: coords.latitude,
      longitude: coords.longitude,
      landmarkDescription: form.get("landmarkDescription") as string,
      accessibilityDescription: form.get("accessibilityDescription") as string,
      whatsapp: (form.get("whatsapp") as string) || null,
      openingHours: rowsToOpeningHours(hoursRows),
      categorySlug: (form.get("categorySlug") as string) || null,
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

  // Clamp ke rentang valid — nilai di luar rentang membuat MapLibre melempar
  // exception saat posisi marker di-update, yang meruntuhkan seluruh halaman form.
  function setLat(value: string) {
    const lat = parseFloat(value);
    if (Number.isFinite(lat)) setCoords((c) => ({ ...c, latitude: clamp(lat, -90, 90) }));
  }
  function setLng(value: string) {
    const lng = parseFloat(value);
    if (Number.isFinite(lng)) setCoords((c) => ({ ...c, longitude: clamp(lng, -180, 180) }));
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
        <label htmlFor="outlet-category" className="text-body-sm font-medium text-on-surface block mb-1">Kategori</label>
        <select
          id="outlet-category"
          name="categorySlug"
          defaultValue={initialData?.categorySlug ?? ""}
          className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Pilih kategori...</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
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

      {/* Pemilih lokasi di peta */}
      <fieldset>
        <legend className="text-body-sm font-medium text-on-surface mb-1">Lokasi di Peta *</legend>
        <p className="text-body-sm text-on-surface-variant mb-2">
          Klik peta atau geser penanda ke posisi toko Anda. Koordinat juga bisa diketik manual di bawah.
        </p>
        <div className="h-[280px] overflow-hidden rounded-xl border border-outline-variant">
          <Map center={[coords.longitude, coords.latitude]} zoom={SANAN_DEFAULT_ZOOM}>
            <MapControls showZoom />
            <MapClickPicker onPick={setCoords} />
            <MapMarker
              longitude={coords.longitude}
              latitude={coords.latitude}
              draggable
              onDragEnd={({ lng, lat }) => setCoords({ latitude: lat, longitude: lng })}
            >
              <MarkerContent>
                <div
                  role="img"
                  aria-label={`Penanda lokasi outlet pada koordinat ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`}
                  className="h-5 w-5 rounded-full border-[3px] border-white bg-primary shadow-lg"
                />
              </MarkerContent>
            </MapMarker>
          </Map>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="outlet-lat" className="text-body-sm font-medium text-on-surface block mb-1">Latitude *</label>
            <input
              id="outlet-lat"
              name="latitude"
              type="number"
              step="any"
              required
              value={coords.latitude}
              onChange={(e) => setLat(e.target.value)}
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
              value={coords.longitude}
              onChange={(e) => setLng(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </fieldset>

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

      <OpeningHoursField rows={hoursRows} onChange={setHoursRows} />

      <div className="flex gap-3 pt-4 border-t border-outline-variant">
        <Button type="submit" disabled={loading} className="bg-primary-container text-on-primary-container">
          {loading ? "Menyimpan..." : mode === "create" ? "Daftarkan Outlet" : "Simpan Perubahan"}
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
