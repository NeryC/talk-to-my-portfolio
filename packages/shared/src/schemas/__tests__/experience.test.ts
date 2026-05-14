import { describe, it, expect } from "vitest";
import { ExperienceSchema } from "../experience.js";

describe("ExperienceSchema", () => {
  it("accepts a valid experience entry", () => {
    expect(() =>
      ExperienceSchema.parse({
        companyKey: "healthcare-us",
        company: "Healthcare US (NDA)",
        role: "Senior Full-Stack Engineer",
        period: "2023 — present",
        location: "Remote",
        summary: "Built AI features.",
        metrics: ["Cut documentation 60%"],
        stack: ["Next.js", "TypeScript"],
      })
    ).not.toThrow();
  });

  it("rejects missing companyKey", () => {
    expect(() =>
      ExperienceSchema.parse({
        company: "X", role: "X", period: "X", location: "X", summary: "X", metrics: [], stack: [],
      })
    ).toThrow();
  });
});
