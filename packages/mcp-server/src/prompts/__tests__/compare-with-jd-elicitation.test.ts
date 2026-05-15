import { describe, it, expect } from "vitest";
import { runCompareWithJd } from "../compare-with-jd.js";
import { MockMcpClient } from "../../../test/harness/mock-mcp-client.js";

describe("@critical compare-with-jd elicitation for short JDs", () => {
  it("emits elicitation when jobDescription is shorter than 50 chars and client supports it", async () => {
    const client = new MockMcpClient({
      capabilities: { elicitation: {}, sampling: {} },
    });
    client.onElicitation(async () => ({
      action: "accept",
      content: { jobDescription: "x".repeat(200) },
    }));
    client.onSampling(async () => ({
      content: { type: "text", text: "OK" },
    }));
    const result = await runCompareWithJd(
      { jobDescription: "too short" },
      {
        elicitationBridge: (r) => client.simulateElicitation(r),
        samplingBridge: (r) => client.simulateSampling(r),
        clientSupportsElicitation: true,
        clientSupportsSampling: true,
      },
    );
    expect(result.messages[0]?.content?.text).toBeTruthy();
    expect(
      client.getRecordedRequests().filter((r) => r.kind === "elicitation"),
    ).toHaveLength(1);
  });

  it("when client cancels elicitation, returns a clear error message without crashing", async () => {
    const client = new MockMcpClient({ capabilities: { elicitation: {} } });
    client.onElicitation(async () => ({ action: "cancel" }));
    const result = await runCompareWithJd(
      { jobDescription: "too short" },
      {
        elicitationBridge: (r) => client.simulateElicitation(r),
        clientSupportsElicitation: true,
        clientSupportsSampling: false,
      },
    );
    expect(result.messages[0]?.content?.text).toMatch(/job description/i);
    expect(result.messages[0]?.content?.text).toMatch(
      /cancel|need a fuller|provide/i,
    );
  });

  it("when client does NOT support elicitation, returns structured error to LLM", async () => {
    const result = await runCompareWithJd(
      { jobDescription: "too short" },
      { clientSupportsElicitation: false, clientSupportsSampling: false },
    );
    expect(result.messages[0]?.content?.text).toMatch(
      /please paste the full job description/i,
    );
  });
});
