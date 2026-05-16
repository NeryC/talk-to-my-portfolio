#!/usr/bin/env node
import { runSync } from "./sync.js";

runSync().catch((err) => {
  console.error("[sync-platzi]", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
