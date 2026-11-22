// Copy everything from an old SQLite file into your Turso database.
//
//   npm run db:import -- ./home_inv.db
//
// Needs TURSO_DATABASE_URL and TURSO_AUTH_TOKEN (in your shell or .env.local).
// Rows keep their ids, so running it twice won't create duplicates.
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { openTarget, ensureSchema, toObjects } from "./_db.mjs";
import { normalizeDate } from "../src/lib/items.js";

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error("Usage: npm run db:import -- <path-to-old-sqlite-file>");
  process.exit(1);
}
if (!process.env.TURSO_DATABASE_URL) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN first (see README).");
  process.exit(1);
}

const source = createClient({ url: `file:${path.resolve(file)}` });
const { url, client: target } = openTarget();
await ensureSchema(target);

async function columns(client, table) {
  const info = toObjects(await client.execute(`PRAGMA table_info(${table})`));
  return info.map((c) => c.name);
}

const TABLES = ["groceries", "supplies", "completed_purchases", "users"];
for (const table of TABLES) {
  const srcCols = await columns(source, table);
  if (srcCols.length === 0) {
    console.log(`- ${table}: not in source, skipped`);
    continue;
  }
  const cols = (await columns(target, table)).filter((c) => srcCols.includes(c));
  const rows = toObjects(await source.execute(`SELECT ${cols.map((c) => `"${c}"`).join(", ")} FROM ${table}`));
  if (rows.length) {
    await target.batch(
      rows.map((r) => ({
        sql: `INSERT OR REPLACE INTO ${table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
        args: cols.map((c) =>
          table !== "users" && c === "date_purchased" && typeof r[c] === "string" ? normalizeDate(r[c].trim()) : r[c] ?? null
        ),
      })),
      "write"
    );
  }
  console.log(`- ${table}: ${rows.length} rows copied`);
}
console.log(`Done. Data is now in ${url.split("?")[0]}`);
