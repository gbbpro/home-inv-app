// migrate.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function migrate() {
  const db = await open({
    filename: "./home_inv.db",
    driver: sqlite3.Database,
  });

  // Add new column `pack_size` to groceries and supplies tables
  await db.run(`ALTER TABLE groceries ADD COLUMN pack_size TEXT`);
  await db.run(`ALTER TABLE supplies ADD COLUMN pack_size TEXT`);

  // Migrate data from `pack-size` to `pack_size`
  await db.run(`UPDATE groceries SET pack_size = "pack-size"`);
  await db.run(`UPDATE supplies SET pack_size = "pack-size"`);

  // Optional: Drop the old `pack-size` column
  console.log("Migration complete: Renamed pack-size to pack_size.");
  await db.close();
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
});
