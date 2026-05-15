#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildServer } from "./server.js";
import { parseEnv } from "./env.js";

async function main() {
  parseEnv(); // throws on missing env vars; uncaught → process.exit(1) below
  const { server } = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`[portfolio-mcp] stdio transport connected\n`);
}

main().catch((err) => {
  process.stderr.write(`[portfolio-mcp] fatal: ${err.stack ?? err.message}\n`);
  process.exit(1);
});
