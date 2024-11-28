import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  try {
    const db = await openDB();

    const insertPromises = items.map((item) =>
      db.run(
        `INSERT INTO supplies (item, item_variety, qty, date_purchased, cost, remind_after, category, pack_size) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.item,
          item.item_variety || null,
          item.qty || 0,
          item.date_purchased || null,
          item.cost || 0,
          item.remind_after || 30,
          item.category || "Uncategorized",
          item.pack_size || null,
        ]
      )
    );

    await Promise.all(insertPromises);

    res.status(200).json({ message: "Items uploaded successfully" });
  } catch (error) {
    console.error("Error inserting items:", error);
    res.status(500).json({ error: "Failed to upload items" });
  }
}
export default protectedRoute(handler);
