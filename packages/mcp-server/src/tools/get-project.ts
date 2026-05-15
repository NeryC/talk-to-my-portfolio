import { z } from "zod";
import { loadProjects } from "@neryc/portfolio-shared";
import type { Tool } from "./types.js";

export const getProjectInputSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug must be lowercase, alphanumeric with hyphens"),
});

export const getProjectTool: Tool<typeof getProjectInputSchema> = {
  name: "getProject",
  description:
    "Get full detail for a single portfolio project, including stack, highlights, and resource URIs for its README and case study. Use after listProjects or when a slug is mentioned.",
  inputSchema: getProjectInputSchema,
  async execute(args) {
    const project = loadProjects().find((p) => p.slug === args.slug);
    if (!project) throw new Error(`unknown project: ${args.slug}`);
    return {
      ...project,
      caseStudyUri: `portfolio://projects/${args.slug}/case-study`,
      readmeUri: `portfolio://projects/${args.slug}/readme`,
    };
  },
};
