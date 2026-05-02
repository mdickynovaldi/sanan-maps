"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { checkStreetViewCoverage } from "@/lib/actions/street-view-coverage";

interface StreetViewCheckerProps {
  latitude?: number | null;
  longitude?: number | null;
  onResult?: (available: boolean) => void;
}

export function StreetViewChecker({ latitude, longitude, onResult }: StreetViewCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{
    available: boolean;
    panoId?: string;
    location?: { lat: number; lng: number };
    error?: string;
  } | null>(null);

  async function handleCheck() {
    if (!latitude || !longitude) return;

    setChecking(true);
    setResult(null);

    const coverage = await checkStreetViewCoverage(latitude, longitude);
    setResult(coverage);
    onResult?.(coverage.available);
    setChecking(false);
  }

  const hasCoordinates = latitude != null && longitude != null;

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">streetview</span>
        <h4 className="font-heading text-body-lg text-on-surface">Street View Coverage</h4>
      </div>

      {!hasCoordinates ? (
        <p className="text-body-sm text-on-surface-variant">
          Koordinat outlet diperlukan untuk mengecek coverage Street View.
        </p>
      ) : (
        <>
          <p className="text-body-sm text-on-surface-variant">
            Cek apakah Google Street View tersedia di lokasi ({latitude?.toFixed(4)}, {longitude?.toFixed(4)})
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCheck}
            disabled={checking}
          >
            {checking ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Mengecek...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">search</span>
                Cek Coverage
              </>
            )}
          </Button>

          {result && (
            <div className={`rounded-lg p-3 ${result.available ? "bg-tertiary/10" : "bg-surface-container-high"}`}>
              {result.available ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-tertiary">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span className="text-body-sm font-semibold">Street View Tersedia!</span>
                  </div>
                  {result.panoId && (
                    <p className="text-body-sm text-on-surface-variant">Pano ID: {result.panoId}</p>
                  )}
                  {result.location && (
                    <p className="text-body-sm text-on-surface-variant">
                      Lokasi terdekat: {result.location.lat.toFixed(6)}, {result.location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span className="text-body-sm font-semibold">Street View Tidak Tersedia</span>
                  </div>
                  {result.error && (
                    <p className="text-body-sm text-error">{result.error}</p>
                  )}
                  <p className="text-body-sm text-on-surface-variant">
                    Upload panorama 360° manual sebagai alternatif.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
