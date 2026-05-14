import { describe, it, expect } from "vitest";
import { loadProjects, loadProjectCaseStudy } from "../data-loader.js";

describe("loadProjects", () => {
  it("loads and validates the 3 seed projects", () => {
    const projects = loadProjects();
    expect(projects).toHaveLength(3);
    expect(projects.map((p) => p.slug).sort()).toEqual([
      "multi-agent-code-reviewer",
      "rag-agent-memory",
      "research-agent",
    ]);
  });

  it("each loaded project passes the extended schema (stack + highlights)", () => {
    const projects = loadProjects();
    for (const p of projects) {
      expect((p as any).stack.length).toBeGreaterThan(0);
      expect((p as any).highlights.length).toBeGreaterThan(0);
    }
  });
});

describe("loadProjectCaseStudy", () => {
  it("returns the markdown content for a known slug", () => {
    const md = loadProjectCaseStudy("research-agent");
    expect(md).toContain("# Research Agent");
    expect(md.length).toBeGreaterThan(200);
  });

  it("throws on unknown slug", () => {
    expect(() => loadProjectCaseStudy("does-not-exist")).toThrow(/unknown/i);
  });

  it("rejects invalid slug shapes (path traversal)", () => {
    expect(() => loadProjectCaseStudy("../../etc/passwd")).toThrow(/invalid/i);
  });
});
