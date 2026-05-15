import { describe, it, expect } from "vitest";
import { buildServer } from "../server.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

describe("server tool handlers", () => {
  it("lists at least listProjects", async () => {
    const { server } = buildServer();
    const handler = (server as any)._requestHandlers.get(
      ListToolsRequestSchema.shape.method.value
    );
    const res = await handler({ method: "tools/list" }, {});
    const names = res.tools.map((t: { name: string }) => t.name);
    expect(names).toContain("listProjects");
  });

  it("calls listProjects via tools/call", async () => {
    const { server } = buildServer();
    const handler = (server as any)._requestHandlers.get(
      CallToolRequestSchema.shape.method.value
    );
    const res = await handler(
      { method: "tools/call", params: { name: "listProjects", arguments: {} } },
      {}
    );
    expect(res.content[0].type).toBe("text");
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.projects).toHaveLength(3);
  });
});
