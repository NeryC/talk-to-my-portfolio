import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
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
import { bookCallTool } from "./tools/book-call.js";
import type { AnyTool } from "./tools/types.js";
import { listResources, readResource } from "./resources/index.js";
import { listPrompts, getPrompt } from "./prompts/index.js";
import type { SamplingBridge, ElicitationBridge } from "./bridges.js";
import { configureBridges } from "./bridge-state.js";

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf-8")
);

export interface BuiltServer {
  server: Server;
  serverInfo: { name: string; version: string };
  capabilities: Record<string, unknown>;
  getConfiguredPromptOptions: () => {
    clientSupportsSampling: boolean;
    clientSupportsElicitation: boolean;
  };
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
    bookCallTool,
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

  server.setRequestHandler(ListResourcesRequestSchema, async () => listResources());
  server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
    const r = await readResource(req.params.uri);
    return { contents: [{ uri: r.uri, mimeType: r.mimeType, text: r.text }] };
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => listPrompts());
  server.setRequestHandler(GetPromptRequestSchema, async (req) =>
    getPrompt({ name: req.params.name, arguments: req.params.arguments ?? {} })
  );

  // Bridges from our prompt code to the SDK's client-facing APIs.
  const samplingBridge: SamplingBridge = async (req) => {
    const r = await server.createMessage({
      messages: req.messages,
      maxTokens: req.maxTokens,
    });
    // SDK returns a discriminated union (text|image|audio); we only handle text.
    if (r.content && (r.content as { type?: string }).type === "text") {
      const text = (r.content as { type: "text"; text: string }).text;
      return { content: { type: "text", text } };
    }
    return { content: { type: "text", text: "" } };
  };

  const elicitationBridge: ElicitationBridge = async (req) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await server.elicitInput({
      message: req.message,
      requestedSchema: req.requestedSchema as never,
    });
    return {
      action: r.action as "accept" | "decline" | "cancel",
      content: r.content,
    };
  };

  const getCaps = () => {
    // Prefer the public SDK method; fall back to the private field for
    // resilience (and to support tests that poke `_clientCapabilities`).
    const cc =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (typeof (server as any).getClientCapabilities === "function" &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (server as any).getClientCapabilities()) ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (server as any)._clientCapabilities ||
      {};
    return {
      clientSupportsSampling: !!cc.sampling,
      clientSupportsElicitation: !!cc.elicitation,
    };
  };

  const configure = () => {
    const caps = getCaps();
    configureBridges({
      samplingBridge: caps.clientSupportsSampling ? samplingBridge : null,
      elicitationBridge: caps.clientSupportsElicitation
        ? elicitationBridge
        : null,
      clientSupportsSampling: caps.clientSupportsSampling,
      clientSupportsElicitation: caps.clientSupportsElicitation,
    });
  };

  // Re-configure after every initialize handshake. SDK 1.29.0 exposes
  // `oninitialized` (lowercase i) as a public callback.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (server as any).oninitialized !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (server as any).oninitialized = configure;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if (typeof (server as any).onInitialized !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (server as any).onInitialized = configure;
  }

  return {
    server,
    serverInfo,
    capabilities,
    getConfiguredPromptOptions: getCaps,
  };
}
