import { describe, it, expect, vi } from "vitest";
import { CalComRealClient } from "../cal-com.real.js";
import availabilityFixture from "../__fixtures__/cal-com-availability.json";
import bookingFixture from "../__fixtures__/cal-com-booking.json";

type FetchFn = typeof globalThis.fetch;

describe("CalComRealClient", () => {
  it("getAvailability calls /v2/slots with from/to and parses slots", async () => {
    const fetchMock = vi.fn<FetchFn>(
      async () =>
        ({
          ok: true,
          json: async () => availabilityFixture,
          status: 200,
        }) as unknown as Response,
    );
    const client = new CalComRealClient({
      apiKey: "test",
      eventTypeId: 123,
      username: "u",
      fetch: fetchMock as unknown as FetchFn,
    });
    const slots = await client.getAvailability({
      from: "2026-06-01",
      to: "2026-06-30",
    });
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toMatchObject({
      id: expect.any(String),
      startsAt: expect.any(String),
    });
    const firstCall = fetchMock.mock.calls[0];
    if (!firstCall) throw new Error("fetch was not called");
    const url = firstCall[0] as string;
    expect(url).toContain("/v2/slots");
    expect(url).toContain("eventTypeId=123");
  });

  it("bookSlot posts to /v2/bookings with the correct body shape and returns ID + confirmation URL", async () => {
    const fetchMock = vi.fn<FetchFn>(
      async () =>
        ({
          ok: true,
          json: async () => bookingFixture,
          status: 201,
        }) as unknown as Response,
    );
    const client = new CalComRealClient({
      apiKey: "test",
      eventTypeId: 123,
      username: "u",
      fetch: fetchMock as unknown as FetchFn,
    });
    const r = await client.bookSlot({
      slotId: "2026-06-01T10:00:00.000Z",
      email: "r@a.com",
      name: "R",
      role: "X",
    });
    expect(r.bookingId).toBeTruthy();
    expect(r.confirmationUrl).toMatch(/^https?:\/\//);
    const firstCall = fetchMock.mock.calls[0];
    if (!firstCall) throw new Error("fetch was not called");
    const init = firstCall[1] as RequestInit | undefined;
    if (!init) throw new Error("fetch called without init");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      start: expect.any(String),
      responses: { name: "R", email: "r@a.com" },
    });
  });

  it("throws a clear error on 4xx from Cal.com", async () => {
    const fetchMock = vi.fn<FetchFn>(
      async () =>
        ({
          ok: false,
          status: 400,
          text: async () => "bad request",
        }) as unknown as Response,
    );
    const client = new CalComRealClient({
      apiKey: "test",
      eventTypeId: 123,
      username: "u",
      fetch: fetchMock as unknown as FetchFn,
    });
    await expect(
      client.bookSlot({ slotId: "x", email: "x", name: "x", role: "x" }),
    ).rejects.toThrow(/cal.com 400/i);
  });
});
