import { z } from "zod";
import { loadProjects } from "@neryc/portfolio-shared";

const argsSchema = z.object({
  roleDescription: z.string().min(1),
  companyName: z.string().optional(),
  stack: z.string().optional(),
});

export interface SamplingBridge {
  (req: {
    messages: { role: "user"; content: { type: "text"; text: string } }[];
    maxTokens: number;
  }): Promise<{ content: { type: "text"; text: string } }>;
}

export interface RunOptions {
  samplingBridge?: SamplingBridge | null;
  clientSupportsSampling?: boolean;
  samplingTimeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

export async function runPitchForRole(args: unknown, opts: RunOptions = {}) {
  const parsed = argsSchema.parse(args);
  const projects = loadProjects();
  const projectList = projects.map((p) => `- ${p.slug}: ${p.tagline}`).join("\n");

  const samplingPrompt = `You are pitching Nery Cano (Senior Full-Stack Engineer, 7+ yrs) for the following role:

ROLE: ${parsed.roleDescription}
${parsed.companyName ? `COMPANY: ${parsed.companyName}` : ""}
${parsed.stack ? `STACK: ${parsed.stack}` : ""}

Relevant projects:
${projectList}

Write a 180-word pitch citing concrete projects by slug. Close with a CTA to call \`bookCall\`.`;

  const supportsSampling = opts.clientSupportsSampling ?? !!opts.samplingBridge;

  if (supportsSampling && opts.samplingBridge) {
    const bridge = opts.samplingBridge;
    const text = await withTimeoutAndRetry(
      () =>
        bridge({
          messages: [
            { role: "user", content: { type: "text", text: samplingPrompt } },
          ],
          maxTokens: 300,
        }),
      {
        timeoutMs: opts.samplingTimeoutMs ?? DEFAULT_TIMEOUT_MS,
        retries: 1,
      }
    );
    if (text) {
      return {
        description: "Tailored pitch (sampling)",
        messages: [
          { role: "user", content: { type: "text", text } },
        ],
      };
    }
  }

  // Fallback: deterministic template
  return {
    description: "Tailored pitch (fallback, no sampling)",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Pitch for ${parsed.roleDescription}:

Nery Cano (7+ yrs) has shipped 3 AI-native projects directly relevant here:
${projectList}

He delivered AI features in production for a US healthcare platform (cut clinician documentation 60%). Available remote from Paraguay, from USD $3,500/mo.

Call \`bookCall\` to schedule a 30-minute intro.`,
        },
      },
    ],
  };
}

async function withTimeoutAndRetry(
  fn: () => Promise<{ content: { type: "text"; text: string } }>,
  opts: { timeoutMs: number; retries: number }
): Promise<string | null> {
  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error("timeout")), opts.timeoutMs)
        ),
      ]);
      const text = result.content.text.trim();
      if (text.length > 0) return text;
    } catch {
      /* fall through to retry or fallback */
    }
  }
  return null;
}
