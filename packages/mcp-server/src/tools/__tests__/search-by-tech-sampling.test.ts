import { describe, it, expect } from "vitest";
import { runSearchByTech } from "../search-by-tech.js";
import { MockMcpClient } from "../../../test/harness/mock-mcp-client.js";

describe("@critical searchByTech sampling", () => {
  it("when 3+ matches, requests sampling for a summary", async () => {
    const client = new MockMcpClient({ capabilities: { sampling: {} } });
    client.onSampling(async () => ({
      content: { type: "text", text: "SUMMARY" },
    }));
    const r = await runSearchByTech(
      { tech: "TypeScript" },
      {
        samplingBridge: (req) => client.simulateSampling(req),
        clientSupportsSampling: true,
      },
    );
    expect(r.summary).toBe("SUMMARY");
    expect(
      client.getRecordedRequests().filter((x) => x.kind === "sampling"),
    ).toHaveLength(1);
  });

  it("when 1-2 matches, skips sampling (no roundtrip)", async () => {
    const client = new MockMcpClient({ capabilities: { sampling: {} } });
    const r = await runSearchByTech(
      { tech: "cobol" },
      {
        samplingBridge: (req) => client.simulateSampling(req),
        clientSupportsSampling: true,
      },
    );
    expect(r.summary).toBeUndefined();
    expect(client.getRecordedRequests()).toHaveLength(0);
  });

  it("when client does not support sampling, returns data without summary", async () => {
    const r = await runSearchByTech(
      { tech: "TypeScript" },
      { clientSupportsSampling: false },
    );
    expect(r.summary).toBeUndefined();
    // Seed-data deviation: only 2 of 3 seed projects have "TypeScript" in
    // their stack (rag-agent-memory does not). When real data lands in
    // Phase 5/6, this assertion should be revisited. See the equivalent
    // note in search-by-tech.test.ts.
    expect(r.projects.length).toBeGreaterThanOrEqual(2);
  });
});
