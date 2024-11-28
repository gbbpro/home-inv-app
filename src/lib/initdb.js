// src/lib/db.js
const Database = require('better-sqlite3');
const db = new Database('home-inv.db');

module.exports = db;
