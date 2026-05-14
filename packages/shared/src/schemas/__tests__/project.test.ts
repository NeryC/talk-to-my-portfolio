import { describe, it, expect } from "vitest";
import { ProjectSummarySchema, ProjectDetailSchema } from "../project.js";

describe("ProjectSummarySchema", () => {
  it("requires slug, title, tags array, githubUrl, demoUrl, year, role", () => {
    const valid = {
      slug: "research-agent",
      title: "Research Agent",
      tagline: "Multi-step research with citations",
      tags: ["ai", "nextjs"],
      githubUrl: "https://github.com/NeryC/research-agent",
      demoUrl: "https://research-agent-three-pi.vercel.app",
      year: 2026,
      role: "Solo builder",
    };
    expect(() => ProjectSummarySchema.parse(valid)).not.toThrow();
  });

  it("rejects projects without a slug", () => {
    expect(() =>
      ProjectSummarySchema.parse({
        title: "x", tagline: "", tags: [], githubUrl: "https://x.com", demoUrl: "https://x.com", year: 2026, role: "",
      })
    ).toThrow();
  });

  it("rejects malformed URLs", () => {
    expect(() =>
      ProjectSummarySchema.parse({
        slug: "x", title: "x", tagline: "", tags: [], year: 2026, role: "",
        githubUrl: "not-a-url", demoUrl: "https://example.com",
      })
    ).toThrow();
  });
});

describe("ProjectDetailSchema", () => {
  it("extends summary with caseStudyUri, readmeUri, stack, highlights", () => {
    const valid = {
      slug: "research-agent",
      title: "Research Agent",
      tagline: "Multi-step research with citations",
      tags: ["ai", "nextjs"],
      githubUrl: "https://github.com/NeryC/research-agent",
      demoUrl: "https://research-agent-three-pi.vercel.app",
      year: 2026,
      role: "Solo builder",
      caseStudyUri: "portfolio://projects/research-agent/case-study",
      readmeUri: "portfolio://projects/research-agent/readme",
      stack: ["TypeScript"],
      highlights: ["streaming UI"],
    };
    expect(() => ProjectDetailSchema.parse(valid)).not.toThrow();
  });

  it("rejects malformed resource URIs", () => {
    expect(() =>
      ProjectDetailSchema.parse({
        slug: "x", title: "x", tagline: "", tags: [], githubUrl: "https://x.com", demoUrl: "https://x.com", year: 2026, role: "",
        caseStudyUri: "wrong://uri", readmeUri: "portfolio://projects/x/readme",
        stack: [], highlights: [],
      })
    ).toThrow();
  });
});
