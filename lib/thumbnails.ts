/**
 * Thumbnail default bertema per kategori — dipakai sebagai fallback ketika
 * outlet/produk belum punya foto. Semua aset satu tema visual (krem + amber +
 * terakota, motif kanopi warung seperti logo).
 */
const CATEGORY_THUMBNAILS: Record<string, string> = {
  "keripik-tempe": "/thumbnails/keripik-tempe.svg",
  "oleh-oleh": "/thumbnails/oleh-oleh.svg",
  kuliner: "/thumbnails/kuliner.svg",
  kerajinan: "/thumbnails/kerajinan.svg",
  minuman: "/thumbnails/minuman.svg",
  "tempe-segar": "/thumbnails/tempe-segar.svg",
};

export const DEFAULT_THUMBNAIL = "/thumbnails/default.svg";

export function getCategoryThumbnail(slug: string | null | undefined): string {
  return (slug && CATEGORY_THUMBNAILS[slug]) || DEFAULT_THUMBNAIL;
}
