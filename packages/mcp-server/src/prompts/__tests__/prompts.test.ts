import { describe, it, expect } from "vitest";
import { listPrompts, getPrompt } from "../index.js";

describe("MCP prompts", () => {
  it("listPrompts returns pitch-for-role, compare-with-jd, tech-deep-dive", async () => {
    const l = await listPrompts();
    expect(l.prompts.map((p) => p.name).sort()).toEqual([
      "compare-with-jd",
      "pitch-for-role",
      "tech-deep-dive",
    ]);
  });

  it("getPrompt pitch-for-role injects role description and lists relevant projects", async () => {
    const p = await getPrompt({
      name: "pitch-for-role",
      arguments: { roleDescription: "Senior LLM Engineer at Vercel" },
    });
    const messages = p.messages;
    expect(messages[0]?.content?.text).toContain("Senior LLM Engineer at Vercel");
    expect(messages[0]?.content?.text).toContain("research-agent");
  });

  it("getPrompt rejects unknown prompt names", async () => {
    await expect(getPrompt({ name: "ghost", arguments: {} })).rejects.toThrow();
  });
});
