import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Next.js 16 App Router route handler config.
// The MCP Streamable HTTP transport may stream SSE responses, so we disable
// static optimization and use the Node.js runtime (required for crypto.randomUUID
// and the SDK's streaming primitives).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 800;

function buildServer(): Server {
  const server = new Server(
    { name: "portfolio-mcp-probe", version: "0.0.0" },
    { capabilities: { tools: {} } },
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "ping",
        description: "Returns 'pong'.",
        inputSchema: { type: "object" },
      },
    ],
  }));
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    if (req.params.name === "ping") {
      return { content: [{ type: "text", text: "pong" }] };
    }
    throw new Error(`Unknown tool: ${req.params.name}`);
  });
  return server;
}

// Lazy, memoized initialization. Avoids top-level await (which Next.js may
// evaluate differently per worker) and ensures the server connects to the
// transport exactly once per process.
let transportPromise: Promise<WebStandardStreamableHTTPServerTransport> | null =
  null;

function getTransport(): Promise<WebStandardStreamableHTTPServerTransport> {
  if (transportPromise === null) {
    transportPromise = (async () => {
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
      });
      const server = buildServer();
      await server.connect(transport);
      return transport;
    })();
  }
  return transportPromise;
}

async function handle(req: Request): Promise<Response> {
  const transport = await getTransport();
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
