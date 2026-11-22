// Database access. Uses Turso (hosted SQLite) when TURSO_DATABASE_URL is set,
// otherwise a local SQLite file for development.
import { createClient } from "@libsql/client";
import { ensureSchema, toObjects } from "./schema.js";

let client;
let ready;

function getClient() {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL;
  if (!url && process.env.NODE_ENV === "production") {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Add it (and TURSO_AUTH_TOKEN) in your Vercel project's Environment Variables."
    );
  }
  client = createClient({
    url: url || "file:home_inv.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return client;
}

async function connect() {
  const c = getClient();
  if (!ready) {
    ready = ensureSchema(c).catch((err) => {
      ready = null;
      throw err;
    });
  }
  await ready;
  return c;
}

export async function all(sql, args = []) {
  const c = await connect();
  return toObjects(await c.execute({ sql, args }));
}

export async function get(sql, args = []) {
  return (await all(sql, args))[0] ?? null;
}

export async function run(sql, args = []) {
  const c = await connect();
  const r = await c.execute({ sql, args });
  return {
    changes: r.rowsAffected,
    lastId: r.lastInsertRowid != null ? Number(r.lastInsertRowid) : null,
  };
}

// Run several statements in one transaction.
export async function batch(statements) {
  const c = await connect();
  return c.batch(statements, "write");
}
