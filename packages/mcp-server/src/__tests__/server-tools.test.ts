import { describe, it, expect } from "vitest";
import { buildServer } from "../server.js";
import { callListTools, callTool } from "./helpers.js";

describe("server tool handlers", () => {
  it("lists at least listProjects", async () => {
    const res = await callListTools(buildServer());
    const names = res.tools.map((t) => t.name);
    expect(names).toContain("listProjects");
  });

  it("calls listProjects via tools/call", async () => {
    const res = await callTool(buildServer(), "listProjects");
    expect(res.content[0]?.type).toBe("text");
    const parsed = JSON.parse(res.content[0]!.text);
    expect(parsed.projects).toHaveLength(3);
  });
});
