import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { extractCompletedCourseMeta } from "../scrape-learning-dashboard.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, "..", "__fixtures__", "learning-dashboard.html");
const html = readFileSync(fixturePath, "utf-8");

describe("extractCompletedCourseMeta", () => {
  it("extracts slug, completedAt (ISO), and hours from the fixture", () => {
    const meta = extractCompletedCourseMeta(html);
    expect(meta.length).toBeGreaterThanOrEqual(5);
    const first = meta[0]!;
    expect(first.slug).toMatch(/^[a-z0-9-]+$/);
    expect(first.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(first.hours).toBeGreaterThan(0);
  });

  it("returns null for unparseable dates", () => {
    const broken = html.replace('datetime="2023-04-12T00:00:00.000Z"', 'datetime="not-a-date"');
    const meta = extractCompletedCourseMeta(broken);
    const ts = meta.find((m) => m.slug === "curso-de-typescript")!;
    expect(ts.completedAt).toBeNull();
  });
});
