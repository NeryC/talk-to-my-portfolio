# sync-platzi

Local-only script that scrapes Nery's Platzi public profile and `/dashboard/learning` to produce `packages/shared/data/courses.json`.

## What it does

1. Opens a persistent Chromium context (Playwright) pointed at `.platzi-session/`.
2. Visits `https://platzi.com/p/<username>/` and extracts course cards.
3. Visits `https://platzi.com/dashboard/learning` (requires login) and extracts completion dates + hours per slug.
4. Merges public + private by slug, applies `skills` fallback from the existing `courses.json`.
5. Writes the merged `courses.json` and prints a diff (`+added, -removed, total`).

## How to run

From the monorepo root:

```bash
pnpm install
pnpm --filter sync-platzi exec playwright install chromium
pnpm --filter sync-platzi sync
```

Or from inside this package:

```bash
pnpm sync
```

### First run (interactive login)

A visible Chromium window opens. Log in to Platzi, then press Enter in the terminal. The script proceeds to scrape and writes `packages/shared/data/courses.json`.

### Subsequent runs (headless)

The presence of `.platzi-session/Default` triggers headless mode automatically. You can also force headless with `--headless`.

If `playwright install chromium` is unavailable on this host (no network / no apt), run it from a machine with network access. The browser binary is required only for `pnpm sync` — unit tests pass without it because they use synthetic HTML fixtures.

## Output

- Writes `packages/shared/data/courses.json` with:
  - `syncedAt`: ISO timestamp of the run.
  - `source`: `"platzi-html-scrape-v1"`.
  - `courses[]`: `{slug, title, completedAt, hours, skills[], diplomaUrl, badgeImageUrl?}`.
- `skills[]` falls back to the prior `courses.json` values per slug. New courses get empty `skills`.

## Tests

```bash
pnpm test
```

Three test files cover scrape-public-profile, scrape-learning-dashboard, and merge. `auth.ts` has no unit test (real browser dependency); validate it manually by running `pnpm sync` once and confirming the visible-Chromium login flow.

## Legal

This script scrapes Nery's own Platzi profile using Nery's own login session. No third-party data is collected. Do not run against another user's profile.
