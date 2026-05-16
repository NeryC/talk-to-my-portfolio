import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { extractPublicCourses } from "../scrape-public-profile.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "..", "__fixtures__", "public-profile.html");
const html = readFileSync(fixturePath, "utf-8");

describe("extractPublicCourses", () => {
  it("extracts at least 5 courses from the fixture", () => {
    const courses = extractPublicCourses(html, "neryc");
    expect(courses.length).toBeGreaterThanOrEqual(5);
    const first = courses[0]!;
    expect(first.slug).toMatch(/^[a-z0-9-]+$/);
    expect(first.title.length).toBeGreaterThan(0);
    expect(first.diplomaUrl).toMatch(/^https:\/\/platzi\.com\/p\/neryc\/curso\/.+\/diploma\/detalle\/$/);
  });

  it("dedupes courses if the HTML repeats the same slug", () => {
    const doubled = html + `<a href="/p/neryc/curso/curso-de-typescript/diploma/detalle/" data-title="Curso de TypeScript"></a>`;
    const courses = extractPublicCourses(doubled, "neryc");
    const tsCount = courses.filter((c) => c.slug === "curso-de-typescript").length;
    expect(tsCount).toBe(1);
  });

  it("returns empty array for a different username", () => {
    const courses = extractPublicCourses(html, "different-user");
    expect(courses).toEqual([]);
  });
});
