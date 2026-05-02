import { z } from "zod";

export const createReviewSchema = z.object({
  outletId: z.string().uuid("ID outlet tidak valid"),
  rating: z.number().int().min(1).max(5),
  accessibilityRating: z.number().int().min(1).max(5).optional().nullable(),
  comment: z.string().min(3, "Review minimal 3 karakter"),
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
