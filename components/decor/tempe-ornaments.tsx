import type { CSSProperties, SVGProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Ornamen vector tempe — digambar orisinal (bukan aset stock) supaya bebas
 * lisensi. Semua motif memakai `currentColor` agar bisa diwarnai lewat kelas
 * `text-*`, dan dipakai transparan (opacity rendah) sebagai dekorasi bertema
 * tempe khas Kampung Sanan. Semua komponen dekoratif WAJIB `aria-hidden` +
 * `pointer-events-none` agar tidak mengganggu aksesibilitas.
 */

type IconProps = SVGProps<SVGSVGElement>;

/** Tempe bungkus daun pisang, diikat tali — motif utama. */
export function TempeWrapIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* Ujung daun kiri & kanan */}
      <path d="M10 32c-4-6-6-7-8-7 3-2 6-3 10-2" />
      <path d="M54 32c4 6 6 7 8 7-3 2-6 3-10 2" />
      {/* Badan bungkusan */}
      <path d="M12 23c6-3 34-3 40 0 3 5 3 13 0 18-6 3-34 3-40 0-3-5-3-13 0-18Z" />
      {/* Lipatan daun */}
      <path d="M20 22.5c-2 6-2 13 0 19M44 22.5c2 6 2 13 0 19" />
      {/* Tali pengikat */}
      <path d="M28 21.5v21M36 21.5v21" />
      <path d="M28 27h8M28 37h8" />
    </svg>
  );
}

/** Balok tempe dengan irisan — tekstur butir kedelai terlihat. */
export function TempeSliceIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* Balok tempe */}
      <path d="M6 26h34v18H6zM6 26l8-8h34l-8 8M40 26l8-8v18l-8 8" />
      {/* Butir kedelai pada penampang */}
      <circle cx="13" cy="32" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="21" cy="30" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="29" cy="33" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="38" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="25" cy="39" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="34" cy="38" r="1.6" fill="currentColor" stroke="none" />
      {/* Irisan bersandar */}
      <path d="M50 30l8 4-6 16-8-4z" />
      <circle cx="52" cy="37" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="54" cy="42" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Tiga butir kedelai. */
export function SoybeanIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <ellipse cx="22" cy="24" rx="10" ry="8" transform="rotate(-18 22 24)" />
      <ellipse cx="42" cy="28" rx="10" ry="8" transform="rotate(14 42 28)" />
      <ellipse cx="31" cy="43" rx="10" ry="8" transform="rotate(-6 31 43)" />
      {/* Hilum (mata biji) */}
      <path d="M19 25c2 1 4 1 6 0M39 29c2 1 4 1 6 0M28 44c2 1 4 1 6 0" />
    </svg>
  );
}

/** Daun pisang pembungkus. */
export function BananaLeafIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M6 44C14 20 34 10 58 12c-2 24-16 40-42 38-4-1-8-3-10-6Z" />
      {/* Tulang daun */}
      <path d="M10 42C22 30 38 20 54 15" />
      <path d="M22 34c-2-4-2-8-1-12M32 28c-1-4 0-8 2-12M42 23c0-3 1-6 3-9M18 38c-3-2-5-5-6-8" />
    </svg>
  );
}

/** Keripik tempe Sanan — irisan tipis bundar dengan taburan kedelai. */
export function KeripikIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M32 8c14 0 24 10 24 24S46 56 32 56 8 46 8 32 18 8 32 8Z" />
      <path d="M32 14c-2 6-2 30 0 36M14 25c8-3 28-3 36 0M14 40c8 3 28 3 36 0" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="40" cy="22" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="22" cy="38" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="42" cy="40" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="33" cy="31" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const MOTIFS = {
  wrap: TempeWrapIcon,
  slice: TempeSliceIcon,
  soybean: SoybeanIcon,
  leaf: BananaLeafIcon,
  keripik: KeripikIcon,
} as const;

export type TempeMotif = keyof typeof MOTIFS;

type TempeOrnamentProps = {
  motif?: TempeMotif;
  className?: string;
  style?: CSSProperties;
  /** Sudut rotasi derajat (default 0). */
  rotate?: number;
  /** Ketebalan garis SVG (default 2 — kecilkan untuk ornamen besar). */
  strokeWidth?: number;
};

