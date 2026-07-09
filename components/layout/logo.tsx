/**
 * Logo Sanan Explorer: pin peta berisi etalase toko (storefront) — mewakili
 * "peta + UMKM". Warna mengikuti tema amber/emas aplikasi.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Logo Sanan Explorer"
    >
      <defs>
        <linearGradient id="sananPinInline" x1="32" y1="3" x2="32" y2="61" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC63A" />
          <stop offset="1" stopColor="#E08400" />
        </linearGradient>
      </defs>
      <path d="M32 61s22-19.7 22-34A22 22 0 1 0 10 27c0 14.3 22 34 22 34Z" fill="url(#sananPinInline)" />
      <rect x="18.5" y="24" width="27" height="16.5" rx="2.5" fill="#FFF8EC" />
      <path
        d="M16.5 17.5h31l1.8 6.4a2 2 0 0 1-1.9 2.6h-1.3l-2-2.8-2.6 2.8h-2.3l-2-2.8-2.6 2.8h-2.3l-2-2.8-2.6 2.8h-2.3l-2-2.8-2.6 2.8h-1.3a2 2 0 0 1-1.9-2.6l1.8-6.4Z"
        fill="#C2410C"
      />
      <path
        d="M22.7 17.5l-1.4 6.9M29 17.5l-.5 6.9M35 17.5l.5 6.9M41.3 17.5l1.4 6.9"
        stroke="#FFF8EC"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M28.5 40.5v-8a3.5 3.5 0 0 1 7 0v8" fill="#6A4700" />
      <circle cx="33.6" cy="36.4" r="0.9" fill="#FFC63A" />
    </svg>
  );
}
