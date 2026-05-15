import { z } from "zod";
import { loadCourses } from "@neryc/portfolio-shared";
import type { Tool } from "./types.js";

export const searchCoursesInputSchema = z.object({
  topic: z.string().min(1),
});

export const searchCoursesTool: Tool<typeof searchCoursesInputSchema> = {
  name: "searchCourses",
  description:
    "Search Nery's completed Platzi courses for a topic. Returns title, completion date, and a publicly verifiable diploma URL. Use when the recruiter asks 'does he have formal training in X?'.",
  inputSchema: searchCoursesInputSchema,
  async execute(args) {
    const needle = args.topic.toLowerCase();
    const matches = (s: string) => s.toLowerCase().includes(needle);
    const file = loadCourses();
    const courses = file.courses.filter(
      (c) => c.skills.some(matches) || matches(c.title)
    );
    return { topic: args.topic, courses, syncedAt: file.syncedAt };
  },
};
