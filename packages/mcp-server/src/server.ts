import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf-8")
);

export interface BuiltServer {
  server: Server;
  serverInfo: { name: string; version: string };
  capabilities: Record<string, unknown>;
}

export function buildServer(): BuiltServer {
  const serverInfo = { name: "portfolio-mcp", version: pkg.version };
  const capabilities = {
    tools: {},
    resources: { subscribe: false, listChanged: false },
    prompts: { listChanged: false },
  };
  const server = new Server(serverInfo, { capabilities });
  return { server, serverInfo, capabilities };
}
