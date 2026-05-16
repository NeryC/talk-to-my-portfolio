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
  it("returns projects + courses + experience matching a tech (case-insensitive)", async () => {
    const r = (await searchByTechTool.execute({ tech: "react" })) as SearchByTechResult;
    expect(r.projects.length).toBeGreaterThan(0);
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
    expect(r.projects.length).toBe(3);
    expect(r.courses.some((c) => c.slug === "curso-de-typescript")).toBe(true);
  });
});
