import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { buildServer } from "@neryc/portfolio-mcp/server";

// Lazy, memoized initialization. Avoids top-level await (which Next.js may
// evaluate differently per worker) and ensures the server connects to the
// transport exactly once per process worker. Vercel may spawn multiple
// workers, each with its own transport instance — MCP sessions are scoped
// per-request via the sessionIdGenerator.
let transportPromise: Promise<WebStandardStreamableHTTPServerTransport> | null =
  null;

export function getMcpTransport(): Promise<WebStandardStreamableHTTPServerTransport> {
  if (transportPromise === null) {
    transportPromise = (async () => {
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
      });
      const { server } = buildServer();
      await server.connect(transport);
      return transport;
    })();
  }
  return transportPromise;
}
