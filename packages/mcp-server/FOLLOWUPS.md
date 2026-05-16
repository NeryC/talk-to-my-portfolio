# Phase 2 Follow-ups

Deferred improvements identified while implementing Tasks 2.1–2.7 (commits `9ed19a4` → `e7f209d`). Each entry notes the blocking phase — i.e., the latest point at which it should be addressed.

## 1. Exclude tests from the published bundle

**Severity:** Important
**File:** `packages/mcp-server/tsconfig.json`
**Blocking-phase:** Phase 8 (publish)

The current `tsconfig.json` compiles `src/__tests__/**/*.test.ts` into `dist/`, and `package.json` declares `"files": ["dist", "data", "README.md"]`, so test files would be shipped to npm consumers.

Fix: add `"exclude": ["src/**/*.test.ts", "src/**/__tests__/**"]` to `tsconfig.json`, or create a separate `tsconfig.build.json` that the `build` script targets instead.

## 2. Fix project seed data so `searchByTech` tests can revert to plan literals

**Severity:** Minor
**File:** `packages/shared/data/projects/_index.json`
**Blocking-phase:** optional, before Phase 5/6 (when real project metadata gets revisited)

The seed `_index.json` is missing `"TypeScript"` and `"React"` tokens even though all three projects are Next.js (React-based) TypeScript apps. Two assertions in `packages/mcp-server/src/tools/__tests__/search-by-tech.test.ts` were adapted in commit `9ad30e0` to match the partial seed data instead of the plan literals.

Fix:
- Add `"TypeScript"` to `rag-agent-memory.stack`.
- Add `"React 19"` (verify the actual version against each project's `package.json`) to all three project stacks.
- Revert the two test assertions to the plan literals.
- Remove the deviation comment block at the top of the test file.

## 3. Move imperative-verb description check to a registry-wide test

**Severity:** Minor
**File:** `packages/mcp-server/src/tools/__tests__/list-projects.test.ts` (around line 32)
**Blocking-phase:** none (cosmetic)

The test asserts that the `listProjects` description matches `/^(List|Get|Return)/`, but the same convention is not enforced for the other six tools, and the regex misses common starts like `Search` and `Find`.

Fix: move the assertion into `packages/mcp-server/src/__tests__/server-tools.test.ts`, looping over `callListTools(buildServer()).tools` with a regex like `/^(List|Get|Return|Search|Find)/`. Alternatively, drop the test if the convention isn't worth enforcing.

## 4. Decide README vs case-study URI duplication

**Severity:** Important
**File:** `packages/mcp-server/src/resources/index.ts:51-64`
**Blocking-phase:** before Phase 4 (when external clients start consuming resources)

Both `portfolio://projects/<slug>/readme` and `portfolio://projects/<slug>/case-study` URIs resolve to the same `loadProjectCaseStudy(slug)` call — there is no separate README data in the seed. LLM consumers reading both will see identical content and notice the duplication.

Options:
- **(a)** Add separate `<slug>.readme.md` files in seed data plus a `loadProjectReadme` loader.
- **(b)** Collapse to a single URI scheme until real README data exists.
- **(c)** Document the aliasing as intentional with an inline comment.

Pick before any external client starts consuming the resource list.

## 5. Thread `server` (sampling client) into prompt and tool handlers

**Severity:** High (expected to be addressed by Phase 3 itself)
**File:** handler signatures in `packages/mcp-server/src/tools/*` and `packages/mcp-server/src/prompts/*`
**Blocking-phase:** Phase 3 Task 3.5 (wire sampling/elicitation bridges)

Today `tool.execute(args)` and `getPrompt({ name, arguments })` are pure functions with no access to the `Server` instance, so they cannot call `server.createMessage(...)` for sampling or `server.elicitInput(...)` for elicitation. Phase 3 will need to inject `server` (or a `samplingClient` wrapper) into handler signatures.

Fix: introduce a context parameter and refactor the registry to accept either pure or context-aware handlers, so existing handlers don't all need to change at once.

## 6. `__resetDataLoaderCache()` is a dead export

**Severity:** Low
**File:** `packages/shared/src/data-loader.ts:80-87`
**Blocking-phase:** none

The helper is exported but no test currently uses it. Either wire it into a `beforeEach` where it's actually needed (Phase 3's `MockMcpClient` tests are a likely candidate), or delete it.

## 7. Extract tool registry to its own file

**Severity:** Low
**File:** `packages/mcp-server/src/server.ts:44-52`
**Blocking-phase:** optional, before Phase 4 (when two more tools land)

The 7-element `tools` array is hard-coded inside `buildServer()`. Adding tools in Phase 4 will keep touching this file.

Fix: create `packages/mcp-server/src/tools/index.ts` that exports the registry array, mirroring how `prompts/index.ts` colocates its registry.
