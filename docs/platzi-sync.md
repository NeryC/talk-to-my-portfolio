# Platzi Sync

The `scripts/sync-platzi/` package scrapes Nery's Platzi profile + dashboard to populate `packages/shared/data/courses.json` with real, dated course data.

## How to run

From the monorepo root:

```bash
pnpm install
pnpm --filter sync-platzi exec playwright install chromium
pnpm --filter sync-platzi sync
```

First run: visible Chromium opens. Log in to Platzi. Press Enter in the terminal. The script proceeds to scrape and writes `packages/shared/data/courses.json`.

Subsequent runs: detect `.platzi-session/Default` and run headless. Add `--headless` to force headless even on first run (will fail if not logged in).

## What it writes

- `syncedAt`: ISO timestamp of the run.
- `source`: `"platzi-html-scrape-v1"` (vs the mock `"mock-seed-pre-sync"`).
- `courses`: array of `{slug, title, completedAt, hours, skills[], diplomaUrl, badgeImageUrl?}`.

`skills[]` falls back to the existing courses.json values when a course's slug already exists. New courses get empty `skills`; populate manually if needed.

## Troubleshooting

- **Cookies expired:** delete `.platzi-session/` and re-run; will trigger interactive login again.
- **Layout changed:** Platzi may update its HTML; if `extractPublicCourses` returns 0, recapture `src/__fixtures__/public-profile.html` from the live page and adjust selectors in `scrape-public-profile.ts` until tests pass.
- **Zod validation fails:** the script throws before writing; the existing `courses.json` is preserved.

## Legal

This script scrapes Nery's own Platzi profile using Nery's own login session. No third-party data is collected. Don't run against other users' profiles.
