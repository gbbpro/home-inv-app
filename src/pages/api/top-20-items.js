import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  const db = await openDB();

  const topItems = await db.all("SELECT * FROM top_20_items");
  res.status(200).json(topItems);
}
export default protectedRoute(handler);
