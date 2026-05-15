import { z } from "zod";
import { loadCourses } from "@neryc/portfolio-shared";
import type { Tool } from "./types.js";

export const getCourseInputSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
});

export const getCourseTool: Tool<typeof getCourseInputSchema> = {
  name: "getCourse",
  description:
    "Get full detail for a single Platzi course by slug, including the verifiable diploma URL. Use after searchCourses or when a course slug is mentioned.",
  inputSchema: getCourseInputSchema,
  async execute(args) {
    const c = loadCourses().courses.find((c) => c.slug === args.slug);
    if (!c) throw new Error(`unknown course: ${args.slug}`);
    return c;
  },
};
