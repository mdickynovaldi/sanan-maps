import { z } from "zod";

export const openingHoursSchema = z.record(z.string(), z.string());

export const createOutletSchema = z.object({
  name: z.string().min(3, "Nama outlet minimal 3 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter"),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  address: z.string().min(10, "Alamat terlalu pendek"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  landmarkDescription: z.string().min(10, "Patokan lokasi wajib diisi"),
  accessibilityDescription: z.string().min(20, "Deskripsi aksesibilitas wajib diisi"),
  whatsapp: z.string().optional().nullable(),
  openingHours: openingHoursSchema,
  status: z.enum(["pending", "approved", "rejected", "archived"]).default("pending"),
});

export const updateOutletSchema = createOutletSchema.partial().extend({
  id: z.string().uuid("ID outlet tidak valid"),
});

export type CreateOutletInput = z.infer<typeof createOutletSchema>;
export type UpdateOutletInput = z.infer<typeof updateOutletSchema>;
