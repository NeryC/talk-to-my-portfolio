import { getMcpTransport } from "../../../../lib/mcp-server-instance.js";

// Next.js 16 App Router route handler config.
// The MCP Streamable HTTP transport may stream SSE responses, so we disable
// static optimization and use the Node.js runtime (required for crypto.randomUUID
// and the SDK's streaming primitives).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

async function handle(req: Request): Promise<Response> {
  const transport = await getMcpTransport();
  return transport.handleRequest(req);
}

export async function POST(req: Request): Promise<Response> {
  return handle(req);
}

export async function GET(req: Request): Promise<Response> {
  return handle(req);
}

export async function DELETE(req: Request): Promise<Response> {
  return handle(req);
}
