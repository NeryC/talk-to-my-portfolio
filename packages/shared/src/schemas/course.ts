import { z } from "zod";

export const CourseSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  completedAt: z.string().datetime().nullable(),
  hours: z.number().nullable(),
  skills: z.array(z.string()),
  diplomaUrl: z.string().url(),
  badgeImageUrl: z.string().url().optional(),
  careerSlug: z.string().optional(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CourseFileSchema = z.object({
  syncedAt: z.string().datetime(),
  source: z.string(),
  courses: z.array(CourseSchema),
});
export type CourseFile = z.infer<typeof CourseFileSchema>;
