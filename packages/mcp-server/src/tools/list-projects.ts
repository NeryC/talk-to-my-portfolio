import { z } from "zod";
import { loadProjects } from "@neryc/portfolio-shared";
import type { Tool } from "./types.js";

export const listProjectsInputSchema = z.object({
  tags: z.array(z.string()).optional(),
});

export const listProjectsTool: Tool<typeof listProjectsInputSchema> = {
  name: "listProjects",
  description:
    "List Nery's portfolio projects. Use when the recruiter asks 'what have you built?' or wants an overview. Optionally filter by tag (e.g. 'rag', 'ai', 'react').",
  inputSchema: listProjectsInputSchema,
  async execute(args) {
    const tags = args.tags ?? [];
    const all = loadProjects();
    const filtered = tags.length
      ? all.filter((p) => tags.some((t) => p.tags.includes(t)))
      : all;
    return {
      projects: filtered.map((p) => ({
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        tags: p.tags,
        demoUrl: p.demoUrl,
        githubUrl: p.githubUrl,
      })),
    };
  },
};
