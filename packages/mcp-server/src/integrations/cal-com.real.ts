import type { CalComClient } from "./cal-com.js";

export interface CalComRealClientOpts {
  apiKey: string;
  eventTypeId: number;
  username: string;
  fetch?: typeof globalThis.fetch;
}

const BASE = "https://api.cal.com";

/**
 * Real Cal.com v2 API client.
 *
 * Contract is verified by fetch-mocked tests against synthesized fixtures
 * that follow the publicly documented Cal.com v2 response shapes
 * (https://api.cal.com/v2/docs). If the live API contract changes, the
 * fixtures + this implementation must be updated together.
 */
export class CalComRealClient implements CalComClient {
  constructor(private opts: CalComRealClientOpts) {}

  private get f() {
    return this.opts.fetch ?? globalThis.fetch;
  }

  async getAvailability({ from, to }: { from: string; to: string }) {
    const url = `${BASE}/v2/slots?eventTypeId=${this.opts.eventTypeId}&start=${from}&end=${to}`;
    const r = await this.f(url, {
      headers: {
        Authorization: `Bearer ${this.opts.apiKey}`,
        "cal-api-version": "2024-08-13",
      },
    });
    if (!r.ok) throw new Error(`cal.com ${r.status}: ${await r.text()}`);
    const data = (await r.json()) as {
      data?: { slots?: Record<string, { time: string }[]> };
    };
    // Cal.com v2 returns slots as an object keyed by date. Flatten to an array.
    const slotsByDate = data.data?.slots ?? {};
    const flat: { time: string }[] = [];
    for (const dateSlots of Object.values(slotsByDate)) {
      for (const slot of dateSlots) flat.push(slot);
    }
    // NOTE: The /v2/slots response only exposes slot start times. `endsAt` is
    // a placeholder until Phase 5 / production hardening computes it from
    // (slot start + event-type duration). Consumers should treat `endsAt`
    // as best-effort for now.
    return flat.map((s) => ({ id: s.time, startsAt: s.time, endsAt: s.time }));
  }

  async bookSlot({
    slotId,
    email,
    name,
    role,
    message,
  }: {
    slotId: string;
    email: string;
    name: string;
    role: string;
    message?: string;
  }) {
    const r = await this.f(`${BASE}/v2/bookings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.opts.apiKey}`,
        "Content-Type": "application/json",
        "cal-api-version": "2024-08-13",
      },
      body: JSON.stringify({
        start: slotId,
        eventTypeId: this.opts.eventTypeId,
        responses: {
          name,
          email,
          notes: `Role: ${role}${message ? ` — ${message}` : ""}`,
        },
      }),
    });
    if (!r.ok) throw new Error(`cal.com ${r.status}: ${await r.text()}`);
    const data = (await r.json()) as {
      data?: { id?: number | string; uid?: string };
    };
    return {
      bookingId: String(data.data?.id ?? ""),
      confirmationUrl: data.data?.uid
        ? `https://cal.com/booking/${data.data.uid}`
        : `https://cal.com/${this.opts.username}`,
    };
  }
}
