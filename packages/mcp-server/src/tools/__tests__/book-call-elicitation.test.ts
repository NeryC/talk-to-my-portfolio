import { describe, it, expect } from "vitest";
import { runBookCall } from "../book-call.js";
import { MockMcpClient } from "../../../test/harness/mock-mcp-client.js";

describe("@critical bookCall elicitation", () => {
  it("when called with only `name`, emits elicitation for email + slotId + role", async () => {
    const client = new MockMcpClient({ capabilities: { elicitation: {} } });
    client.onElicitation(async () => ({
      action: "accept",
      content: {
        email: "r@acme.com",
        slotId: "slot_123",
        role: "Senior LLM Engineer",
      },
    }));
    const r = await runBookCall(
      { name: "Sarah" },
      {
        elicitationBridge: (req) => client.simulateElicitation(req),
        clientSupportsElicitation: true,
      },
    );
    expect(client.getRecordedRequests()).toHaveLength(1);
    expect(r.bookingId).toMatch(/^stub-/);
  });

  it("re-emits elicitation when the user provides invalid email", async () => {
    const client = new MockMcpClient({ capabilities: { elicitation: {} } });
    let call = 0;
    client.onElicitation(async () => {
      call++;
      if (call === 1)
        return {
          action: "accept",
          content: { email: "not-an-email", slotId: "x", role: "y" },
        };
      return {
        action: "accept",
        content: { email: "good@acme.com", slotId: "x", role: "y" },
      };
    });
    const r = await runBookCall(
      { name: "Sarah" },
      {
        elicitationBridge: (req) => client.simulateElicitation(req),
        clientSupportsElicitation: true,
      },
    );
    expect(call).toBe(2);
    expect(r.bookingId).toBeTruthy();
  });

  it("when user cancels elicitation, returns clear error", async () => {
    const client = new MockMcpClient({ capabilities: { elicitation: {} } });
    client.onElicitation(async () => ({ action: "cancel" }));
    await expect(
      runBookCall(
        { name: "Sarah" },
        {
          elicitationBridge: (req) => client.simulateElicitation(req),
          clientSupportsElicitation: true,
        },
      ),
    ).rejects.toThrow(/booking cancelled/i);
  });

  it("when client does NOT support elicitation, returns structured error listing missing fields", async () => {
    await expect(
      runBookCall(
        { name: "Sarah" },
        { clientSupportsElicitation: false },
      ),
    ).rejects.toThrow(/missing: email, slotId, role/i);
  });

  it("happy path: all fields provided upfront, no elicitation needed", async () => {
    const r = await runBookCall(
      {
        name: "Sarah",
        email: "s@acme.com",
        slotId: "slot_x",
        role: "LLM Eng",
      },
      {
        clientSupportsElicitation: true,
        elicitationBridge: async () => {
          throw new Error("should not be called");
        },
      },
    );
    expect(r.bookingId).toBeTruthy();
  });
});
