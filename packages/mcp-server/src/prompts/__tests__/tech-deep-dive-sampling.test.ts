import { describe, it, expect } from "vitest";
import { runTechDeepDive } from "../tech-deep-dive.js";
import {
  MockMcpClient,
  type SamplingRequest,
} from "../../../test/harness/mock-mcp-client.js";

describe("@critical tech-deep-dive with sampling", () => {
  it("calls sampling with a constructed prompt containing tech + evidence, returns enriched text", async () => {
    const client = new MockMcpClient({ capabilities: { sampling: {} } });
    client.onSampling(async () => ({
      content: {
        type: "text",
        text: "Deep dive on TypeScript across research-agent and others.",
      },
    }));
    const result = await runTechDeepDive(
      { tech: "TypeScript" },
      { samplingBridge: (req) => client.simulateSampling(req) },
    );
    expect(result.messages[0]?.content?.text).toContain(
      "Deep dive on TypeScript across",
    );
    const recorded = client.getRecordedRequests();
    expect(recorded[0]?.payload).toMatchObject({
      maxTokens: expect.any(Number),
    });
    const samplingPayload = recorded[0]?.payload as SamplingRequest;
    expect(samplingPayload.messages[0]?.content.text).toContain("TypeScript");
    expect(samplingPayload.messages[0]?.content.text).toContain(
      "research-agent",
    );
  });

  it("falls back to deterministic listing when client does NOT support sampling", async () => {
    const result = await runTechDeepDive(
      { tech: "TypeScript" },
      { samplingBridge: null, clientSupportsSampling: false },
    );
    const text = result.messages[0]?.content?.text;
    expect(text).toBeTruthy();
    expect(text).toContain("research-agent");
  });

  it("retries once on empty sampling response, then falls back", async () => {
    const client = new MockMcpClient({ capabilities: { sampling: {} } });
    let calls = 0;
    client.onSampling(async () => {
      calls++;
      return { content: { type: "text", text: "" } };
    });
    const result = await runTechDeepDive(
      { tech: "TypeScript" },
      { samplingBridge: (req) => client.simulateSampling(req) },
    );
    expect(calls).toBe(2);
    expect(result.messages[0]?.content?.text).toContain("research-agent");
  });

  it("times out and falls back", async () => {
    const result = await runTechDeepDive(
      { tech: "TypeScript" },
      {
        samplingBridge: () => new Promise(() => {}),
        samplingTimeoutMs: 100,
      },
    );
    expect(result.messages[0]?.content?.text).toBeTruthy();
  });
});
