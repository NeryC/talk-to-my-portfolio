import { z } from "zod";

export const CvSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  location: z.string().min(1),
  remote: z.boolean(),
  salaryFromUsd: z.number().int().positive(),
  yearsOfExperience: z.number().int().positive(),
  contact: z.object({
    email: z.string().email(),
    linkedin: z.string().url(),
    github: z.string().url(),
    portfolio: z.string().url(),
  }),
});
export type Cv = z.infer<typeof CvSchema>;
