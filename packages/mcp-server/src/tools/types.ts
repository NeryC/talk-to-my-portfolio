import type { z, ZodTypeAny } from "zod";

export interface Tool<S extends ZodTypeAny = ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: S;
  execute: (args: z.infer<S>) => Promise<unknown>;
}

// Erased variant for storing tools with heterogeneous schemas in one collection.
// The registry uses `AnyTool` to avoid invariance issues; individual tools are
// still declared with the precise `Tool<typeof schema>` for type-safe `execute`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTool = Tool<any>;
