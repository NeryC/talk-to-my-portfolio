import { describe, it, expect } from "vitest";
import { getCourseTool } from "../get-course.js";

type GetCourseResult = { slug: string; title: string; diplomaUrl: string };

describe("getCourse tool", () => {
  it("returns full detail for a known slug", async () => {
    const r = (await getCourseTool.execute({ slug: "curso-de-python-para-ciencia-de-datos" })) as GetCourseResult;
    expect(r.slug).toBe("curso-de-python-para-ciencia-de-datos");
    expect(r.title).toBe("Curso de Python para Ciencia de Datos");
    expect(r.diplomaUrl).toBeTruthy();
  });

  it("throws on unknown slug", async () => {
    await expect(getCourseTool.execute({ slug: "ghost-course" })).rejects.toThrow(/unknown/i);
  });

  it("rejects malformed slug via execute path (defense-in-depth)", async () => {
    await expect(getCourseTool.execute({ slug: "../etc/passwd" } as any)).rejects.toThrow();
  });
});
