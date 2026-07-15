"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EquirectViewer } from "@/components/features/equirect-viewer";

export type PanoramaData = {
  id: string;
  title: string;
  image_360_url: string;
  text_description: string;
  audio_description_url: string | null;
  heading?: number | null;
};

interface PanoramaViewerProps {
  /** Panorama data from Supabase (if available) */
  panoramas: PanoramaData[];
  /** Fallback image URL if no panorama data */
  fallbackImageUrl: string;
  outletName: string;
  outletDescription: string;
  /** Koordinat outlet untuk Google Street View embed */
  latitude: number;
  longitude: number;
  /** Whether Google Street View embed should be offered at this location */
  hasStreetView?: boolean;
}

/**
 * Hybrid 360 Panorama Viewer:
 * 1. Panorama 360 milik toko (tabel panoramas, dirender WebGL equirectangular) — prioritas utama
 * 2. Google Street View embed (gratis) — alternatif bila tersedia
 * 3. Fallback foto biasa — jika keduanya tidak ada
 */
export function PanoramaViewer({
  panoramas,
  fallbackImageUrl,
  outletName,
  outletDescription,
  latitude,
  longitude,
  hasStreetView = false,
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePanoramaIndex, setActivePanoramaIndex] = useState(0);

  // Panorama milik toko selalu jadi tampilan awal bila ada.
  const hasCustomPanorama = panoramas.length > 0;
  const defaultMode = hasCustomPanorama ? "custom" : hasStreetView ? "streetview" : "custom";

  const [mode, setMode] = useState<"streetview" | "custom">(defaultMode);
  const [showText, setShowText] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Current panorama data
  const currentPanorama = panoramas[activePanoramaIndex] ?? null;
  const currentImageUrl = currentPanorama?.image_360_url ?? fallbackImageUrl;
  const currentTitle = currentPanorama?.title ?? `360 View - ${outletName}`;
  const currentDescription = currentPanorama?.text_description ?? outletDescription;
  const currentAudioUrl = currentPanorama?.audio_description_url ?? null;

  // Lazy load: tunda konten berat sampai terlihat, dengan fallback timer
  // untuk lingkungan tanpa IntersectionObserver yang andal (webview/headless).
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    const fallback = setTimeout(() => setIsVisible(true), 1500);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  // Google Street View embed URL (gratis, tanpa API key)
  const simpleEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&layer=c&cbll=${latitude},${longitude}&cbp=11,0,0,0,0&ie=UTF8&source=embed&output=svembed`;

  return (
    <div ref={containerRef} className="rounded-xl border border-outline-variant overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-surface-container-low p-4 border-b border-outline-variant flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined" aria-hidden="true">360</span>
          </div>
          <div>
            <h4 className="font-heading text-body-lg text-on-surface">{currentTitle}</h4>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-body-sm text-on-surface-variant">{outletName}</p>
              {hasCustomPanorama && (
                <span className="inline-flex items-center gap-1 rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-semibold text-tertiary">
                  <span className="material-symbols-outlined text-[12px]" aria-hidden="true">check_circle</span>
                  Foto 360 Tersedia
                </span>
              )}
              {hasStreetView && (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[12px]" aria-hidden="true">map</span>
                  Google Street View
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Mode toggle */}
          <div className="flex rounded-lg bg-surface-variant p-1">
            <Button
              variant="ghost"
              size="sm"
              className={mode === "custom" ? "bg-surface shadow-sm" : ""}
              onClick={() => setMode("custom")}
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">panorama</span>
              Foto 360
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={mode === "streetview" ? "bg-surface shadow-sm" : ""}
              onClick={() => setMode("streetview")}
              disabled={!hasStreetView}
              title={!hasStreetView ? "Street View tidak tersedia di lokasi ini" : undefined}
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">map</span>
              Street View
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowText(!showText)} aria-expanded={showText} aria-label="Tampilkan deskripsi teks panorama">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">description</span>
            Teks
          </Button>
          {currentAudioUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={currentAudioUrl} target="_blank" rel="noopener noreferrer" aria-label="Dengarkan audio description">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">volume_up</span>
                Audio
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Panorama selector (if multiple panoramas) */}
      {hasCustomPanorama && panoramas.length > 1 && mode === "custom" && (
        <div className="flex gap-2 p-3 border-b border-outline-variant bg-surface overflow-x-auto no-scrollbar" role="group" aria-label="Pilih titik panorama">
          {panoramas.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActivePanoramaIndex(i)}
              aria-pressed={i === activePanoramaIndex}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-body-sm transition-colors ${
                i === activePanoramaIndex
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Text Description */}
      {showText && (
        <div className="bg-surface p-4 border-b border-outline-variant" role="region" aria-label="Deskripsi teks panorama">
          <p className="text-body-sm text-on-surface-variant">{currentDescription}</p>
        </div>
      )}

      {/* Content */}
      {isVisible ? (
        <>
          {mode === "streetview" && hasStreetView ? (
            <div className="relative h-[300px] md:h-[400px] bg-surface-container-highest">
              <iframe
                src={simpleEmbedUrl}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Google Street View - ${outletName}`}
              />
              <div className="absolute bottom-4 left-4 rounded-lg bg-surface/80 backdrop-blur-sm px-3 py-2 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-sm align-middle mr-1" aria-hidden="true">info</span>
                Powered by Google Street View
              </div>
            </div>
          ) : hasCustomPanorama ? (
            <div className="relative h-[300px] md:h-[400px] bg-surface-container-highest">
              <EquirectViewer
                imageUrl={currentImageUrl}
                initialYaw={currentPanorama?.heading ?? 0}
                ariaLabel={`Panorama 360 derajat: ${currentTitle}. ${currentDescription}`}
                className="absolute inset-0"
              />
              <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-surface/80 backdrop-blur-sm px-3 py-2 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-sm align-middle mr-1" aria-hidden="true">swipe</span>
                Geser untuk melihat sekeliling &middot; panah kiri/kanan &middot; scroll untuk zoom
              </div>
            </div>
          ) : (
            <div
              className="relative h-[300px] md:h-[400px] bg-surface-container-highest"
              role="img"
              aria-label={`Foto ${outletName}. ${currentDescription}`}
            >
              {/* Belum ada panorama 360 — tampilkan foto biasa, tanpa pura-pura 360 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImageUrl}
                alt={`Foto ${outletName}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 rounded-lg bg-surface/80 backdrop-blur-sm px-3 py-2 text-body-sm text-on-surface-variant">
                Foto panorama 360 belum tersedia untuk outlet ini
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-[300px] md:h-[400px] flex items-center justify-center bg-surface-container-highest">
          <p className="text-on-surface-variant">Loading panorama...</p>
        </div>
      )}
    </div>
  );
}
