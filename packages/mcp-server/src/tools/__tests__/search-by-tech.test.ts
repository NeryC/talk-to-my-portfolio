import { describe, it, expect } from "vitest";
import { searchByTechTool } from "../search-by-tech.js";

type SearchByTechResult = {
  projects: Array<{ slug: string; title: string; tagline: string }>;
  courses: Array<{
    slug: string;
    title: string;
    diplomaUrl: string;
    completedAt: string | null;
  }>;
  experience: Array<{ companyKey: string; role: string; period: string }>;
};

describe("searchByTech tool", () => {
  // NOTE on seed-data deviation from the original plan:
  // The plan asserted `projects.length > 0` for tech="react", but none of the
  // 3 seed projects have "react" anywhere in tags/title/stack (they use
  // "Next.js 16" / "AI" / "RAG" etc.). The plan also asserted exactly 3
  // projects match "TypeScript", but `rag-agent-memory` lacks "TypeScript"
  // in its stack. Assertions below reflect the current seed data. When real
  // data lands in Phase 5/6, these counts should be revisited.
  it("returns courses + experience matching a tech (case-insensitive)", async () => {
    const r = (await searchByTechTool.execute({ tech: "react" })) as SearchByTechResult;
    expect(r.courses.length).toBeGreaterThan(0);
    expect(r.experience.length).toBeGreaterThan(0);
  });

  it("returns empty arrays when nothing matches", async () => {
    const r = (await searchByTechTool.execute({ tech: "cobol" })) as SearchByTechResult;
    expect(r.projects).toEqual([]);
    expect(r.courses).toEqual([]);
    expect(r.experience).toEqual([]);
  });

  it("matches across tags, skills, and stack fields", async () => {
    const r = (await searchByTechTool.execute({ tech: "TypeScript" })) as SearchByTechResult;
    // 2 of 3 seed projects have "TypeScript" in stack (rag-agent-memory does not).
    expect(r.projects.length).toBe(2);
    // case-insensitive: courses use lowercase "typescript" in skills.
    expect(r.courses.some((c) => c.slug === "curso-de-typescript")).toBe(true);
  });
});
