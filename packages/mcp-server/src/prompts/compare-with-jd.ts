import { z } from "zod";
import {
  loadProjects,
  loadCourses,
  loadExperience,
} from "@neryc/portfolio-shared";
import { withTimeoutAndRetry } from "./_helpers.js";
import type { SamplingBridge, ElicitationBridge } from "./_helpers.js";

const argsSchema = z.object({
  jobDescription: z.string().min(1),
});

export interface RunOptions {
  samplingBridge?: SamplingBridge | null;
  clientSupportsSampling?: boolean;
  samplingTimeoutMs?: number;
  elicitationBridge?: ElicitationBridge | null;
  clientSupportsElicitation?: boolean;
}

const DEFAULT_TIMEOUT_MS = 30_000;
export const MAX_JD_CHARS = 5000;
const MIN_JD_CHARS = 50;

function truncateJd(jd: string): string {
  if (jd.length <= MAX_JD_CHARS) return jd;
  return jd.slice(0, MAX_JD_CHARS) + "...[truncated]";
}

export async function runCompareWithJd(args: unknown, opts: RunOptions = {}) {
  let parsed = argsSchema.parse(args);

  // Short JD: try elicitation if the client supports it; otherwise return a
  // clear structured error so the LLM can ask the user for a fuller JD.
  if (parsed.jobDescription.trim().length < MIN_JD_CHARS) {
    if (opts.clientSupportsElicitation && opts.elicitationBridge) {
      const r = await opts.elicitationBridge({
        message:
          "The JD you pasted is very short. Could you paste the full role description (responsibilities, requirements, nice-to-haves)?",
        requestedSchema: {
          type: "object",
          properties: {
            jobDescription: { type: "string", minLength: MIN_JD_CHARS },
          },
          required: ["jobDescription"],
        },
      });
      if (r.action !== "accept" || typeof r.content?.jobDescription !== "string") {
        return {
          description: "compare-with-jd (elicitation cancelled)",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Elicitation was cancelled — please paste the full job description to compare against the portfolio.",
              },
            },
          ],
        };
      }
      parsed = { jobDescription: r.content.jobDescription };
    } else {
      return {
        description: "compare-with-jd (no elicitation support)",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Please paste the full job description (at least 50 characters) so I can compare it against the portfolio.",
            },
          },
        ],
      };
    }
  }

  const jd = parsed.jobDescription;
  const truncatedJd = truncateJd(jd);

  const samplingPrompt = `Compare the JD below against Nery's portfolio. For each major requirement output a match score (strong / partial / none) and cite his evidence (projects/courses/experience). Conclude with a 2-line gap analysis.

JD:
${truncatedJd}`;

  const supportsSampling = opts.clientSupportsSampling ?? !!opts.samplingBridge;

  if (supportsSampling && opts.samplingBridge) {
    const bridge = opts.samplingBridge;
    const text = await withTimeoutAndRetry(
      () =>
        bridge({
          messages: [
            { role: "user", content: { type: "text", text: samplingPrompt } },
          ],
          maxTokens: 600,
        }),
      {
        timeoutMs: opts.samplingTimeoutMs ?? DEFAULT_TIMEOUT_MS,
        retries: 1,
      },
    );
    if (text) {
      return {
        description: "JD comparison (sampling)",
        messages: [{ role: "user", content: { type: "text", text } }],
      };
    }
  }

  // Fallback: deterministic keyword-scan comparison.
  const projects = loadProjects();
  const courses = loadCourses().courses;
  const experience = loadExperience();

  const projectTags = Array.from(
    new Set(projects.flatMap((p) => [...p.tags, ...p.stack])),
  );
  const courseSkills = Array.from(new Set(courses.flatMap((c) => c.skills)));
  const experienceStack = Array.from(
    new Set(experience.flatMap((e) => e.stack)),
  );

  const jdPreview = jd.slice(0, 200) + (jd.length > 200 ? "..." : "");
  const jdLower = jd.toLowerCase();
  const matchedFromPortfolio = [
    ...projectTags,
    ...courseSkills,
    ...experienceStack,
  ].filter((term) => jdLower.includes(term.toLowerCase()));
  const uniqueMatched = Array.from(new Set(matchedFromPortfolio));

  const fallbackText = `Without LLM enrichment, here's a literal keyword scan:

Nery's portfolio touches:
- Project tags/stack: ${projectTags.join(", ")}
- Course skills: ${courseSkills.join(", ")}
- Experience stack: ${experienceStack.join(", ")}

JD requires (first 200 chars):
${jdPreview}

Literal matches found in JD: ${
    uniqueMatched.length > 0 ? uniqueMatched.join(", ") : "(none)"
  }`;

  return {
    description: "JD comparison (fallback, no sampling)",
    messages: [
      {
        role: "user",
        content: { type: "text", text: fallbackText },
      },
    ],
  };
}
