import { buildAgent } from "@/lib/agent";
import {
  connectStreamableHttp,
  discoverToolsFromServers,
  type NamedServer,
} from "@/lib/mcp-client";
import { rateLimit } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

// Next.js 16 App Router route handler config.
// The agent streams responses via the AI SDK v6 UI message stream, so we
// disable static optimization and use the Node.js runtime (required for the
// MCP SDK + AI SDK streaming primitives).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

interface AgentContext {
  agent: ReturnType<typeof buildAgent>;
}

let _ctxPromise: Promise<AgentContext> | null = null;

function resolveSelfBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// Lazy initialization: the local MCP server at /api/mcp isn't running at
// module load time during `next build`. We discover tools and build the agent
// on the first request and memoize the result for subsequent requests.
function getAgentContext(): Promise<AgentContext> {
  if (_ctxPromise) return _ctxPromise;
  _ctxPromise = (async () => {
    const base = resolveSelfBaseUrl();
    const portfolio = await connectStreamableHttp("portfolio", `${base}/api/mcp`);
    const servers: NamedServer[] = [portfolio];
    const githubUrl = process.env.GITHUB_MCP_URL;
    if (githubUrl) {
      servers.push(await connectStreamableHttp("github", githubUrl));
    }
    const tools = await discoverToolsFromServers(servers);
    return { agent: buildAgent(tools) };
  })();
  return _ctxPromise;
}

export async function POST(req: NextRequest): Promise<Response> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const limit = await rateLimit(ip);
  if (!limit.allowed) {
    return new Response(
      JSON.stringify({ error: "rate-limited", retryAfter: limit.retryAfter }),
      { status: 429, headers: { "content-type": "application/json" } },
    );
  }
  const { messages } = (await req.json()) as { messages: unknown };
  const { agent } = await getAgentContext();
  const result = await agent.stream({ messages: messages as never });
  return result.toUIMessageStreamResponse();
}
