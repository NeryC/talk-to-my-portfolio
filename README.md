# Talk To My Portfolio

An MCP (Model Context Protocol) server that exposes Nery Cano's CV, projects, Platzi certificates, and work experience — so any MCP-compatible client (Claude Desktop, ChatGPT, custom agents) can query it conversationally.

**Live:** https://talk-to-my-portfolio.vercel.app  
**MCP endpoint:** `https://talk-to-my-portfolio.vercel.app/api/mcp`  
**Demo chat UI:** https://talk-to-my-portfolio.vercel.app/demo

---

## What it does

Connect any MCP client to the endpoint above and ask things like:

- *"What projects has Nery built with TypeScript and AI?"*
- *"Show me his Python and data-science certifications with diploma links."*
- *"Is he available for a call next week? Book a 30-minute intro."*
- *"Compare his background against this job description."*

The server answers from structured, verifiable data — no hallucinations about skills or roles.

---

## Architecture

```
apps/web (Next.js 16)          packages/mcp-server           packages/shared
├── /api/mcp/[[...path]]  ───▶  MCP server (SDK v1)  ◀────  JSON data files
├── /api/agent                  ├── tools (9)                ├── cv.json
├── /demo  (chat UI)            ├── resources (4 URIs)       ├── experience.json
└── /widget (embeddable)        └── prompts (3)              ├── courses.json (164)
                                                             └── skills.json
```

The MCP server is a stateless Next.js route handler using `WebStandardStreamableHTTPServerTransport`. It runs on Vercel's serverless runtime with a 300s max duration.

The chat demo (`/demo`) uses an AI SDK `ToolLoopAgent` on the `/api/agent` route: the agent auto-discovers all MCP tools at startup and loops until it calls `finalAnswer`.

---

## MCP surface

### Tools

| Tool | Description |
|---|---|
| `listProjects` | List all portfolio projects with slug, title, and tagline |
| `getProject` | Get full detail for one project by slug |
| `searchByTech` | Search projects + courses + experience by tech keyword |
| `searchCourses` | Search Platzi certificates by topic |
| `getCourse` | Get one course with diploma URL by slug |
| `getExperience` | Get full work history |
| `getSkills` | Get skills grouped by area |
| `getAvailability` | Check Cal.com availability for a given date range |
| `bookCall` | Book a call (elicits name + email + preferred slot) |

### Resources

| URI | MIME | Content |
|---|---|---|
| `portfolio://cv/full` | `text/markdown` | Full CV as Markdown |
| `portfolio://projects/{slug}/readme` | `text/markdown` | Project README |
| `portfolio://projects/{slug}/case-study` | `text/markdown` | Project case study |
| `portfolio://courses/{slug}/certificate` | `application/json` | Course certificate JSON with diploma URL |

### Prompts

| Prompt | Description |
|---|---|
| `pitch-for-role` | Compose a tailored pitch for a job description (uses sampling) |
| `tech-deep-dive` | Deep-dive into Nery's experience with a specific technology |
| `compare-with-jd` | Side-by-side fit analysis against a job description (uses elicitation + sampling) |

---

## Monorepo layout

```
apps/
  web/                  Next.js app (demo UI + MCP HTTP route + agent route)
packages/
  mcp-server/           MCP server: tools, resources, prompts, integrations
  shared/               Zod schemas + typed data loaders + JSON seed files
  widget/               Embeddable Preact FAB widget (esbuild bundle)
scripts/
  sync-platzi/          Playwright scraper to keep courses.json up to date
```

---

## Running locally

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # add ANTHROPIC_API_KEY + optional vars
pnpm dev                                         # starts Next.js on http://localhost:3000
```

Optional env vars (all features work without them in read-only mode):
- `ANTHROPIC_API_KEY` — required for the chat demo and sampling prompts
- `CALCOM_API_KEY` + `CALCOM_EVENT_TYPE_ID` — required for real booking
- `RESEND_API_KEY` — sends confirmation email after booking
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — rate limiting on `/api/agent`

---

## Testing

```bash
pnpm test            # full suite (112 tests across 5 packages)
pnpm test:critical   # @critical gate: MCP sampling / elicitation / capability tests only
```

Critical tests tag their `describe` block with `@critical` and run as a separate CI step before the full suite, so MCP contract regressions surface immediately.

---

## Keeping courses up to date

```bash
pnpm --filter sync-platzi exec playwright install chromium   # first time only
pnpm --filter sync-platzi sync
```

Opens a Chromium window for Platzi login on the first run, then headless thereafter. Writes `packages/shared/data/courses.json` with real completion dates and diploma URLs. Current data: 164 courses scraped 2026-05-16.

---

## Stack

Next.js 16 · React 19 · AI SDK 6 · MCP SDK 1 · TypeScript 5 · Tailwind 4 · shadcn/ui · Zod · Cal.com API · Resend · Vitest · Playwright · pnpm workspaces · Vercel
