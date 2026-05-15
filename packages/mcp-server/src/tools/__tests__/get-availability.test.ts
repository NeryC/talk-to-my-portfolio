import { describe, it, expect } from "vitest";
import { runGetAvailability } from "../get-availability.js";

describe("getAvailability tool", () => {
  it("returns slots from injected Cal.com client", async () => {
    const mockCal = {
      getAvailability: async () => [
        { id: "s1", startsAt: "2026-06-01T10:00:00Z", endsAt: "2026-06-01T10:30:00Z" },
      ],
      bookSlot: async () => ({ bookingId: "x", confirmationUrl: "x" }),
    };
    const result = await runGetAvailability({}, { calCom: mockCal });
    expect(result.slots).toHaveLength(1);
    expect(result.slots[0]?.id).toBe("s1");
  });

  it("defaults from/to to today/today+30d when not given", async () => {
    let captured: { from?: string; to?: string } | undefined;
    const mockCal = {
      getAvailability: async (args: { from: string; to: string }) => {
        captured = args;
        return [];
      },
      bookSlot: async () => ({ bookingId: "x", confirmationUrl: "x" }),
    };
    await runGetAvailability({}, { calCom: mockCal });
    expect(captured?.from).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(captured?.to).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it("uses explicit from/to when provided", async () => {
    let captured: { from?: string; to?: string } | undefined;
    const mockCal = {
      getAvailability: async (args: { from: string; to: string }) => {
        captured = args;
        return [];
      },
      bookSlot: async () => ({ bookingId: "x", confirmationUrl: "x" }),
    };
    await runGetAvailability(
      { from: "2026-07-01", to: "2026-07-15" },
      { calCom: mockCal },
    );
    expect(captured?.from).toBe("2026-07-01");
    expect(captured?.to).toBe("2026-07-15");
  });
});
