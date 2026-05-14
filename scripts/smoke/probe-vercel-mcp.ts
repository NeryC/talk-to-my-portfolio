import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const url = process.env.PROBE_URL ?? "http://localhost:3000/api/mcp";
const transport = new StreamableHTTPClientTransport(new URL(url));
const client = new Client(
  { name: "probe", version: "0.0.0" },
  { capabilities: {} },
);

await client.connect(transport);
console.log("connected to:", url);

const tools = await client.listTools();
console.log(
  "tools:",
  tools.tools.map((t) => t.name),
);

const result = await client.callTool({ name: "ping", arguments: {} });
console.log("result:", JSON.stringify(result, null, 2));

await client.close();
process.exit(0);
