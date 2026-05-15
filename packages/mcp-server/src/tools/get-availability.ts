import { z } from "zod";
import { stubCalComClient, type CalComClient } from "../integrations/cal-com.js";
import type { Tool } from "./types.js";

export const getAvailabilityInputSchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/)
    .optional(),
});

export interface RunOptions {
  calCom?: CalComClient;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_WINDOW_DAYS = 30;

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function runGetAvailability(
  args: unknown,
  opts: RunOptions = {},
): Promise<{
  from: string;
  to: string;
  slots: { id: string; startsAt: string; endsAt: string }[];
}> {
  const parsed = getAvailabilityInputSchema.parse(args);
  const cal = opts.calCom ?? stubCalComClient;

  const from = parsed.from ?? isoDay(new Date());
  const to =
    parsed.to ?? isoDay(new Date(Date.now() + DEFAULT_WINDOW_DAYS * ONE_DAY_MS));

  const slots = await cal.getAvailability({ from, to });
  return { from, to, slots };
}

export const getAvailabilityTool: Tool<typeof getAvailabilityInputSchema> = {
  name: "getAvailability",
  description:
    "Get Nery's available 30-minute intro-call slots from his Cal.com calendar. Optionally narrow with from/to dates (YYYY-MM-DD). Defaults to today through today+30 days. Use before bookCall.",
  inputSchema: getAvailabilityInputSchema,
  async execute(args) {
    return runGetAvailability(args);
  },
};
