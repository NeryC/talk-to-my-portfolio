import { describe, it, expect } from "vitest";
import { listResources, readResource } from "../index.js";

describe("MCP resources", () => {
  it("listResources returns 4 URI schemes seeded with concrete instances", async () => {
    const list = await listResources();
    const uris = list.resources.map((r) => r.uri);
    expect(uris).toContain("portfolio://cv/full");
    expect(uris).toContain("portfolio://projects/research-agent/readme");
    expect(uris).toContain("portfolio://projects/research-agent/case-study");
    expect(uris).toContain("portfolio://courses/curso-de-typescript/certificate");
  });

  it("readResource returns markdown for cv://full", async () => {
    const r = await readResource("portfolio://cv/full");
    expect(r.mimeType).toBe("text/markdown");
    expect(r.text).toContain("Nery");
  });

  it("readResource returns markdown for project case-study", async () => {
    const r = await readResource("portfolio://projects/research-agent/case-study");
    expect(r.mimeType).toBe("text/markdown");
    expect(r.text).toContain("Research Agent");
  });

  it("readResource returns JSON for course certificate", async () => {
    const r = await readResource("portfolio://courses/curso-de-typescript/certificate");
    expect(r.mimeType).toBe("application/json");
    const parsed = JSON.parse(r.text);
    expect(parsed.diplomaUrl).toContain("platzi.com");
  });

  it("readResource throws on unknown URI", async () => {
    await expect(readResource("portfolio://nope/x")).rejects.toThrow();
  });
});