/**
 * Satu ornamen tempe transparan untuk ditempel absolut pada section yang
 * ber-`relative overflow-hidden`. Atur posisi/ukuran/warna lewat className,
 * mis. `absolute -right-10 top-8 h-48 w-48 text-primary opacity-[0.07]`.
 */
export function TempeOrnament({ motif = "wrap", className, style, rotate = 0, strokeWidth = 2 }: TempeOrnamentProps) {
  const Icon = MOTIFS[motif];
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute select-none text-primary opacity-[0.07]", className)}
      style={{ ...style, transform: rotate ? `rotate(${rotate}deg)` : style?.transform }}
    >
      <Icon className="h-full w-full" strokeWidth={strokeWidth} />
    </span>
  );
}

type TempePatternProps = {
  className?: string;
  /** Ukuran satu ubin pattern dalam px (default 220). */
  size?: number;
  /** Wajib unik bila ada >1 TempePattern dengan `size` berbeda di satu halaman. */
  patternId?: string;
};

/**
 * Latar pattern tempe yang menutupi section (absolute inset-0). Motif
 * bergantian: bungkusan, kedelai, irisan, daun. Pakai di dalam kontainer
 * `relative`, beri warna & opasitas lewat className, mis.
 * `text-primary opacity-[0.04]`.
 */
export function TempePattern({ className, size = 220, patternId = "tempe-pattern" }: TempePatternProps) {
  const half = size / 2;
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full select-none text-primary opacity-[0.04]", className)}
    >
      <defs>
        <pattern id={patternId} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <g transform={`translate(${half * 0.08} ${half * 0.08}) scale(${size / 640})`}>
            <TempeWrapMotifPaths />
          </g>
          <g transform={`translate(${half * 1.16} ${half * 0.24}) scale(${size / 880}) rotate(18 32 32)`}>
            <SoybeanMotifPaths />
          </g>
          <g transform={`translate(${half * 0.24} ${half * 1.12}) scale(${size / 780}) rotate(-14 32 32)`}>
            <TempeSliceMotifPaths />
          </g>
          <g transform={`translate(${half * 1.18} ${half * 1.2}) scale(${size / 820}) rotate(10 32 32)`}>
            <BananaLeafMotifPaths />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/* Path mentah tiap motif untuk dipakai di dalam <pattern> (skala 64×64). */
function TempeWrapMotifPaths() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 32c-4-6-6-7-8-7 3-2 6-3 10-2M54 32c4 6 6 7 8 7-3 2-6 3-10 2" />
      <path d="M12 23c6-3 34-3 40 0 3 5 3 13 0 18-6 3-34 3-40 0-3-5-3-13 0-18Z" />
      <path d="M28 21.5v21M36 21.5v21" />
    </g>
  );
}

function SoybeanMotifPaths() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="22" cy="24" rx="10" ry="8" transform="rotate(-18 22 24)" />
      <ellipse cx="42" cy="28" rx="10" ry="8" transform="rotate(14 42 28)" />
      <ellipse cx="31" cy="43" rx="10" ry="8" transform="rotate(-6 31 43)" />
    </g>
  );
}

function TempeSliceMotifPaths() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 26h34v18H6zM6 26l8-8h34l-8 8M40 26l8-8v18l-8 8" />
    </g>
  );
}

function BananaLeafMotifPaths() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 44C14 20 34 10 58 12c-2 24-16 40-42 38-4-1-8-3-10-6Z" />
      <path d="M10 42C22 30 38 20 54 15" />
    </g>
  );
}

/**
 * Pembatas section bermotif tempe: garis + deretan ikon kecil di tengah.
 * Dekoratif murni (aria-hidden).
 */
export function TempeDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none flex items-center justify-center gap-3 text-primary/25 select-none", className)}>
      <span className="h-px w-16 bg-current sm:w-24" />
      <SoybeanIcon className="h-4 w-4" strokeWidth={4} />
      <TempeWrapIcon className="h-5 w-5" strokeWidth={4} />
      <SoybeanIcon className="h-4 w-4" strokeWidth={4} />
      <span className="h-px w-16 bg-current sm:w-24" />
    </div>
  );
}
