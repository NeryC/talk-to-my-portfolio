import { describe, it, expect } from "vitest";
import { listProjectsTool } from "../list-projects.js";

type ListProjectsResult = {
  projects: { slug: string; tags: string[] }[];
};

describe("listProjects tool", () => {
  it("returns all 3 projects when called with no args", async () => {
    const result = (await listProjectsTool.execute({})) as ListProjectsResult;
    expect(result.projects).toHaveLength(3);
    expect(result.projects.map((p) => p.slug).sort()).toEqual([
      "multi-agent-code-reviewer",
      "rag-agent-memory",
      "research-agent",
    ]);
  });

  it("filters by tags", async () => {
    const result = (await listProjectsTool.execute({ tags: ["rag"] })) as ListProjectsResult;
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]?.slug).toBe("rag-agent-memory");
  });

  it("returns empty array when no project matches the tag", async () => {
    const result = (await listProjectsTool.execute({
      tags: ["nothing-matches"],
    })) as ListProjectsResult;
    expect(result.projects).toEqual([]);
  });

  it("exposes a description starting with an imperative verb", () => {
    expect(listProjectsTool.description).toMatch(/^(List|Get|Return)/);
  });
});
