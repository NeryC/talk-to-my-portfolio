import type { NextConfig } from "next";
import path from "node:path";

// Tell Next.js's serverless dependency tracer about the JSON/markdown data
// files that @neryc/portfolio-shared reads with readFileSync at runtime.
// Without these hints Turbopack ships the route bundle but not the data
// directory, so any tool call fails with ENOENT in production.
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), "..", ".."),
  outputFileTracingIncludes: {
    "/api/mcp/[[...path]]": ["../../packages/shared/data/**/*"],
    "/api/agent": ["../../packages/shared/data/**/*"],
  },
};

export default nextConfig;
