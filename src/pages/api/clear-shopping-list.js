// src/pages/api/clear-shopping-list.js
import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  if (req.method === "POST") {
    const db = await openDB();

    try {
      // Clear shopping list flag for groceries
      await db.run(
        `UPDATE groceries SET shopping_list = 0 WHERE shopping_list = 1`
      );

      // Clear shopping list flag for supplies
      await db.run(
        `UPDATE supplies SET shopping_list = 0 WHERE shopping_list = 1`
      );

      res.status(200).json({ message: "Shopping list cleared successfully" });
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      res.status(500).json({ error: "Failed to clear shopping list" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
export default protectedRoute(handler);
