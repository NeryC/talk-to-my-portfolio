import { buildAgent } from "@/lib/agent";
import {
  connectInProcessPortfolio,
  connectStreamableHttp,
  discoverToolsFromServers,
  type NamedServer,
} from "@/lib/mcp-client";
import { rateLimit } from "@/lib/rate-limit";
import { convertToModelMessages, type UIMessage } from "ai";
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

function getAgentContext(): Promise<AgentContext> {
  if (_ctxPromise) return _ctxPromise;
  _ctxPromise = (async () => {
    const portfolio = await connectInProcessPortfolio("portfolio");
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
  const { messages } = (await req.json()) as { messages: UIMessage[] };
  const { agent } = await getAgentContext();
  const modelMessages = await convertToModelMessages(messages);
  const result = await agent.stream({ messages: modelMessages });
  return result.toUIMessageStreamResponse();
}
