import { z } from "zod";

export const createProductSchema = z.object({
  outletId: z.string().uuid("ID outlet tidak valid"),
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  price: z.number().int().min(0, "Harga tidak boleh negatif"),
  category: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  imageAlt: z.string().min(3, "Alt text minimal 3 karakter").optional().nullable(),
  isAvailable: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid("ID produk tidak valid"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
