import { describe, it, expect } from "vitest";
import { runPitchForRole } from "../pitch-for-role.js";
import {
  MockMcpClient,
  type SamplingRequest,
} from "../../../test/harness/mock-mcp-client.js";

describe("@critical pitch-for-role with sampling", () => {
  it("calls sampling with a constructed prompt containing role + projects, returns enriched text", async () => {
    const client = new MockMcpClient({ capabilities: { sampling: {} } });
    client.onSampling(async () => ({
      content: { type: "text", text: "Pitch mentions research-agent" },
    }));
    const result = await runPitchForRole(
      { roleDescription: "Senior LLM Engineer" },
      { samplingBridge: (req) => client.simulateSampling(req) }
    );
    expect(result.messages[0]?.content?.text).toContain(
      "Pitch mentions research-agent"
    );
    const recorded = client.getRecordedRequests();
    expect(recorded[0]?.payload).toMatchObject({
      maxTokens: expect.any(Number),
    });
    // Sanity: the recorded payload (typed as SamplingRequest) should contain the constructed prompt.
    const samplingPayload = recorded[0]?.payload as SamplingRequest;
    expect(samplingPayload.messages[0]?.content.text).toContain(
      "Senior LLM Engineer"
    );
    expect(samplingPayload.messages[0]?.content.text).toContain(
      "research-agent"
    );
  });

  it("falls back to deterministic template when client does NOT support sampling", async () => {
    const result = await runPitchForRole(
      { roleDescription: "Senior LLM Engineer" },
      { samplingBridge: null, clientSupportsSampling: false }
    );
    expect(result.messages[0]?.content?.text).toContain("Senior LLM Engineer");
    expect(result.messages[0]?.content?.text).toContain("research-agent");
    expect(result.messages[0]?.content?.text).toMatch(/bookCall/);
  });

  it("retries once on empty sampling response, then falls back", async () => {
    const client = new MockMcpClient({ capabilities: { sampling: {} } });
    let calls = 0;
    client.onSampling(async () => {
      calls++;
      return { content: { type: "text", text: "" } };
    });
    const result = await runPitchForRole(
      { roleDescription: "Senior LLM Engineer" },
      { samplingBridge: (req) => client.simulateSampling(req) }
    );
    expect(calls).toBe(2);
    expect(result.messages[0]?.content?.text).toContain("research-agent"); // fallback used
  });

  it("times out after 30s and falls back", async () => {
    const result = await runPitchForRole(
      { roleDescription: "X" },
      {
        samplingBridge: () => new Promise(() => {}), // hangs forever
        samplingTimeoutMs: 100, // override for test
      }
    );
    expect(result.messages[0]?.content?.text).toBeTruthy(); // fallback succeeded
  });
});
