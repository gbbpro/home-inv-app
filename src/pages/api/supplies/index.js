// Example in src/pages/api/supplies/[id].js
import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  const db = await openDB();
  const { id } = req.query;

  if (req.method === "PUT") {
    const { qty, cost, pack_size, remind_after, reminder_flag, shopping_list } =
      req.body;
    await db.run(
      "UPDATE supplies SET qty = COALESCE(?, qty), cost = COALESCE(?, cost), pack_size = COALESCE(?, pack_size), remind_after = COALESCE(?, remind_after_days), reminder_flag = COALESCE(?, reminder_flag), shopping_list = COALESCE(?, shopping_list) WHERE id = ?",
      qty,
      cost,
      pack_size,
      remind_after,
      reminder_flag,
      shopping_list,
      id
    );
    res.status(200).json({ message: "Item updated successfully" });
  }
  // Handle other methods as needed
  else if (req.method === "GET") {
    const { category } = req.query;

    // Add ORDER BY item to sort the results alphabetically
    const query = category
      ? "SELECT * FROM supplies WHERE category = ? ORDER BY LOWER(item),LOWER(item_variety)"
      : "SELECT * FROM supplies ORDER BY category, LOWER(item), LOWER(item_variety)";

    const items = category
      ? await db.all(query, category)
      : await db.all(query);

    res.status(200).json(items);
  } else if (req.method === "POST") {
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
    const result = await db.run(
      "INSERT INTO supplies (item, item_variety, qty, date_purchased, cost, remind_after, reminder_flag, category, pack_size) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)",
      item,
      item_variety,
      qty,
      date_purchased,
      cost,
      remind_after,
      0,
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
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
export default protectedRoute(handler);
