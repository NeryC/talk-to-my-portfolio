import { z } from "zod";

export const ProjectSummarySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  tagline: z.string(),
  tags: z.array(z.string()),
  githubUrl: z.string().url(),
  demoUrl: z.string().url(),
  heroImage: z.string().url().optional(),
  year: z.number().int().min(2020).max(2030),
  role: z.string(),
});
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;

export const ProjectDetailSchema = ProjectSummarySchema.extend({
  caseStudyUri: z.string().regex(/^portfolio:\/\/projects\/[a-z0-9-]+\/case-study$/),
  readmeUri: z.string().regex(/^portfolio:\/\/projects\/[a-z0-9-]+\/readme$/),
  stack: z.array(z.string()),
  highlights: z.array(z.string()),
});
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;
