const Database = require('better-sqlite3');
const db = new Database('home-inv.db');

module.exports = db;
async function createViews() {
  const db = await openDB();

  // Top 20 Items View
  await db.exec(`
    CREATE VIEW IF NOT EXISTS top_20_items AS
    SELECT 
        item, 
        item_variety, 
        COUNT(*) AS purchase_count, 
        SUM(qty) AS total_qty, 
        category 
    FROM 
        completed_purchases
    GROUP BY 
        item, item_variety, category
    ORDER BY 
        purchase_count DESC, total_qty DESC
    LIMIT 20;
  `);

  // Purchase Dates View
  await db.exec(`
    CREATE VIEW IF NOT EXISTS purchase_dates AS
    SELECT 
        DISTINCT DATE(completed_at) AS purchase_date 
    FROM 
        completed_purchases
    ORDER BY 
        purchase_date DESC;
  `);

  // Purchases By Date View
  await db.exec(`
    CREATE VIEW IF NOT EXISTS purchases_by_date AS
    SELECT 
        DATE(completed_at) AS purchase_date, 
        item, 
        item_variety, 
        qty, 
        cost, 
        category 
    FROM 
        completed_purchases
    ORDER BY 
        purchase_date DESC, category;
  `);

  // Category Totals View
  await db.exec(`
    CREATE VIEW IF NOT EXISTS category_totals AS
    SELECT 
        category, 
        SUM(qty) AS total_qty, 
        SUM(cost) AS total_spent
    FROM 
        completed_purchases
    GROUP BY 
        category
    ORDER BY 
        total_spent DESC;
  `);
}

createViews()
  .then(() => console.log("Views created successfully"))
  .catch((err) => console.error("Error creating views:", err));
