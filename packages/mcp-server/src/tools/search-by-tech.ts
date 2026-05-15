import { z } from "zod";
import { loadProjects, loadCourses, loadExperience } from "@neryc/portfolio-shared";
import type { Tool } from "./types.js";

export const searchByTechInputSchema = z.object({
  tech: z.string().min(1),
});

export const searchByTechTool: Tool<typeof searchByTechInputSchema> = {
  name: "searchByTech",
  description:
    "Find Nery's evidence (projects + courses + jobs) for a given technology. Use when a recruiter asks 'do you know X?' or 'show me where you used X'. Match is case-insensitive across tags, skills, and stack.",
  inputSchema: searchByTechInputSchema,
  async execute(args) {
    const needle = args.tech.toLowerCase();
    const matches = (s: string) => s.toLowerCase().includes(needle);

    const projects = loadProjects().filter(
      (p) =>
        p.tags.some(matches) ||
        p.title.toLowerCase().includes(needle) ||
        p.stack.some(matches)
    );

    const courses = loadCourses().courses.filter(
      (c) => c.skills.some(matches) || c.title.toLowerCase().includes(needle)
    );

    const experience = loadExperience().filter(
      (e) => e.stack.some(matches) || e.summary.toLowerCase().includes(needle)
    );

    return {
      tech: args.tech,
      projects: projects.map((p) => ({
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
      })),
      courses: courses.map((c) => ({
        slug: c.slug,
        title: c.title,
        diplomaUrl: c.diplomaUrl,
        completedAt: c.completedAt,
      })),
      experience: experience.map((e) => ({
        companyKey: e.companyKey,
        role: e.role,
        period: e.period,
      })),
    };
  },
};
