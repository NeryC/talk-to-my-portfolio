import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { DiscoveredTool } from "./mcp-client";

const SYSTEM_PROMPT = `You are the assistant for Nery Cano's portfolio.

Nery is a Senior Full-Stack Engineer (7+ yrs) shipping AI-powered web apps with Next.js + Anthropic Claude. He cut clinician documentation 60% at a US healthcare platform. Remote from Paraguay. From USD $3,500/mo.

Rules:
- NEVER invent projects, courses, skills, or experience. Use the tools to ground every claim.
- Always cite evidence: project slug, course title + diploma URL, employer.
- If you don't have evidence, say so explicitly.
- Refuse politely if the user asks anything unrelated to Nery's portfolio.

When the user expresses interest, suggest calling \`bookCall\`. The server may elicit missing fields — let the UI handle that.`;

export function buildAgent(discovered: DiscoveredTool[]) {
  const aiTools = Object.fromEntries(
    discovered.map((t) => [
      t.name,
      tool({
        description: t.description,
        inputSchema: t.inputSchema as never,
        execute: async (args: Record<string, unknown>) => {
          const result = await t.invoke(args);
          const first = result.content[0];
          if (first?.type === "text") {
            try {
              return JSON.parse(first.text);
            } catch {
              return { text: first.text };
            }
          }
          return result;
        },
      }),
    ]),
  );

  return new ToolLoopAgent({
    model: anthropic("claude-sonnet-4-6"),
    instructions: SYSTEM_PROMPT,
    tools: aiTools,
    stopWhen: stepCountIs(10),
  });
}
