import { describe, it, expect } from "vitest";

/**
 * Manual integration test for the Streamable HTTP MCP transport at /api/mcp.
 *
 * This is skipped by default because it requires:
 *   - A running Next.js dev server on http://localhost:3000
 *   - Environment variables (CAL_COM_API_KEY, RESEND_API_KEY, etc.) configured
 *     in apps/web/.env.local so buildServer's tool factories don't fail when
 *     instantiated lazily.
 *
 * To run:
 *   1. In one terminal: pnpm --filter web dev
 *   2. In another terminal:
 *      VITEST_MANUAL=1 pnpm --filter web exec vitest run mcp-http
 */
const MANUAL = process.env.VITEST_MANUAL === "1";

describe.skipIf(!MANUAL)("@manual HTTP MCP transport", () => {
  it("lists tools and calls listProjects via Streamable HTTP", async () => {
    const { Client } = await import(
      "@modelcontextprotocol/sdk/client/index.js"
    );
    const { StreamableHTTPClientTransport } = await import(
      "@modelcontextprotocol/sdk/client/streamableHttp.js"
    );
    const transport = new StreamableHTTPClientTransport(
      new URL("http://localhost:3000/api/mcp"),
    );
    const client = new Client(
      { name: "test", version: "0.0.0" },
      { capabilities: {} },
    );
    await client.connect(transport);
    const tools = await client.listTools();
    expect(tools.tools.map((t) => t.name)).toContain("listProjects");
    const r = await client.callTool({ name: "listProjects", arguments: {} });
    type ToolContent = { type: string; text: string };
    const text = (r.content as ToolContent[])[0]?.text ?? "";
    expect(JSON.parse(text).projects).toHaveLength(3);
    await client.close();
  }, 20_000);
});
