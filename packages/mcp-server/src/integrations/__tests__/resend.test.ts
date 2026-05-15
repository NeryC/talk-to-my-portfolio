import { describe, it, expect, vi } from "vitest";
import { sendBookingConfirmation } from "../resend.js";

type SendFn = (payload: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) => Promise<{ data: { id: string } | null; error: unknown }>;

describe("sendBookingConfirmation", () => {
  it("calls Resend with the expected subject and template", async () => {
    const send = vi.fn<SendFn>(async () => ({
      data: { id: "email_123" },
      error: null,
    }));
    await sendBookingConfirmation(
      {
        to: "r@a.com",
        name: "R",
        role: "X",
        bookingId: "b1",
        confirmationUrl: "https://cal.com/booking/b1",
      },
      { resend: { emails: { send } } as never, from: "Nery <hello@neryc.dev>" },
    );
    expect(send).toHaveBeenCalledOnce();
    const firstCall = send.mock.calls[0];
    if (!firstCall) throw new Error("send was not called");
    const call = firstCall[0];
    expect(call.subject).toMatch(/intro/i);
    expect(call.html).toContain("R");
    expect(call.html).toContain("https://cal.com/booking/b1");
  });

  it("returns the Resend response on success", async () => {
    const send = vi.fn<SendFn>(async () => ({
      data: { id: "email_456" },
      error: null,
    }));
    const r = await sendBookingConfirmation(
      {
        to: "x@y.com",
        name: "N",
        role: "R",
        bookingId: "b2",
        confirmationUrl: "https://cal.com/booking/b2",
      },
      { resend: { emails: { send } } as never, from: "from@x.com" },
    );
    expect(r.data?.id).toBe("email_456");
  });
});
