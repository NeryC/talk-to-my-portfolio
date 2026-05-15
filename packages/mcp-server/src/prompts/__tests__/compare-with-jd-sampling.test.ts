import { describe, it, expect } from "vitest";
import { runCompareWithJd } from "../compare-with-jd.js";
import {
  MockMcpClient,
  type SamplingRequest,
} from "../../../test/harness/mock-mcp-client.js";

// Long enough JD (>=50 chars) used across tests where we want sampling to fire.
const LONG_JD =
  "We are hiring a Senior LLM Engineer. Must have TypeScript, Next.js, AI SDK, and RAG experience. Strong systems thinking required.";

describe("@critical compare-with-jd with sampling", () => {
  it("calls sampling with a constructed prompt containing the JD, returns enriched text", async () => {
    const client = new MockMcpClient({ capabilities: { sampling: {} } });
    client.onSampling(async () => ({
      content: {
        type: "text",
        text: "JD comparison: strong match on AI",
      },
    }));
    const result = await runCompareWithJd(
      { jobDescription: LONG_JD },
      { samplingBridge: (req) => client.simulateSampling(req) },
    );
    expect(result.messages[0]?.content?.text).toContain(
      "JD comparison: strong match on AI",
    );
    const recorded = client.getRecordedRequests();
    expect(recorded[0]?.payload).toMatchObject({
      maxTokens: expect.any(Number),
    });
    const samplingPayload = recorded[0]?.payload as SamplingRequest;
    expect(samplingPayload.messages[0]?.content.text).toContain(
      "Senior LLM Engineer",
    );
  });

  it("falls back to deterministic comparison when client does NOT support sampling", async () => {
    const result = await runCompareWithJd(
      { jobDescription: LONG_JD },
      { samplingBridge: null, clientSupportsSampling: false },
    );
    expect(result.messages[0]?.content?.text).toBeTruthy();
  });

  it("retries once on empty sampling response, then falls back", async () => {
    const client = new MockMcpClient({ capabilities: { sampling: {} } });
    let calls = 0;
    client.onSampling(async () => {
      calls++;
      return { content: { type: "text", text: "" } };
    });
    const result = await runCompareWithJd(
      { jobDescription: LONG_JD },
      { samplingBridge: (req) => client.simulateSampling(req) },
    );
    expect(calls).toBe(2);
    expect(result.messages[0]?.content?.text).toBeTruthy();
  });

  it("times out and falls back", async () => {
    const result = await runCompareWithJd(
      { jobDescription: LONG_JD },
      {
        samplingBridge: () => new Promise(() => {}),
        samplingTimeoutMs: 100,
      },
    );
    expect(result.messages[0]?.content?.text).toBeTruthy();
  });

  it("truncates JD >5KB before sending to sampling", async () => {
    const client = new MockMcpClient({ capabilities: { sampling: {} } });
    client.onSampling(async () => ({
      content: { type: "text", text: "OK" },
    }));
    const result = await runCompareWithJd(
      { jobDescription: "x".repeat(6000) },
      { samplingBridge: (req) => client.simulateSampling(req) },
    );
    expect(result.messages[0]?.content?.text).toContain("OK");
    const recorded = client.getRecordedRequests();
    const samplingPayload = recorded[0]?.payload as SamplingRequest;
    const sentText = samplingPayload.messages[0]?.content.text as string;
    expect(sentText).toContain("...[truncated]");
    expect(sentText.length).toBeLessThan(5500);
  });

  it("does NOT call sampling when JD is too short (<50 chars)", async () => {
    const client = new MockMcpClient({ capabilities: { sampling: {} } });
    client.onSampling(async () => ({
      content: { type: "text", text: "should not be called" },
    }));
    const result = await runCompareWithJd(
      { jobDescription: "too short" },
      {
        samplingBridge: (req) => client.simulateSampling(req),
        clientSupportsSampling: true,
      },
    );
    expect(result.messages[0]?.content?.text).toBeTruthy();
    const samplingRequests = client
      .getRecordedRequests()
      .filter((r) => r.kind === "sampling");
    expect(samplingRequests).toHaveLength(0);
  });
});
