import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export interface DiscoveredTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  sourceServer: string;
  invoke: (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[] }>;
}

export interface NamedServer {
  name: string;
  client: Client;
}

export async function discoverToolsFromServers(servers: NamedServer[]): Promise<DiscoveredTool[]> {
  const out: DiscoveredTool[] = [];
  for (const s of servers) {
    const list = await s.client.listTools();
    for (const t of list.tools) {
      out.push({
        name: t.name,
        description: t.description ?? "",
        inputSchema: (t.inputSchema as Record<string, unknown>) ?? {},
        sourceServer: s.name,
        invoke: async (args) => {
          const res = await s.client.callTool({ name: t.name, arguments: args });
          return res as { content: { type: string; text: string }[] };
        },
      });
    }
  }
  return out;
}

export async function connectStreamableHttp(name: string, url: string): Promise<NamedServer> {
  const transport = new StreamableHTTPClientTransport(new URL(url));
  const client = new Client(
    { name: "web-host", version: "0.0.0" },
    { capabilities: { sampling: {}, elicitation: {} } },
  );
  await client.connect(transport);
  return { name, client };
}
