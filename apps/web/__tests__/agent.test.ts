import { describe, it, expect, vi } from "vitest";
import { buildAgent } from "../lib/agent";
import type { DiscoveredTool } from "../lib/mcp-client";

// Mock the AI SDK modules so we don't try to make real API calls.
vi.mock("ai", () => ({
  ToolLoopAgent: vi.fn(function (this: object, opts: Record<string, unknown>) {
    Object.assign(this, opts);
  }),
  stepCountIs: vi.fn((n: number) => ({ kind: "stepCount", value: n })),
  tool: vi.fn((opts: Record<string, unknown>) => ({ kind: "tool", ...opts })),
  jsonSchema: vi.fn((schema: unknown) => ({ kind: "jsonSchema", schema })),
}));

vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: vi.fn((modelId: string) => ({ kind: "model", modelId })),
}));

describe("buildAgent", () => {
  it("builds an agent with the discovered tools and the Nery Cano system prompt", () => {
    const fakeTools: DiscoveredTool[] = [
      {
        name: "listProjects",
        description: "List Nery's projects",
        inputSchema: { type: "object" },
        sourceServer: "portfolio",
        invoke: async () => ({ content: [{ type: "text", text: "{\"projects\":[]}" }] }),
      },
    ];
    const agent = buildAgent(fakeTools) as unknown as { instructions: string; tools: Record<string, unknown>; stopWhen: unknown };
    expect(agent.instructions).toContain("Nery Cano");
    expect(Object.keys(agent.tools)).toContain("listProjects");
    expect(agent.stopWhen).toMatchObject({ kind: "stepCount", value: 10 });
  });
});
