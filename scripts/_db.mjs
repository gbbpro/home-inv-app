// Shared setup for the command-line scripts.
import fs from "node:fs";
import { createClient } from "@libsql/client";
import { ensureSchema, toObjects } from "../src/lib/schema.js";

// Load .env.local / .env so scripts see the same settings as the app.
// Within a file the last line for a setting wins, "export NAME=" works, and
// placeholders such as "[SENSITIVE]" (written by `vercel env pull`) are ignored.
// Values already set in your shell always take priority.
const fromShell = new Set(Object.keys(process.env));
for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || fromShell.has(m[1])) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, "$2");
    if (!value || /^\[[A-Z_ ]+\]$/.test(value)) continue;
    if (file === ".env" && process.env[m[1]] !== undefined) continue; // .env.local wins
    process.env[m[1]] = value;
  }
}

export function openTarget() {
  const url = process.env.TURSO_DATABASE_URL || "file:home_inv.db";
  if (!/^(libsql|https?|wss?|file):/.test(url)) {
    console.error(
      `TURSO_DATABASE_URL doesn't look right: "${url.slice(0, 30)}"\n` +
        "It should start with libsql://. Check .env.local (only one TURSO_DATABASE_URL line)."
    );
    process.exit(1);
  }
  return { url, client: createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }) };
}

export { ensureSchema, toObjects };
