"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface StreetViewCheckerProps {
  latitude?: number | null;
  longitude?: number | null;
  onResult?: (available: boolean) => void;
}

/**
 * Pratinjau Google Street View langsung via embed keyless — TANPA API key.
 * Memakai URL embed yang sama dengan viewer publik di halaman detail outlet,
 * jadi apa yang tampil di sini persis yang dilihat pengunjung.
 */
export function StreetViewChecker({ latitude, longitude, onResult }: StreetViewCheckerProps) {
  const [showPreview, setShowPreview] = useState(false);
  const hasCoordinates = latitude != null && longitude != null;

  // Embed keyless selalu bisa dicoba selama koordinat ada.
  useEffect(() => {
    onResult?.(hasCoordinates);
  }, [hasCoordinates, onResult]);

  const embedUrl = hasCoordinates
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&layer=c&cbll=${latitude},${longitude}&cbp=11,0,0,0,0&ie=UTF8&source=embed&output=svembed`
    : null;
  const mapsUrl = hasCoordinates
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&layer=c&cbll=${latitude},${longitude}`
    : null;

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">streetview</span>
        <h4 className="font-heading text-body-lg text-on-surface">Google Street View</h4>
      </div>

      {!hasCoordinates ? (
        <p className="text-body-sm text-on-surface-variant">
          Koordinat outlet diperlukan untuk menampilkan Street View.
        </p>
      ) : (
        <>
          <p className="text-body-sm text-on-surface-variant">
            Terhubung langsung ke Google Street View (tanpa API key) di lokasi ({latitude?.toFixed(4)}, {longitude?.toFixed(4)}).
            Tab &quot;360 View&quot; halaman outlet otomatis menampilkan ini bila belum ada panorama 360 kustom.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                {showPreview ? "visibility_off" : "visibility"}
              </span>
              {showPreview ? "Sembunyikan Pratinjau" : "Tampilkan Pratinjau"}
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href={mapsUrl!} target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">open_in_new</span>
                Buka di Google Maps
              </a>
            </Button>
          </div>

          {showPreview && embedUrl && (
            <div className="overflow-hidden rounded-lg border border-outline-variant">
              <iframe
                src={embedUrl}
                title="Pratinjau Google Street View lokasi outlet"
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
