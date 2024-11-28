const fs = require('fs');
const path = require('path');
let Database;

if (typeof window === "undefined") {
  Database = require("better-sqlite3");
}

const dbPath = path.join(__dirname, 'home_inv.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = Database ? new Database(dbPath, { verbose: console.log }) : null;

if (db && !fs.existsSync(dbPath)) {
  // If database does not exist, apply schema
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log("Database and tables created successfully.");
} else if (db) {
  console.log("Database already exists. Skipping schema creation.");
}

module.exports = db;
