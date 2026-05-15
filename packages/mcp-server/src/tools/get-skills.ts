import { z } from "zod";
import { loadSkills } from "@neryc/portfolio-shared";
import type { Tool } from "./types.js";

export const getSkillsInputSchema = z.object({
  category: z.enum(["language", "framework", "infra", "ai", "soft"]).optional(),
});

export const getSkillsTool: Tool<typeof getSkillsInputSchema> = {
  name: "getSkills",
  description:
    "Return Nery's skills with attached proof (projects, courses, employers). Optionally filter by category. Use when the recruiter wants a skill matrix or evidence-backed expertise list.",
  inputSchema: getSkillsInputSchema,
  async execute(args) {
    const all = loadSkills();
    return { skills: args.category ? all.filter((s) => s.category === args.category) : all };
  },
};
