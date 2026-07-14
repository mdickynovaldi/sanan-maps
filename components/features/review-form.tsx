"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createReview } from "@/lib/actions/reviews";

interface ReviewFormProps {
  outletId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ outletId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableTags = ["rasa", "harga", "pelayanan", "lokasi", "aksesibilitas"];

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setError("Pilih rating terlebih dahulu");
      return;
    }
    setError(null);
    setLoading(true);

    const result = await createReview({
      outletId,
      rating,
      comment,
      tags,
    });

    if (!result.success) {
      setError(result.error ?? "Gagal mengirim review");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setComment("");
    setRating(0);
    setTags([]);
    onSuccess?.();
  }

  if (success) {
    return (
      <div className="rounded-xl border border-outline-variant bg-tertiary/5 p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-tertiary mb-2">check_circle</span>
        <h4 className="font-heading text-h3 text-on-surface">Review Terkirim!</h4>
        <p className="text-body-sm text-on-surface-variant mt-1">Review Anda sudah tayang. Terima kasih!</p>
        <Button variant="outline" className="mt-4" onClick={() => setSuccess(false)}>
          Tulis Review Lagi
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-outline-variant bg-surface p-6 space-y-4">
      <h4 className="font-heading text-h3 text-on-surface">Tulis Review</h4>

      {error && (
        <div className="rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {/* Star Rating */}
      <div>
        <label className="text-body-sm font-medium text-on-surface block mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-primary-container hover:scale-110 transition-transform"
              aria-label={`${star} bintang`}
            >
              <span
                className="material-symbols-outlined text-3xl"
                style={{ fontVariationSettings: (hoverRating || rating) >= star ? '"FILL" 1' : '"FILL" 0' }}
              >
                star
              </span>
            </button>
          ))}
          {rating > 0 && <span className="text-body-sm text-on-surface-variant ml-2 self-center">{rating}/5</span>}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="review-comment" className="text-body-sm font-medium text-on-surface block mb-2">
          Komentar <span className="font-normal text-on-surface-variant">(opsional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Bagikan pengalaman Anda... (boleh dikosongkan)"
          className="w-full px-3 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-body-md outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-body-sm font-medium text-on-surface block mb-2">Tag (opsional)</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1 text-body-sm capitalize transition-colors ${
                tags.includes(tag)
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-primary-container text-on-primary-container">
        {loading ? "Mengirim..." : "Kirim Review"}
      </Button>
    </form>
  );
}
