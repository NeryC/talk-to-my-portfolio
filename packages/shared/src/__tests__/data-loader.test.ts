import { describe, it, expect } from "vitest";
import {
  loadProjects,
  loadProjectCaseStudy,
  loadExperience,
  loadSkills,
  loadCv,
  loadCvMarkdown,
} from "../data-loader.js";

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

describe("loadExperience", () => {
  it("loads validated experience entries with at least 1 entry", () => {
    const xp = loadExperience();
    expect(xp.length).toBeGreaterThanOrEqual(1);
    expect(xp[0]).toHaveProperty("companyKey");
    expect(xp[0]).toHaveProperty("metrics");
  });
});

describe("loadSkills", () => {
  it("loads validated skills, each with a proof object", () => {
    const skills = loadSkills();
    expect(skills.length).toBeGreaterThan(0);
    for (const s of skills) {
      expect(s.proof).toHaveProperty("projects");
      expect(s.proof).toHaveProperty("courses");
      expect(s.proof).toHaveProperty("experience");
    }
  });

  it("at least one skill references an actual project slug", () => {
    const skills = loadSkills();
    const validSlugs = ["research-agent", "multi-agent-code-reviewer", "rag-agent-memory"];
    const someSkillReferencesProject = skills.some((s) =>
      s.proof.projects.some((slug) => validSlugs.includes(slug))
    );
    expect(someSkillReferencesProject).toBe(true);
  });
});

describe("loadCv", () => {
  it("loads CV metadata with the user's name and remote=true", () => {
    const cv = loadCv();
    expect(cv.name).toContain("Nery");
    expect(cv.remote).toBe(true);
    expect(cv.contact.email).toContain("@");
  });
});

describe("loadCvMarkdown", () => {
  it("loads the CV markdown body (>=500 chars)", () => {
    const md = loadCvMarkdown();
    expect(md.length).toBeGreaterThan(500);
  });
});
