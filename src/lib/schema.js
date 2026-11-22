// Table definitions. Safe to run on every start: everything is "IF NOT EXISTS".
// Kept free of path aliases so the scripts in /scripts can import it too.

const itemTable = (name) => `
  CREATE TABLE IF NOT EXISTS ${name} (
    id INTEGER PRIMARY KEY,
    item TEXT,
    item_variety TEXT,
    qty INTEGER,
    pack_size TEXT,
    cost REAL,
    date_purchased TEXT,
    remind_after INTEGER,
    reminder_flag BOOLEAN DEFAULT 0,
    category TEXT,
    shopping_list INTEGER DEFAULT 0
  )`;

export const SCHEMA = [
  itemTable("groceries"),
  itemTable("supplies"),
  `CREATE TABLE IF NOT EXISTS completed_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item TEXT,
    item_variety TEXT,
    qty INTEGER,
    pack_size TEXT,
    category TEXT,
    cost REAL,
    date_purchased DATE,
    source TEXT CHECK(source IN ('grocery', 'supply')),
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
];

export async function ensureSchema(client) {
  await client.batch(SCHEMA, "write");
}

// Turn a libSQL result into plain objects that serialize cleanly to JSON.
export function toObjects(result) {
  return result.rows.map((row) =>
    Object.fromEntries(result.columns.map((col, i) => [col, row[i]]))
  );
}
