import { describe, it, expect } from "vitest";
import { getProjectTool } from "../get-project.js";

type GetProjectResult = {
  slug: string;
  stack: string[];
  caseStudyUri: string;
  readmeUri: string;
};

describe("getProject tool", () => {
  it("returns full detail for an existing slug", async () => {
    const r = (await getProjectTool.execute({ slug: "research-agent" })) as GetProjectResult;
    expect(r.slug).toBe("research-agent");
    expect(r.stack.length).toBeGreaterThan(0);
    expect(r.caseStudyUri).toBe("portfolio://projects/research-agent/case-study");
    expect(r.readmeUri).toBe("portfolio://projects/research-agent/readme");
  });

  it("throws when slug is unknown", async () => {
    await expect(getProjectTool.execute({ slug: "ghost-project" })).rejects.toThrow(/unknown/i);
  });

  it("rejects malformed slugs", async () => {
    await expect(getProjectTool.execute({ slug: "../etc/passwd" } as any)).rejects.toThrow();
  });
});
