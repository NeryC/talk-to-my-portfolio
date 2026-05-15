import { describe, it, expect } from "vitest";
import { getSkillsTool, getSkillsInputSchema } from "../get-skills.js";

type GetSkillsResult = {
  skills: Array<{ skill: string; level: string; category: string }>;
};

describe("getSkills tool", () => {
  it("returns all skills with no args", async () => {
    const r = (await getSkillsTool.execute({})) as GetSkillsResult;
    expect(r.skills.length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    const r = (await getSkillsTool.execute({ category: "language" })) as GetSkillsResult;
    expect(r.skills.length).toBeGreaterThan(0);
    expect(r.skills.every((s) => s.category === "language")).toBe(true);
  });

  it("rejects unknown category at the schema layer", () => {
    const result = getSkillsInputSchema.safeParse({ category: "nonsense" });
    expect(result.success).toBe(false);
  });
});
