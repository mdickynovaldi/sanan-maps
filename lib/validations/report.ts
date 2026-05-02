import { z } from "zod";

export const createReportSchema = z.object({
  outletId: z.string().uuid("ID outlet tidak valid"),
  type: z.enum(["wrong_location", "wrong_hours", "abusive_review", "accessibility_issue", "other"]),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
});

export const updateReportStatusSchema = z.object({
  id: z.string().uuid("ID report tidak valid"),
  status: z.enum(["open", "in_review", "resolved", "rejected"]),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
