import { describe, it, expect } from "vitest";
import { runBookCall } from "../book-call.js";
import { CalComRealClient } from "../../integrations/cal-com.real.js";
import { parseEnv } from "../../env.js";

const LIVE = process.env.TEST_CALCOM_LIVE === "1";

describe.skipIf(!LIVE)("@live bookCall live Cal.com integration", () => {
  it("books a real slot against the sandbox event type", async () => {
    const env = parseEnv();
    const cal = new CalComRealClient({
      apiKey: env.CAL_COM_API_KEY,
      eventTypeId: env.CAL_COM_EVENT_TYPE_ID,
      username: env.CAL_COM_USERNAME,
    });
    const slots = await cal.getAvailability({
      from: new Date().toISOString().slice(0, 10),
      to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    expect(slots.length).toBeGreaterThan(0);

    const result = await runBookCall(
      {
        name: "Live Test",
        email: "live-test@example.com",
        slotId: slots[0]!.id,
        role: "Live test",
        message: "Automated live test — please ignore or cancel.",
      },
      { calCom: cal },
    );
    expect(result.bookingId).toBeTruthy();
    expect(result.confirmationUrl).toMatch(/^https?:\/\//);
  });
});
