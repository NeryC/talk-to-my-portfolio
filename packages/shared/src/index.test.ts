import { describe, it, expect } from "vitest";
import { VERSION } from "./index.js";

describe("shared package", () => {
  it("exports a VERSION string", () => {
    expect(typeof VERSION).toBe("string");
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
