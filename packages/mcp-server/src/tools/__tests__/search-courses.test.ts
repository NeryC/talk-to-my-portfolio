import { describe, it, expect } from "vitest";
import { searchCoursesTool } from "../search-courses.js";

type SearchCoursesResult = {
  topic: string;
  syncedAt: string;
  courses: Array<{ slug: string; title: string; diplomaUrl: string; completedAt: string | null }>;
};

describe("searchCourses tool", () => {
  it("matches by skill or title (case-insensitive)", async () => {
    const r = (await searchCoursesTool.execute({ topic: "TypeScript" })) as SearchCoursesResult;
    expect(r.courses.length).toBeGreaterThanOrEqual(1);
  });

  it("returns empty result when no match", async () => {
    const r = (await searchCoursesTool.execute({ topic: "cobol" })) as SearchCoursesResult;
    expect(r.courses).toEqual([]);
  });

  it("every result has a diplomaUrl", async () => {
    const r = (await searchCoursesTool.execute({ topic: "react" })) as SearchCoursesResult;
    expect(r.courses.length).toBeGreaterThan(0);
    for (const c of r.courses) {
      expect(c.diplomaUrl).toMatch(/^https:\/\//);
    }
  });
});
