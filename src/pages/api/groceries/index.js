// src/pages/api/groceries/index.js
import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  const db = await openDB();

  // Handle GET request - Fetch groceries or filter by category
  if (req.method === "GET") {
    const { category } = req.query;

    // Add ORDER BY item to sort the results alphabetically
    const query = category
      ? "SELECT * FROM groceries WHERE category = ? ORDER BY LOWER(item), LOWER(item_variety)"
      : "SELECT * FROM groceries ORDER BY category, LOWER(item), LOWER(item_variety)";

    const items = category
      ? await db.all(query, category)
      : await db.all(query);

    res.status(200).json(items);
  }

  // Handle POST request - Insert new grocery item
  else if (req.method === "POST") {
    const {
      item,
      item_variety,
      qty,
      date_purchased,
      cost,
      remind_after,
      category,
      pack_size,
    } = req.body;

    try {
      const result = await db.run(
        "INSERT INTO groceries (item, item_variety, qty, date_purchased, cost, remind_after, reminder_flag, category,pack_size) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)",
        item,
        item_variety,
        qty,
        date_purchased,
        cost,
        remind_after,
        0, // reminder_flag default value
        category,
        pack_size
      );

      res.status(201).json({
        id: result.lastID,
        item,
        item_variety,
        qty,
        date_purchased,
        cost,
        remind_after,
        category,
        pack_size,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to insert item into groceries" });
    }
  }
  // Handle PUT request - Update grocery item
  else if (req.method === "PUT") {
    const {
      id,
      qty,
      pack_size,
      cost,
      remind_after,
      reminder_flag,
      shopping_list,
    } = req.body;

    try {
      await db.run(
        "UPDATE groceries SET qty = COALESCE(?, qty), cost = COALESCE(?, cost),pack_size COALESCE(?, pack_size), remind_after = COALESCE(?, remind_after), reminder_flag = COALESCE(?, reminder_flag), shopping_list = COALESCE(?, shopping_list) WHERE id = ?",
        qty,
        cost,
        pack_size,
        remind_after,
        reminder_flag,
        shopping_list,
        id
      );

      res.status(200).json({ message: "Item updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  }
  // Handle other methods (e.g., DELETE, etc.)
  else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
export default protectedRoute(handler);
