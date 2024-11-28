// src/pages/api/update-date-purchased.js
import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  if (req.method === "POST") {
    const db = await openDB();

    try {
      // Fetch completed purchases with the most recent completion date
      const completedItems = await db.all(`
        SELECT item, completed_at, source 
        FROM completed_purchases 
        GROUP BY item, source
      `);

      // Update date_purchased in groceries and supplies tables based on the completed_at date
      for (const item of completedItems) {
        const { item: itemName, completed_at, source } = item;

        if (source === "grocery") {
          await db.run(
            `UPDATE groceries SET date_purchased = ? WHERE item = ?`,
            completed_at,
            itemName
          );
        } else if (source === "supply") {
          await db.run(
            `UPDATE supplies SET date_purchased = ? WHERE item = ?`,
            completed_at,
            itemName
          );
        }
      }

      res.status(200).json({ message: "Date purchased updated successfully" });
    } catch (error) {
      console.error("Error updating date purchased:", error);
      res.status(500).json({ error: "Failed to update date purchased" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
export default protectedRoute(handler)