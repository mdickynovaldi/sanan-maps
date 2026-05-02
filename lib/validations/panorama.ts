import { z } from "zod";

export const createPanoramaSchema = z.object({
  outletId: z.string().uuid("ID outlet tidak valid"),
  title: z.string().min(3, "Judul minimal 3 karakter").max(100, "Judul maksimal 100 karakter"),
  textDescription: z.string().min(10, "Deskripsi minimal 10 karakter").max(500, "Deskripsi maksimal 500 karakter"),
  image360Url: z.string().url("URL gambar tidak valid"),
  audioDescriptionUrl: z.string().url("URL audio tidak valid").optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  heading: z.number().min(0).max(360).optional().nullable(),
  orderIndex: z.number().int().min(0).default(0),
});

export const updatePanoramaSchema = createPanoramaSchema.partial().extend({
  id: z.string().uuid("ID panorama tidak valid"),
});

export type CreatePanoramaInput = z.infer<typeof createPanoramaSchema>;
export type UpdatePanoramaInput = z.infer<typeof updatePanoramaSchema>;
