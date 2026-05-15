import { runPitchForRole } from "./pitch-for-role.js";
import { runTechDeepDive } from "./tech-deep-dive.js";
import { runCompareWithJd } from "./compare-with-jd.js";
import type { SamplingBridge } from "./_helpers.js";

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
    return runCompareWithJd(args, {
      samplingBridge: _samplingBridge,
      clientSupportsSampling: _clientSupportsSampling,
    });
  }
  if (name === "tech-deep-dive") {
    return runTechDeepDive(args, {
      samplingBridge: _samplingBridge,
      clientSupportsSampling: _clientSupportsSampling,
    });
  }
  throw new Error(`unknown prompt: ${name}`);
}
