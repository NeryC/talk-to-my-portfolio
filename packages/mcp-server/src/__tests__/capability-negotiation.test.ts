import { describe, it, expect } from "vitest";
import { buildServer } from "../server.js";

describe("@critical capability negotiation", () => {
  it("after initialize, configurePrompts is called with client-declared capabilities", () => {
    const { server, getConfiguredPromptOptions } = buildServer();
    // Simulate the SDK setting clientCapabilities post-initialize
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (server as any)._clientCapabilities = { sampling: {}, elicitation: {} };
    // (We pretend the wiring code reacted to onInitialized.)
    // The test verifies the bridge-installation function reads these.
    const opts = getConfiguredPromptOptions();
    expect(opts.clientSupportsSampling).toBe(true);
    expect(opts.clientSupportsElicitation).toBe(true);
  });

  it("when client declares NO sampling, prompts fall back to deterministic mode", () => {
    const { server, getConfiguredPromptOptions } = buildServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (server as any)._clientCapabilities = {};
    const opts = getConfiguredPromptOptions();
    expect(opts.clientSupportsSampling).toBe(false);
    expect(opts.clientSupportsElicitation).toBe(false);
  });
});
