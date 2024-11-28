import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  const db = await openDB();

  // Fetch items where shopping_list is set to 1
  const items = await db.all(
    "SELECT * FROM groceries WHERE shopping_list = 1 ORDER BY LOWER(category),LOWER(item)"
  );

  res.status(200).json(items);
}
export default protectedRoute(handler)