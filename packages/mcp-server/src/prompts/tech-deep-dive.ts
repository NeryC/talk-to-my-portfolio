import { z } from "zod";
import {
  loadProjects,
  loadCourses,
  loadExperience,
} from "@neryc/portfolio-shared";
import { withTimeoutAndRetry } from "./_helpers.js";
import type { SamplingBridge } from "../bridges.js";

const argsSchema = z.object({
  tech: z.string().min(1),
});

export interface RunOptions {
  samplingBridge?: SamplingBridge | null;
  clientSupportsSampling?: boolean;
  samplingTimeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function runTechDeepDive(args: unknown, opts: RunOptions = {}) {
  const parsed = argsSchema.parse(args);
  const tech = parsed.tech;
  const techLower = tech.toLowerCase();

  const projects = loadProjects();
  const matchingProjects = projects.filter(
    (p) =>
      p.stack.some((s) => includesCI(s, techLower)) ||
      p.tags.some((t) => includesCI(t, techLower)),
  );

  const courses = loadCourses().courses;
  const matchingCourses = courses.filter(
    (c) =>
      c.skills.some((s) => includesCI(s, techLower)) ||
      includesCI(c.title, techLower),
  );

  const experience = loadExperience();
  const matchingExperience = experience.filter(
    (e) =>
      e.stack.some((s) => includesCI(s, techLower)) ||
      includesCI(e.summary, techLower),
  );

  const projectsList =
    matchingProjects.length > 0
      ? matchingProjects.map((p) => `- ${p.slug}: ${p.tagline}`).join("\n")
      : "(none)";
  const coursesList =
    matchingCourses.length > 0
      ? matchingCourses
          .map((c) => `- ${c.title} (${c.diplomaUrl})`)
          .join("\n")
      : "(none)";
  const experienceList =
    matchingExperience.length > 0
      ? matchingExperience
          .map((e) => `- ${e.company} — ${e.role} (${e.period})`)
          .join("\n")
      : "(none)";

  const samplingPrompt = `Show Nery's experience with ${tech}:

Relevant projects:
${projectsList}

Relevant Platzi courses:
${coursesList}

Relevant experience:
${experienceList}

Write a precise summary (max 300 tokens) of where and how Nery has used ${tech}. Cite slugs, diploma URLs, and employers concretely.`;

  const supportsSampling = opts.clientSupportsSampling ?? !!opts.samplingBridge;

  if (supportsSampling && opts.samplingBridge) {
    const bridge = opts.samplingBridge;
    const text = await withTimeoutAndRetry(
      () =>
        bridge({
          messages: [
            { role: "user", content: { type: "text", text: samplingPrompt } },
          ],
          maxTokens: 400,
        }),
      {
        timeoutMs: opts.samplingTimeoutMs ?? DEFAULT_TIMEOUT_MS,
        retries: 1,
      },
    );
    if (text) {
      return {
        description: "Tech deep dive (sampling)",
        messages: [{ role: "user", content: { type: "text", text } }],
      };
    }
  }

  // Fallback: deterministic listing of filtered evidence.
  const fallbackText = `Nery's experience with ${tech}:

Projects:
${projectsList}

Platzi courses:
${coursesList}

Experience:
${experienceList}`;

  return {
    description: "Tech deep dive (fallback, no sampling)",
    messages: [
      {
        role: "user",
        content: { type: "text", text: fallbackText },
      },
    ],
  };
}
