import { chromium, type BrowserContext } from "playwright";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Session lives at <package-root>/.platzi-session (sibling of src/, dist/)
const SESSION_DIR = join(__dirname, "..", ".platzi-session");

export interface AuthedContext {
  context: BrowserContext;
  alreadyLoggedIn: boolean;
  sessionDir: string;
}

export async function openAuthedContext(opts: { headless: boolean }): Promise<AuthedContext> {
  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: opts.headless,
    viewport: { width: 1280, height: 800 },
  });

  const page = context.pages()[0] ?? await context.newPage();
  await page.goto("https://platzi.com/me/", { waitUntil: "networkidle" });
  const url = page.url();
  const alreadyLoggedIn = !url.includes("/login") && !url.includes("/auth");

  if (!alreadyLoggedIn) {
    process.stderr.write(
      "[sync-platzi] Please log in to Platzi in the opened Chromium window. " +
      "Press Enter here when done.\n",
    );
    await new Promise<void>((resolve) => process.stdin.once("data", () => resolve()));
    await page.goto("https://platzi.com/me/", { waitUntil: "networkidle" });
  }
  return { context, alreadyLoggedIn, sessionDir: SESSION_DIR };
}
