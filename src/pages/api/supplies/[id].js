// src/pages/api/supplies/[id].js
import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  const db = await openDB();
  const { id } = req.query;

  if (req.method === "PUT") {
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

    console.log("Received data for update:", req.body);

    try {
      const result = await db.run(
        `UPDATE supplies 
         SET item = COALESCE(?, item),
             item_variety = COALESCE(?, item_variety),
             qty = COALESCE(?, qty),
             date_purchased = COALESCE(?, date_purchased),
             cost = COALESCE(?, cost),
             remind_after = COALESCE(?, remind_after),
             category = COALESCE(?, category),
             shopping_list = COALESCE(?, shopping_list),
             pack_size = COALESCE(?,pack_size)
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

      console.log("Database update result:", result); // Check update result
      res.status(200).json({ message: "Item updated successfully" });
    } catch (error) {
      console.error("Error updating item in database:", error);
      res.status(500).json({ error: "Failed to update item" });
    }
  } else if (req.method === "DELETE") {
    await db.run("DELETE FROM supplies WHERE id = ?", id);
    res.status(200).json({ message: "Item deleted successfully" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
export default protectedRoute(handler)