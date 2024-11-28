// seed_data.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./home_inv.db");

db.serialize(() => {
  db.run(
    "INSERT INTO supplies (item, item_variety, qty, date_purchased, cost, remind_after_days, reminder_flag, category) VALUES ('All-Purpose Cleaner', 'Lemon Scent', 2, '2024-10-05', 3.99, 30, 0, 'cleaning')"
  );
  db.run(
    "INSERT INTO groceries (item, item_variety, qty, date_purchased, cost, remind_after_days, reminder_flag, category) VALUES ('Apple', 'Granny Smith', 10, '2024-11-03', 5.00, 7, 0, 'fruits')"
  );
  // Add more db.run statements for each entry
});

db.close();
