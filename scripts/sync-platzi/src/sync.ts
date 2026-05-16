import { openAuthedContext } from "./auth.js";
import { extractPublicCourses } from "./scrape-public-profile.js";
import { extractCompletedCourseMeta } from "./scrape-learning-dashboard.js";
import { mergeCourses } from "./merge.js";
import { CourseFileSchema } from "@neryc/portfolio-shared";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(__dirname, "..");
const REPO_ROOT = join(PACKAGE_ROOT, "..", "..");
const COURSES_JSON = join(REPO_ROOT, "packages", "shared", "data", "courses.json");
const SESSION_DEFAULT = join(PACKAGE_ROOT, ".platzi-session", "Default");

const USERNAME = process.env.PLATZI_USERNAME ?? "neryc";

interface ExistingCourse {
  slug: string;
  skills?: string[];
}

function loadExistingSkills(): Record<string, string[]> {
  if (!existsSync(COURSES_JSON)) return {};
  try {
    const parsed = JSON.parse(readFileSync(COURSES_JSON, "utf-8")) as { courses?: ExistingCourse[] };
    const map: Record<string, string[]> = {};
    for (const c of parsed.courses ?? []) {
      if (c.skills?.length) map[c.slug] = c.skills;
    }
    return map;
  } catch {
    return {};
  }
}

export async function runSync(): Promise<void> {
  const headlessFlag = process.argv.includes("--headless");
  const headless = headlessFlag || existsSync(SESSION_DEFAULT);

  process.stderr.write(`[sync-platzi] starting (headless=${headless}, username=${USERNAME})\n`);

  const { context } = await openAuthedContext({ headless });
  const page = await context.newPage();

  try {
    process.stderr.write("[sync-platzi] scraping public profile...\n");
    await page.goto(`https://platzi.com/p/${USERNAME}/`, { waitUntil: "networkidle" });
    const publicHtml = await page.content();
    const publicCourses = extractPublicCourses(publicHtml, USERNAME);
    process.stderr.write(`[sync-platzi] found ${publicCourses.length} courses on public profile\n`);

    process.stderr.write("[sync-platzi] scraping /dashboard/learning...\n");
    await page.goto("https://platzi.com/dashboard/learning", { waitUntil: "networkidle" });
    const privateHtml = await page.content();
    const privateMeta = extractCompletedCourseMeta(privateHtml);
    process.stderr.write(`[sync-platzi] found ${privateMeta.length} completed courses on dashboard\n`);

    const fallbackSkills = loadExistingSkills();
    const merged = mergeCourses(publicCourses, privateMeta, fallbackSkills);

    const file = CourseFileSchema.parse({
      syncedAt: new Date().toISOString(),
      source: "platzi-html-scrape-v1",
      courses: merged,
    });

    // Diff vs prior
    let diff = "(new file)";
    if (existsSync(COURSES_JSON)) {
      const prev = JSON.parse(readFileSync(COURSES_JSON, "utf-8")).courses as ExistingCourse[];
      const added = merged.filter((c) => !prev.find((p) => p.slug === c.slug));
      const removed = prev.filter((p) => !merged.find((c) => c.slug === p.slug));
      diff = `+${added.length} added, -${removed.length} removed, total ${merged.length}`;
    }

    mkdirSync(dirname(COURSES_JSON), { recursive: true });
    writeFileSync(COURSES_JSON, JSON.stringify(file, null, 2) + "\n");
    process.stderr.write(`[sync-platzi] wrote ${merged.length} courses to ${COURSES_JSON}\n[sync-platzi] diff: ${diff}\n`);
  } finally {
    await context.close();
  }
}
