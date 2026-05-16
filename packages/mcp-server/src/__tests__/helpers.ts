import type { BuiltServer } from "../server.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

type Handler = (req: unknown, extra: unknown) => Promise<unknown>;

function getHandler(built: BuiltServer, method: string): Handler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlers = (built.server as any)._requestHandlers as Map<string, Handler>;
  const handler = handlers.get(method);
  if (!handler) throw new Error(`No handler registered for method: ${method}`);
  return handler;
}

export async function callListTools(
  built: BuiltServer,
): Promise<{ tools: { name: string; description: string }[] }> {
  const handler = getHandler(built, ListToolsRequestSchema.shape.method.value);
  const res = await handler({ method: "tools/list" }, {});
  return res as { tools: { name: string; description: string }[] };
}

export async function callTool(
  built: BuiltServer,
  name: string,
  args: Record<string, unknown> = {},
): Promise<{ content: { type: string; text: string }[] }> {
  const handler = getHandler(built, CallToolRequestSchema.shape.method.value);
  const res = await handler(
    { method: "tools/call", params: { name, arguments: args } },
    {},
  );
  return res as { content: { type: string; text: string }[] };
}
