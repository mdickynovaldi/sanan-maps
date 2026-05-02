import { z } from "zod";

export const accessibilityPreferencesSchema = z.object({
  highContrast: z.boolean().optional(),
  largeText: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
  defaultListView: z.boolean().optional(),
  audioGuide: z.boolean().optional(),
  textDirections: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const updateAccessibilityPreferencesSchema = z.object({
  accessibilityPreferences: accessibilityPreferencesSchema,
});

export type AccessibilityPreferencesInput = z.infer<typeof accessibilityPreferencesSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateAccessibilityPreferencesInput = z.infer<typeof updateAccessibilityPreferencesSchema>;
