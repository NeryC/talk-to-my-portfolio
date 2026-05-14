import { describe, it, expect } from "vitest";
import { CvSchema } from "../cv.js";

describe("CvSchema", () => {
  it("accepts a valid CV metadata", () => {
    expect(() =>
      CvSchema.parse({
        name: "Nery Alberto Cano",
        tagline: "Senior Full-Stack Engineer",
        location: "Asunción, Paraguay",
        remote: true,
        salaryFromUsd: 3500,
        yearsOfExperience: 7,
        contact: {
          email: "x@example.com",
          linkedin: "https://linkedin.com/in/x",
          github: "https://github.com/x",
          portfolio: "https://x.example.com",
        },
      })
    ).not.toThrow();
  });

  it("rejects negative salary", () => {
    expect(() =>
      CvSchema.parse({
        name: "X", tagline: "X", location: "X", remote: true,
        salaryFromUsd: -100, yearsOfExperience: 1,
        contact: { email: "x@x.com", linkedin: "https://x.com", github: "https://x.com", portfolio: "https://x.com" },
      })
    ).toThrow();
  });

  it("rejects malformed email", () => {
    expect(() =>
      CvSchema.parse({
        name: "X", tagline: "X", location: "X", remote: true,
        salaryFromUsd: 1000, yearsOfExperience: 1,
        contact: { email: "not-an-email", linkedin: "https://x.com", github: "https://x.com", portfolio: "https://x.com" },
      })
    ).toThrow();
  });
});
