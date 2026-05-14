import { describe, it, expect } from "vitest";
import { CourseSchema, CourseFileSchema } from "../course.js";

describe("CourseSchema", () => {
  it("accepts a fully-populated course", () => {
    expect(() =>
      CourseSchema.parse({
        slug: "k8s-fundamentals",
        title: "Curso de Kubernetes",
        completedAt: "2024-08-15T00:00:00.000Z",
        hours: 8,
        skills: ["kubernetes", "docker"],
        diplomaUrl: "https://platzi.com/p/neryc/curso/k8s/diploma/detalle/",
      })
    ).not.toThrow();
  });

  it("accepts null hours and completedAt", () => {
    expect(() =>
      CourseSchema.parse({
        slug: "x", title: "x", completedAt: null, hours: null,
        skills: [], diplomaUrl: "https://platzi.com/p/u/curso/x/diploma/detalle/",
      })
    ).not.toThrow();
  });

  it("rejects malformed slug", () => {
    expect(() =>
      CourseSchema.parse({
        slug: "../../etc/passwd", title: "x", completedAt: null, hours: null,
        skills: [], diplomaUrl: "https://platzi.com/p/u/curso/x/diploma/detalle/",
      })
    ).toThrow();
  });
});

describe("CourseFileSchema", () => {
  it("wraps an array of courses with metadata", () => {
    expect(() =>
      CourseFileSchema.parse({
        syncedAt: "2026-05-14T00:00:00.000Z",
        source: "platzi-html-scrape-v1",
        courses: [],
      })
    ).not.toThrow();
  });
});
