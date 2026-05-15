import { describe, it, expect } from "vitest";
import { buildServer } from "../server.js";

describe("buildServer", () => {
  it("constructs a server with name 'portfolio-mcp' and version from package.json", () => {
    const server = buildServer();
    expect(server.serverInfo.name).toBe("portfolio-mcp");
    expect(server.serverInfo.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("declares tools, resources, prompts capabilities", () => {
    const server = buildServer();
    expect(server.capabilities).toMatchObject({
      tools: expect.any(Object),
      resources: expect.any(Object),
      prompts: expect.any(Object),
    });
  });
});
