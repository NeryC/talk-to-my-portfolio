import { describe, it, expect, vi } from "vitest";
import { discoverToolsFromServers, type DiscoveredTool } from "../lib/mcp-client";

describe("discoverToolsFromServers", () => {
  it("merges tools from multiple servers, tagging each with its source", async () => {
    const mockClient = (name: string, tools: string[]) => ({
      connect: vi.fn(async () => {}),
      listTools: vi.fn(async () => ({ tools: tools.map((t) => ({ name: t, description: `${t} desc`, inputSchema: {} })) })),
      callTool: vi.fn(async () => ({ content: [] })),
      close: vi.fn(),
    });
    const a = mockClient("portfolio", ["listProjects", "getProject"]);
    const b = mockClient("github", ["get_repository"]);
    const result: DiscoveredTool[] = await discoverToolsFromServers([
      { name: "portfolio", client: a as never },
      { name: "github", client: b as never },
    ]);
    expect(result).toHaveLength(3);
    expect(result.find((t) => t.name === "listProjects")?.sourceServer).toBe("portfolio");
    expect(result.find((t) => t.name === "get_repository")?.sourceServer).toBe("github");
  });
});
