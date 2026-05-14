import { z } from "zod";

export const SkillSchema = z.object({
  skill: z.string().min(1),
  level: z.enum(["expert", "proficient", "familiar"]),
  category: z.enum(["language", "framework", "infra", "ai", "soft"]),
  proof: z.object({
    projects: z.array(z.string()),
    courses: z.array(z.string()),
    experience: z.array(z.string()),
  }),
});
export type Skill = z.infer<typeof SkillSchema>;
