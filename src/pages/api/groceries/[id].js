// src/pages/api/groceries/[id].js
import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  const db = await openDB();
  const { id } = req.query;

  if (req.method === "GET") {
    const item = await db.get("SELECT * FROM groceries WHERE id = ?", id);
    item
      ? res.status(200).json(item)
      : res.status(404).json({ error: "Item not found" });
  } else if (req.method === "PUT") {
    const {
      item,
      item_variety,
      qty,
      date_purchased,
      cost,
      remind_after,
      category,
      shopping_list,
      pack_size,
    } = req.body;

    // Run a dynamic update, updating only the fields provided in the body
    await db.run(
      `UPDATE groceries 
       SET item = COALESCE(?, item),
           item_variety = COALESCE(?, item_variety),
           qty = COALESCE(?, qty),
           date_purchased = COALESCE(?, date_purchased),
           cost = COALESCE(?, cost),
           remind_after = COALESCE(?, remind_after),
           category = COALESCE(?, category),
           shopping_list = COALESCE(?, shopping_list),
           pack_size = COALESCE(?, pack_size)
       WHERE id = ?`,
      item,
      item_variety,
      qty,
      date_purchased,
      cost,
      remind_after,
      category,
      shopping_list,
      pack_size,
      id
    );

    res.status(200).json({ message: "Item updated successfully" });
  } else if (req.method === "DELETE") {
    await db.run("DELETE FROM groceries WHERE id = ?", id);
    res.status(200).json({ message: "Item deleted successfully" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
export default protectedRoute(handler);
