import { describe, it, expect } from "vitest";
import { mergeCourses } from "../merge.js";

describe("mergeCourses", () => {
  it("joins public (slug, title, diplomaUrl) with private (completedAt, hours) by slug", () => {
    const pub = [{ slug: "x", title: "X", diplomaUrl: "https://platzi.com/p/u/curso/x/diploma/detalle/" }];
    const priv = [{ slug: "x", completedAt: "2024-08-15T00:00:00.000Z", hours: 8 }];
    const result = mergeCourses(pub, priv);
    expect(result[0]).toMatchObject({
      slug: "x",
      title: "X",
      completedAt: "2024-08-15T00:00:00.000Z",
      hours: 8,
    });
  });

  it("keeps public-only courses (date missing → null)", () => {
    const result = mergeCourses(
      [{ slug: "y", title: "Y", diplomaUrl: "https://x.com/y/" }],
      [],
    );
    expect(result[0]?.completedAt).toBeNull();
    expect(result[0]?.hours).toBeNull();
  });

  it("dedupes by slug", () => {
    const result = mergeCourses(
      [
        { slug: "z", title: "Z", diplomaUrl: "https://x.com/z/" },
        { slug: "z", title: "Z2", diplomaUrl: "https://x.com/z/" },
      ],
      [],
    );
    expect(result).toHaveLength(1);
  });

  it("applies fallbackSkills when provided", () => {
    const result = mergeCourses(
      [{ slug: "ts", title: "TS", diplomaUrl: "https://x.com/ts/" }],
      [],
      { ts: ["typescript", "javascript"] },
    );
    expect(result[0]?.skills).toEqual(["typescript", "javascript"]);
  });
});
