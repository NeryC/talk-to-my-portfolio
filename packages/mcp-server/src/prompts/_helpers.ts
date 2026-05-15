export interface SamplingBridge {
  (req: {
    messages: { role: "user"; content: { type: "text"; text: string } }[];
    maxTokens: number;
  }): Promise<{ content: { type: "text"; text: string } }>;
}

export interface ElicitationBridge {
  (req: {
    message: string;
    requestedSchema: Record<string, unknown>;
  }): Promise<{
    action: "accept" | "decline" | "cancel";
    content?: Record<string, unknown>;
  }>;
}

export interface TimeoutRetryOptions {
  timeoutMs: number;
  retries: number;
}

export async function withTimeoutAndRetry(
  fn: () => Promise<{ content: { type: "text"; text: string } }>,
  opts: TimeoutRetryOptions,
): Promise<string | null> {
  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error("timeout")), opts.timeoutMs),
        ),
      ]);
      const text = result.content.text.trim();
      if (text.length > 0) return text;
    } catch {
      /* fall through to retry or fallback */
    }
  }
  return null;
}
