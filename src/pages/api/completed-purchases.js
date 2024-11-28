// src/pages/api/completed-purchases.js
import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  if (req.method === "POST") {
    const db = await openDB();
    const { groceries, supplies } = req.body;

    try {
      // Insert groceries into completed_purchases
      for (const item of groceries) {
        await db.run(
          `INSERT INTO completed_purchases (item, item_variety, qty, pack_size, category, cost, date_purchased, source) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          item.item,
          item.item_variety,
          item.qty,
          item.pack_size,
          item.category,
          item.cost,
          item.date_purchased,
          "grocery"
        );
      }

      // Insert supplies into completed_purchases
      for (const item of supplies) {
        await db.run(
          `INSERT INTO completed_purchases (item, item_variety, qty, pack_size, category, cost, date_purchased, source) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          item.item,
          item.item_variety,
          item.qty,
          item.pack_size,
          item.category,
          item.cost,
          item.date_purchased,
          "supply"
        );
      }

      res
        .status(201)
        .json({ message: "Completed purchases saved successfully" });
    } catch (error) {
      console.error("Error saving completed purchases:", error);
      res.status(500).json({ error: "Failed to save completed purchases" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
export default protectedRoute(handler);
