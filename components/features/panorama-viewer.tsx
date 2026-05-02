"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export type PanoramaData = {
  id: string;
  title: string;
  image_360_url: string;
  text_description: string;
  audio_description_url: string | null;
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
  /** Whether Street View coverage is available at this location */
  hasStreetView?: boolean;
}

/**
 * Hybrid 360 Panorama Viewer:
 * 1. Google Street View embed (gratis) — jika coverage tersedia
 * 2. Panorama dari Supabase (tabel panoramas) — jika ada data
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

  // Determine available modes
  const hasCustomPanorama = panoramas.length > 0;
  const defaultMode = hasStreetView ? "streetview" : hasCustomPanorama ? "custom" : "custom";

  const [mode, setMode] = useState<"streetview" | "custom">(defaultMode);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [showText, setShowText] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Current panorama data
  const currentPanorama = panoramas[activePanoramaIndex] ?? null;
  const currentImageUrl = currentPanorama?.image_360_url ?? fallbackImageUrl;
  const currentTitle = currentPanorama?.title ?? `360 View - ${outletName}`;
  const currentDescription = currentPanorama?.text_description ?? outletDescription;
  const currentAudioUrl = currentPanorama?.audio_description_url ?? null;

  // Lazy load
  useEffect(() => {
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
    return () => observer.disconnect();
  }, []);

  // Google Street View embed URL (gratis, tanpa API key)
  const simpleEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&layer=c&cbll=${latitude},${longitude}&cbp=11,0,0,0,0&ie=UTF8&source=embed&output=svembed`;

  // Drag handlers for custom panorama
  function handleMouseDown(e: React.MouseEvent) { setIsDragging(true); setStartX(e.clientX - offsetX); }
  function handleMouseMove(e: React.MouseEvent) { if (!isDragging) return; setOffsetX(e.clientX - startX); }
  function handleMouseUp() { setIsDragging(false); }
  function handleTouchStart(e: React.TouchEvent) { setIsDragging(true); setStartX(e.touches[0].clientX - offsetX); }
  function handleTouchMove(e: React.TouchEvent) { if (!isDragging) return; setOffsetX(e.touches[0].clientX - startX); }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") setOffsetX((prev) => prev + 50);
    else if (e.key === "ArrowRight") setOffsetX((prev) => prev - 50);
  }

  return (
    <div ref={containerRef} className="rounded-xl border border-outline-variant overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-surface-container-low p-4 border-b border-outline-variant flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined">360</span>
          </div>
          <div>
            <h4 className="font-heading text-body-lg text-on-surface">{currentTitle}</h4>
            <div className="flex items-center gap-2">
              <p className="text-body-sm text-on-surface-variant">{outletName}</p>
              {/* Street View Coverage Badge */}
              {hasStreetView ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-semibold text-tertiary">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  Street View Tersedia
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[12px]">info</span>
                  Street View Tidak Tersedia
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
              className={mode === "streetview" ? "bg-surface shadow-sm" : ""}
              onClick={() => setMode("streetview")}
              disabled={!hasStreetView}
              title={!hasStreetView ? "Street View tidak tersedia di lokasi ini" : undefined}
            >
              <span className="material-symbols-outlined text-sm">map</span>
              Street View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={mode === "custom" ? "bg-surface shadow-sm" : ""}
              onClick={() => setMode("custom")}
            >
              <span className="material-symbols-outlined text-sm">panorama</span>
              Foto 360
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowText(!showText)} aria-expanded={showText} aria-label="Toggle deskripsi teks">
            <span className="material-symbols-outlined text-sm">description</span>
            Teks
          </Button>
          {currentAudioUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={currentAudioUrl} target="_blank" rel="noopener noreferrer" aria-label="Dengarkan audio description">
                <span className="material-symbols-outlined text-sm">volume_up</span>
                Audio
              </a>
            </Button>
          )}
          {mode === "custom" && (
            <Button variant="ghost" size="sm" onClick={() => setOffsetX(0)} aria-label="Reset posisi">
              <span className="material-symbols-outlined text-sm">restart_alt</span>
            </Button>
          )}
        </div>
      </div>

      {/* Panorama selector (if multiple panoramas) */}
      {hasCustomPanorama && panoramas.length > 1 && mode === "custom" && (
        <div className="flex gap-2 p-3 border-b border-outline-variant bg-surface overflow-x-auto no-scrollbar">
          {panoramas.map((p, i) => (
            <button
              key={p.id}
              onClick={() => { setActivePanoramaIndex(i); setOffsetX(0); }}
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
                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                Powered by Google Street View
              </div>
            </div>
          ) : (
            <div
              className="relative h-[300px] md:h-[400px] overflow-hidden cursor-grab active:cursor-grabbing bg-surface-container-highest select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="img"
              aria-label={`Panorama 360 derajat: ${currentTitle}. ${currentDescription}`}
              aria-roledescription="panorama interaktif"
            >
              <div
                className="absolute top-0 h-full w-[300%] transition-none"
                style={{ transform: `translateX(${offsetX}px)`, backgroundImage: `url(${currentImageUrl})`, backgroundSize: "cover", backgroundRepeat: "repeat-x", backgroundPosition: "center" }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="rounded-lg bg-surface/80 backdrop-blur-sm px-3 py-2 text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">swipe</span>
                  Geser untuk menjelajahi &middot; Gunakan panah kiri/kanan
                </div>
                {!hasCustomPanorama && (
                  <div className="rounded-lg bg-surface/80 backdrop-blur-sm px-3 py-2 text-body-sm text-on-surface-variant">
                    Foto panorama belum tersedia
                  </div>
                )}
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
