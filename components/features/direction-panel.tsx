"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DirectionPanelProps {
  outletName: string;
  latitude: number;
  longitude: number;
  address: string;
  landmarkDescription: string;
  accessibilityDescription: string;
}

export function DirectionPanel({
  outletName,
  latitude,
  longitude,
  address,
  landmarkDescription,
  accessibilityDescription,
}: DirectionPanelProps) {
  const [showPanel, setShowPanel] = useState(false);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="rounded-xl border border-outline-variant bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary-container text-on-tertiary-container">
            <span className="material-symbols-outlined">directions</span>
          </div>
          <div>
            <h4 className="font-heading text-body-lg text-on-surface">Arah ke {outletName}</h4>
            <p className="text-body-sm text-on-surface-variant">{address}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowPanel(!showPanel)} aria-expanded={showPanel}>
          <span className="material-symbols-outlined text-sm">{showPanel ? "expand_less" : "expand_more"}</span>
        </Button>
      </div>

      {/* Actions */}
      <div className="p-4 flex flex-wrap gap-3">
        <Button asChild className="bg-primary-container text-on-primary-container">
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <span className="material-symbols-outlined text-sm">map</span>
            Buka Google Maps
          </a>
        </Button>
        <Button variant="outline" onClick={() => setShowPanel(!showPanel)}>
          <span className="material-symbols-outlined text-sm">description</span>
          Instruksi Teks
        </Button>
      </div>

      {/* Text-based directions */}
      {showPanel && (
        <div className="p-4 border-t border-outline-variant space-y-4" role="region" aria-label="Instruksi arah berbasis teks">
          {/* Landmark */}
          <div>
            <h5 className="flex items-center gap-2 text-body-sm font-semibold text-on-surface mb-2">
              <span className="material-symbols-outlined text-sm text-primary">location_on</span>
              Patokan Lokasi
            </h5>
            <p className="text-body-sm text-on-surface-variant pl-7">{landmarkDescription}</p>
          </div>

          {/* Accessibility info */}
          <div>
            <h5 className="flex items-center gap-2 text-body-sm font-semibold text-on-surface mb-2">
              <span className="material-symbols-outlined text-sm text-primary">accessible</span>
              Informasi Aksesibilitas Jalan
            </h5>
            <p className="text-body-sm text-on-surface-variant pl-7">{accessibilityDescription}</p>
          </div>

          {/* Coordinates */}
          <div>
            <h5 className="flex items-center gap-2 text-body-sm font-semibold text-on-surface mb-2">
              <span className="material-symbols-outlined text-sm text-primary">pin_drop</span>
              Koordinat
            </h5>
            <p className="text-body-sm text-on-surface-variant pl-7 font-mono">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>

          {/* Copy link */}
          <div className="pt-2 border-t border-outline-variant">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(googleMapsUrl);
              }}
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              Salin Link Google Maps
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
