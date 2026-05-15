import { describe, it, expect } from "vitest";
import { MockMcpClient } from "../mock-mcp-client.js";

describe("MockMcpClient harness", () => {
  it("records sampling requests sent by the server", async () => {
    const client = new MockMcpClient({
      capabilities: { sampling: {} },
    });
    client.onSampling(async (req) => ({ content: { type: "text", text: "MOCK_RESPONSE" } }));
    const result = await client.simulateSampling({
      messages: [{ role: "user", content: { type: "text", text: "test prompt" } }],
      maxTokens: 200,
    });
    expect(result.content.text).toBe("MOCK_RESPONSE");
    expect(client.getRecordedRequests()).toHaveLength(1);
  });

  it("records elicitation requests and lets the test author respond", async () => {
    const client = new MockMcpClient({ capabilities: { elicitation: {} } });
    client.onElicitation(async (req) => ({ action: "accept", content: { email: "test@example.com" } }));
    const r = await client.simulateElicitation({
      message: "We need your email",
      requestedSchema: { type: "object", properties: { email: { type: "string" } }, required: ["email"] },
    });
    expect(r.action).toBe("accept");
    expect(r.content?.email).toBe("test@example.com");
  });

  it("supports clients that do NOT declare sampling/elicitation capability", () => {
    const client = new MockMcpClient({ capabilities: {} });
    expect(client.supportsSampling()).toBe(false);
    expect(client.supportsElicitation()).toBe(false);
  });
});
