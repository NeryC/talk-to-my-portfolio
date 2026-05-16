# @neryc/portfolio-mcp

MCP server exposing Nery Cano's CV, projects, and verifiable Platzi courses.

## Testing

The full suite runs with:

```bash
pnpm test
```

### `@critical` convention

Tests covering the MCP contract surface — sampling, elicitation, and
capability negotiation — are tagged by wrapping their `describe` block name
with the `@critical` prefix:

```ts
describe("@critical pitch-for-role with sampling", () => { /* ... */ });
```

Currently 27 `@critical` tests live across 7 spec files:

| File | Count |
| --- | --- |
| `src/prompts/__tests__/pitch-for-role-sampling.test.ts` | 4 |
| `src/prompts/__tests__/tech-deep-dive-sampling.test.ts` | 4 |
| `src/prompts/__tests__/compare-with-jd-sampling.test.ts` | 6 |
| `src/prompts/__tests__/compare-with-jd-elicitation.test.ts` | 3 |
| `src/tools/__tests__/search-by-tech-sampling.test.ts` | 3 |
| `src/tools/__tests__/book-call-elicitation.test.ts` | 5 |
| `src/__tests__/capability-negotiation.test.ts` | 2 |

Run only the critical subset locally:

```bash
pnpm test:critical
```

This invokes `vitest run -t @critical` filtered to this package.

### CI gating

GitHub Actions (`.github/workflows/ci.yml`) runs `pnpm test:critical` as a
dedicated step **before** the full `pnpm test` step. A regression in any
`@critical` test blocks merges to `main`: the pipeline stops at the gate
step and surfaces the failure message clearly (e.g. `@critical sampling
test failed`) instead of being buried inside a 100+ test run.

When adding new tests that exercise MCP protocol contracts (sampling,
elicitation, capability negotiation, transport handshake), prefix the
`describe` name with `@critical` so they join the required check.
