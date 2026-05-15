import { z } from "zod";
import { loadProjects } from "@neryc/portfolio-shared";

export interface PromptMeta {
  name: string;
  description: string;
  arguments: { name: string; description: string; required: boolean }[];
}

const promptsMeta: PromptMeta[] = [
  {
    name: "pitch-for-role",
    description:
      "Generate a tailored pitch for a specific role, citing Nery's projects and courses.",
    arguments: [
      { name: "roleDescription", description: "The role being pitched for", required: true },
      { name: "companyName", description: "Company name (optional)", required: false },
      { name: "stack", description: "Comma-separated tech stack (optional)", required: false },
    ],
  },
  {
    name: "compare-with-jd",
    description:
      "Compare a pasted job description against Nery's portfolio. Returns match score per requirement + gap analysis.",
    arguments: [
      { name: "jobDescription", description: "The full JD text", required: true },
    ],
  },
  {
    name: "tech-deep-dive",
    description:
      "Show Nery's experience with a specific technology across projects, courses, and employers.",
    arguments: [
      { name: "tech", description: "Technology to deep-dive on", required: true },
    ],
  },
];

export async function listPrompts() {
  return { prompts: promptsMeta };
}

const argsSchemas = {
  "pitch-for-role": z.object({
    roleDescription: z.string().min(1),
    companyName: z.string().optional(),
    stack: z.string().optional(),
  }),
  "compare-with-jd": z.object({ jobDescription: z.string().min(1) }),
  "tech-deep-dive": z.object({ tech: z.string().min(1) }),
};

export async function getPrompt({
  name,
  arguments: args,
}: {
  name: string;
  arguments: Record<string, unknown>;
}) {
  if (name === "pitch-for-role") {
    const parsed = argsSchemas["pitch-for-role"].parse(args);
    const projects = loadProjects()
      .map((p) => `- ${p.slug}: ${p.tagline}`)
      .join("\n");
    return {
      description: "Tailored pitch",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are pitching Nery Cano (Senior Full-Stack Engineer, 7+ yrs) for the following role:

ROLE: ${parsed.roleDescription}
${parsed.companyName ? `COMPANY: ${parsed.companyName}` : ""}
${parsed.stack ? `STACK: ${parsed.stack}` : ""}

His relevant projects:
${projects}

Write a 180-word pitch citing concrete projects (by slug). Close with a CTA to call \`bookCall\`.`,
          },
        },
      ],
    };
  }
  if (name === "compare-with-jd") {
    const parsed = argsSchemas["compare-with-jd"].parse(args);
    return {
      description: "JD comparison",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compare the JD below against Nery's portfolio. For each major requirement output a match score (strong / partial / none) and cite his evidence (projects/courses/experience). Conclude with a 2-line gap analysis.

JD:
${parsed.jobDescription}`,
          },
        },
      ],
    };
  }
  if (name === "tech-deep-dive") {
    const parsed = argsSchemas["tech-deep-dive"].parse(args);
    return {
      description: "Tech deep dive",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Show Nery's experience with ${parsed.tech}: which projects used it (with slug), which Platzi courses cover it (with diploma URL), and at which employers he applied it. Cite everything precisely.`,
          },
        },
      ],
    };
  }
  throw new Error(`unknown prompt: ${name}`);
}
