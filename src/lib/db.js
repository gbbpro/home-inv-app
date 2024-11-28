// src/lib/db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function openDB() {
  return open({
    filename: "./home_inv.db",
    driver: sqlite3.Database,
  });
}
