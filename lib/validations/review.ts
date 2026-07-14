import { z } from "zod";

export const createReviewSchema = z.object({
  outletId: z.string().uuid("ID outlet tidak valid"),
  rating: z.number().int().min(1).max(5),
  accessibilityRating: z.number().int().min(1).max(5).optional().nullable(),
  // Komentar opsional — review boleh bintang saja. Jika diisi, minimal 3 karakter.
  comment: z
    .string()
    .trim()
    .max(1000, "Komentar maksimal 1000 karakter")
    .optional()
    .default("")
    .refine((v) => v.length === 0 || v.length >= 3, "Komentar minimal 3 karakter, atau kosongkan"),
  tags: z.array(z.string()).optional().default([]),
});

export const updateReviewSchema = createReviewSchema.partial().extend({
  id: z.string().uuid("ID review tidak valid"),
});

export const moderateReviewSchema = z.object({
  id: z.string().uuid("ID review tidak valid"),
  status: z.enum(["pending", "approved", "hidden", "deleted"]),
  ownerReply: z.string().optional().nullable(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
