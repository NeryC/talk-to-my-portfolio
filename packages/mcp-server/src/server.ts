import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { listProjectsTool } from "./tools/list-projects.js";
import { getProjectTool } from "./tools/get-project.js";
import { searchByTechTool } from "./tools/search-by-tech.js";
import { getSkillsTool } from "./tools/get-skills.js";
import { getExperienceTool } from "./tools/get-experience.js";
import { searchCoursesTool } from "./tools/search-courses.js";
import { getCourseTool } from "./tools/get-course.js";
import type { AnyTool } from "./tools/types.js";

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

  const tools: readonly AnyTool[] = [
    listProjectsTool,
    getProjectTool,
    searchByTechTool,
    getSkillsTool,
    getExperienceTool,
    searchCoursesTool,
    getCourseTool,
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: zodToJsonSchema(t.inputSchema),
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const tool = tools.find((t) => t.name === req.params.name);
    if (!tool) throw new Error(`Unknown tool: ${req.params.name}`);
    const parsed = tool.inputSchema.parse(req.params.arguments ?? {});
    const result = await tool.execute(parsed);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  return { server, serverInfo, capabilities };
}
