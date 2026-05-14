# Vercel HTTP MCP — risk validated 2026-05-14

The minimal MCP server (single `ping` tool, `WebStandardStreamableHTTPServerTransport`, optional-catch-all route at `[[...path]]`) deploys to Vercel and a remote MCP client can connect over Streamable HTTP, list tools, and call them end-to-end.

- Local probe: passed (commit 0333600)
- Vercel preview probe: passed
- Preview URL pattern: `https://talk-to-my-portfolio-<sha>-<scope>.vercel.app/api/mcp`
- SDK transport class: `WebStandardStreamableHTTPServerTransport` (NOT `StreamableHTTPServerTransport` which is Node-style)
- Runtime: `nodejs` (explicit)
- Max duration: 300s (Vercel Hobby plan cap; spec called for 800s but Hobby max is 300s, plenty for chat)

If Vercel changes behavior and breaks this, Plan B is hosting the MCP server on Railway as a long-running Node service (see spec section 3.3).

## Deploy notes (monorepo + pnpm workspace)

This is a pnpm workspace and `apps/web` depends on the workspace package `@neryc/portfolio-shared` via `workspace:*`. Vercel cannot resolve `workspace:*` with plain `npm install`, so the project must be configured as follows:

- Vercel project `rootDirectory` = `apps/web`
- `sourceFilesOutsideRootDirectory` = `true` (auto-set when rootDirectory is non-root)
- Local Vercel link (`.vercel/`) lives at the monorepo root
- `vercel --yes` is run from the monorepo root
- Vercel auto-detects pnpm from `pnpm-lock.yaml` and runs `pnpm install` against the whole workspace, then `pnpm run build` inside `apps/web`

Setting `rootDirectory` via CLI is not currently supported by `vercel project` subcommands. It was set via `PATCH /v9/projects/{id}` against the Vercel REST API. Once set, future `vercel` deploys from the monorepo root just work.

## SSO / deployment protection

The team's default deployment protection (`ssoProtection.deploymentType = all_except_custom_domains`) blocks unauthenticated access to preview deployments with HTTP 401, which would block the MCP probe and any future external MCP client (Claude Desktop, ChatGPT). This was disabled at the project level for the validation. When productionising, decide whether to keep it off, gate by bypass token, or use a custom domain (custom domains are exempt from SSO with the default setting).
