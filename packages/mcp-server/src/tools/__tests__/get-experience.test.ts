import { describe, it, expect } from "vitest";
import { getExperienceTool } from "../get-experience.js";

type GetExperienceResult = {
  experience: Array<{ companyKey: string; role: string; metrics: string[]; stack: string[] }>;
};

describe("getExperience tool", () => {
  it("returns all experience entries with companyKey, role, metrics, stack", async () => {
    const r = (await getExperienceTool.execute({})) as GetExperienceResult;
    expect(r.experience.length).toBeGreaterThan(0);
    for (const e of r.experience) {
      expect(e.companyKey).toBeTruthy();
      expect(e.role).toBeTruthy();
      expect(Array.isArray(e.metrics)).toBe(true);
      expect(e.metrics.length).toBeGreaterThan(0);
      expect(Array.isArray(e.stack)).toBe(true);
      expect(e.stack.length).toBeGreaterThan(0);
    }
  });
});
