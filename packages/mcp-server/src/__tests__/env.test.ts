import { describe, it, expect } from "vitest";
import { parseEnv } from "../env.js";

describe("parseEnv", () => {
  it("returns valid env when all keys present", () => {
    const env = parseEnv({
      CAL_COM_API_KEY: "x",
      CAL_COM_EVENT_TYPE_ID: "123",
      CAL_COM_USERNAME: "u",
      RESEND_API_KEY: "x",
      RESEND_FROM_EMAIL: "Nery <hello@neryc.dev>",
    });
    expect(env.CAL_COM_EVENT_TYPE_ID).toBe(123);
  });

  it("throws with clear message on missing key", () => {
    expect(() => parseEnv({})).toThrow(/CAL_COM_API_KEY/);
  });
});
