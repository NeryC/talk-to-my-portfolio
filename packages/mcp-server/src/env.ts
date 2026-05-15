import { z } from "zod";

const Schema = z.object({
  CAL_COM_API_KEY: z.string().min(1),
  CAL_COM_EVENT_TYPE_ID: z.coerce.number().int().positive(),
  CAL_COM_USERNAME: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1),
});

export type Env = z.infer<typeof Schema>;

export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = Schema.safeParse(source);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid env vars: ${missing}`);
  }
  return result.data;
}
