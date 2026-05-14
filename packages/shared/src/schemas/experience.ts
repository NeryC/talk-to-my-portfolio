import { z } from "zod";

export const ExperienceSchema = z.object({
  companyKey: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.string(),
  location: z.string(),
  summary: z.string(),
  metrics: z.array(z.string()),
  stack: z.array(z.string()),
});
export type Experience = z.infer<typeof ExperienceSchema>;
