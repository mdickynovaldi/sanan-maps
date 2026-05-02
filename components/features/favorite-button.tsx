"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/lib/actions/favorites";

interface FavoriteButtonProps {
  outletId: string;
  initialFavorited?: boolean;
  size?: "default" | "icon";
}

export function FavoriteButton({ outletId, initialFavorited = false, size = "icon" }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleFavorite(outletId);

    if (result.success && result.isFavorited !== undefined) {
      setIsFavorited(result.isFavorited);
    } else if (!result.success) {
      // If not logged in, redirect to login
      if (result.error?.includes("Login")) {
        window.location.href = "/login";
        return;
      }
    }
    setLoading(false);
  }

  if (size === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={loading}
        aria-label={isFavorited ? "Hapus dari favorit" : "Simpan ke favorit"}
        aria-pressed={isFavorited}
      >
        <span
          className={`material-symbols-outlined text-[28px] ${isFavorited ? "text-error" : "text-on-surface-variant"}`}
          style={{ fontVariationSettings: isFavorited ? '"FILL" 1' : '"FILL" 0' }}
        >
          favorite
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      disabled={loading}
      aria-pressed={isFavorited}
      className={isFavorited ? "border-error text-error" : ""}
    >
      <span
        className="material-symbols-outlined text-sm"
        style={{ fontVariationSettings: isFavorited ? '"FILL" 1' : '"FILL" 0' }}
      >
        favorite
      </span>
      {isFavorited ? "Tersimpan" : "Simpan Favorit"}
    </Button>
  );
}
