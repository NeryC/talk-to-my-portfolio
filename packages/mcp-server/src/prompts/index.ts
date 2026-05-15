import { z } from "zod";
import { runPitchForRole } from "./pitch-for-role.js";

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
  "compare-with-jd": z.object({ jobDescription: z.string().min(1) }),
  "tech-deep-dive": z.object({ tech: z.string().min(1) }),
};

type SamplingBridge = (req: {
  messages: { role: "user"; content: { type: "text"; text: string } }[];
  maxTokens: number;
}) => Promise<{ content: { type: "text"; text: string } }>;

let _samplingBridge: SamplingBridge | null = null;
let _clientSupportsSampling = false;

export function configurePrompts(opts: {
  samplingBridge: SamplingBridge | null;
  clientSupportsSampling: boolean;
}) {
  _samplingBridge = opts.samplingBridge;
  _clientSupportsSampling = opts.clientSupportsSampling;
}

export async function getPrompt({
  name,
  arguments: args,
}: {
  name: string;
  arguments: Record<string, unknown>;
}) {
  if (name === "pitch-for-role") {
    return runPitchForRole(args, {
      samplingBridge: _samplingBridge,
      clientSupportsSampling: _clientSupportsSampling,
    });
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
