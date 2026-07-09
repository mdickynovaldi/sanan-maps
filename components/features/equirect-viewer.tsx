"use client";

import { useEffect, useRef, useState } from "react";
import "pannellum/build/pannellum.css";

type PannellumViewer = {
  destroy: () => void;
};

type PannellumGlobal = {
  viewer: (container: HTMLElement, config: Record<string, unknown>) => PannellumViewer;
};

/**
 * Viewer panorama 360° equirectangular berbasis Pannellum (WebGL).
 * Mendukung drag mouse/sentuh, keyboard (panah), zoom, dan fullscreen —
 * pengalaman setara Street View untuk foto 360 yang diunggah pemilik toko.
 */
export function EquirectViewer({
  imageUrl,
  ariaLabel,
  initialYaw = 0,
  className,
}: {
  imageUrl: string;
  /** Deskripsi panorama untuk pembaca layar. */
  ariaLabel: string;
  /** Arah pandang awal dalam derajat (0 = tengah gambar). */
  initialYaw?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let viewer: PannellumViewer | null = null;
    let cancelled = false;

    async function init() {
      // Pannellum menempel ke window; hanya bisa dimuat di sisi klien.
      await import("pannellum");
      if (cancelled || !containerRef.current) return;

      const pannellum = (window as unknown as { pannellum?: PannellumGlobal }).pannellum;
      if (!pannellum) {
        setError("Viewer 360 gagal dimuat.");
        return;
      }

      viewer = pannellum.viewer(containerRef.current, {
        type: "equirectangular",
        panorama: imageUrl,
        autoLoad: true,
        yaw: initialYaw,
        hfov: 100,
        minHfov: 40,
        maxHfov: 120,
        compass: false,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        keyboardZoom: true,
        friction: 0.15,
        crossOrigin: "anonymous",
        strings: {
          loadingLabel: "Memuat panorama...",
        },
      });
    }

    init().catch(() => setError("Viewer 360 gagal dimuat."));

    return () => {
      cancelled = true;
      viewer?.destroy();
    };
  }, [imageUrl, initialYaw]);

  if (error) {
    return (
      <div className={className}>
        <div className="flex h-full items-center justify-center bg-surface-container-highest">
          <p className="text-body-sm text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      role="application"
      aria-label={ariaLabel}
      aria-roledescription="panorama 360 derajat interaktif"
    />
  );
}
