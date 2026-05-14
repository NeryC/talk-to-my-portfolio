import { describe, it, expect } from "vitest";
import { SkillSchema } from "../skill.js";

describe("SkillSchema", () => {
  it("accepts a valid skill with proof references", () => {
    expect(() =>
      SkillSchema.parse({
        skill: "TypeScript",
        level: "expert",
        category: "language",
        proof: { projects: ["research-agent"], courses: [], experience: ["healthcare-us"] },
      })
    ).not.toThrow();
  });

  it("rejects unknown level", () => {
    expect(() =>
      SkillSchema.parse({
        skill: "X", level: "novice", category: "language",
        proof: { projects: [], courses: [], experience: [] },
      })
    ).toThrow();
  });

  it("rejects unknown category", () => {
    expect(() =>
      SkillSchema.parse({
        skill: "X", level: "expert", category: "esoteric",
        proof: { projects: [], courses: [], experience: [] },
      })
    ).toThrow();
  });
});
