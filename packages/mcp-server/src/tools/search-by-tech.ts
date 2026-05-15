import { z } from "zod";
import { loadProjects, loadCourses, loadExperience } from "@neryc/portfolio-shared";
import type { Tool } from "./types.js";
import { withTimeoutAndRetry } from "../prompts/_helpers.js";
import type { SamplingBridge } from "../bridges.js";
import { getBridgeState } from "../bridge-state.js";

export const searchByTechInputSchema = z.object({
  tech: z.string().min(1),
});

export interface RunOptions {
  samplingBridge?: SamplingBridge | null;
  clientSupportsSampling?: boolean;
  samplingTimeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const SAMPLING_THRESHOLD = 3;

export interface SearchByTechResult {
  tech: string;
  projects: { slug: string; title: string; tagline: string }[];
  courses: {
    slug: string;
    title: string;
    diplomaUrl: string;
    completedAt: string | null;
  }[];
  experience: { companyKey: string; role: string; period: string }[];
  summary?: string;
}

export async function runSearchByTech(
  args: unknown,
  opts: RunOptions = {},
): Promise<SearchByTechResult> {
  const parsed = searchByTechInputSchema.parse(args);
  const needle = parsed.tech.toLowerCase();
  const matches = (s: string) => s.toLowerCase().includes(needle);

  const projects = loadProjects().filter(
    (p) =>
      p.tags.some(matches) ||
      p.title.toLowerCase().includes(needle) ||
      p.stack.some(matches),
  );

  const courses = loadCourses().courses.filter(
    (c) => c.skills.some(matches) || c.title.toLowerCase().includes(needle),
  );

  const experience = loadExperience().filter(
    (e) => e.stack.some(matches) || e.summary.toLowerCase().includes(needle),
  );

  const projectsOut = projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
  }));
  const coursesOut = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    diplomaUrl: c.diplomaUrl,
    completedAt: c.completedAt,
  }));
  const experienceOut = experience.map((e) => ({
    companyKey: e.companyKey,
    role: e.role,
    period: e.period,
  }));

  const result: SearchByTechResult = {
    tech: parsed.tech,
    projects: projectsOut,
    courses: coursesOut,
    experience: experienceOut,
  };

  const totalMatches =
    projectsOut.length + coursesOut.length + experienceOut.length;
  const supportsSampling = opts.clientSupportsSampling ?? !!opts.samplingBridge;

  if (
    totalMatches >= SAMPLING_THRESHOLD &&
    supportsSampling &&
    opts.samplingBridge
  ) {
    const bridge = opts.samplingBridge;
    const samplingPrompt = `Summarize Nery's experience with ${parsed.tech} in 60 words or less. Cite project slugs, course slugs, and employer companyKeys precisely.

Projects: ${projectsOut.map((p) => p.slug).join(", ")}
Courses: ${coursesOut.map((c) => c.slug).join(", ")}
Experience: ${experienceOut.map((e) => e.companyKey).join(", ")}`;

    const text = await withTimeoutAndRetry(
      () =>
        bridge({
          messages: [
            { role: "user", content: { type: "text", text: samplingPrompt } },
          ],
          maxTokens: 200,
        }),
      {
        timeoutMs: opts.samplingTimeoutMs ?? DEFAULT_TIMEOUT_MS,
        retries: 1,
      },
    );
    if (text) {
      result.summary = text;
    }
  }

  return result;
}

export const searchByTechTool: Tool<typeof searchByTechInputSchema> = {
  name: "searchByTech",
  description:
    "Find Nery's evidence (projects + courses + jobs) for a given technology. Use when a recruiter asks 'do you know X?' or 'show me where you used X'. Match is case-insensitive across tags, skills, and stack.",
  inputSchema: searchByTechInputSchema,
  async execute(args) {
    const s = getBridgeState();
    return runSearchByTech(args, {
      samplingBridge: s.samplingBridge,
      clientSupportsSampling: s.clientSupportsSampling,
    });
  },
};
