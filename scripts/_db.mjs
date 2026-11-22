// Shared setup for the command-line scripts.
import fs from "node:fs";
import { createClient } from "@libsql/client";
import { ensureSchema, toObjects } from "../src/lib/schema.js";

// Load .env.local / .env so scripts see the same settings as the app.
for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
}

export function openTarget() {
  const url = process.env.TURSO_DATABASE_URL || "file:home_inv.db";
  return { url, client: createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }) };
}

export { ensureSchema, toObjects };
