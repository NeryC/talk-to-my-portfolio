import { z } from "zod";
import type { Tool } from "./types.js";
import { stubCalComClient, type CalComClient } from "../integrations/cal-com.js";
import type { ElicitationBridge } from "../prompts/_helpers.js";

export const bookCallInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  slotId: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  message: z.string().optional(),
});

const fullSchema = bookCallInputSchema.required({
  email: true,
  slotId: true,
  role: true,
});

export interface RunOptions {
  elicitationBridge?: ElicitationBridge | null;
  clientSupportsElicitation?: boolean;
  calCom?: CalComClient;
}

const MAX_ELICITATION_ATTEMPTS = 3;
const REQUIRED_FIELDS = ["email", "slotId", "role"] as const;

type RequiredField = (typeof REQUIRED_FIELDS)[number];

function findMissing(
  parsed: z.infer<typeof bookCallInputSchema>,
): RequiredField[] {
  return REQUIRED_FIELDS.filter((k) => !parsed[k]);
}

export async function runBookCall(
  args: unknown,
  opts: RunOptions = {},
): Promise<{ bookingId: string; confirmationUrl: string }> {
  const cal = opts.calCom ?? stubCalComClient;
  let parsed = bookCallInputSchema.parse(args);
  let missing = findMissing(parsed);

  if (missing.length === 0) {
    const valid = fullSchema.parse(parsed);
    return cal.bookSlot({
      slotId: valid.slotId,
      email: valid.email,
      name: valid.name,
      role: valid.role,
      message: valid.message,
    });
  }

  if (!opts.clientSupportsElicitation || !opts.elicitationBridge) {
    throw new Error(`missing: ${missing.join(", ")}`);
  }

  const bridge = opts.elicitationBridge;
  for (let attempt = 0; attempt < MAX_ELICITATION_ATTEMPTS; attempt++) {
    const r = await bridge({
      message:
        attempt === 0
          ? `Please provide ${missing.join(", ")} to schedule the intro call.`
          : `Some fields were invalid. Please correct: ${missing.join(", ")}.`,
      requestedSchema: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          slotId: { type: "string" },
          role: { type: "string", minLength: 1 },
          message: { type: "string" },
        },
        required: missing,
      },
    });
    if (r.action !== "accept") {
      throw new Error("booking cancelled by user");
    }

    const merged = bookCallInputSchema.safeParse({
      ...parsed,
      ...(r.content ?? {}),
    });
    if (!merged.success) {
      // Invalid input (e.g. bad email format) — re-ask on next loop iteration.
      continue;
    }
    parsed = merged.data;
    missing = findMissing(parsed);
    if (missing.length === 0) {
      const valid = fullSchema.safeParse(parsed);
      if (valid.success) {
        return cal.bookSlot({
          slotId: valid.data.slotId,
          email: valid.data.email,
          name: valid.data.name,
          role: valid.data.role,
          message: valid.data.message,
        });
      }
      // If full validation still fails, keep looping to re-prompt.
    }
  }
  throw new Error("booking failed after 3 attempts");
}

let _elicitationBridge: ElicitationBridge | null = null;
let _clientSupportsElicitation = false;

export function configureBookCall(opts: {
  elicitationBridge: ElicitationBridge | null;
  clientSupportsElicitation: boolean;
}) {
  _elicitationBridge = opts.elicitationBridge;
  _clientSupportsElicitation = opts.clientSupportsElicitation;
}

export const bookCallTool: Tool<typeof bookCallInputSchema> = {
  name: "bookCall",
  description:
    "Book a 30-minute intro call with Nery. If email, slotId, or role are missing, the server will elicit them from the user. Use after the recruiter expresses interest.",
  inputSchema: bookCallInputSchema,
  async execute(args) {
    return runBookCall(args, {
      elicitationBridge: _elicitationBridge,
      clientSupportsElicitation: _clientSupportsElicitation,
    });
  },
};
