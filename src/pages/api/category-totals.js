import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  const db = await openDB();

  const categories = await db.all("SELECT * FROM category_totals");
  res.status(200).json(categories);
}
export default protectedRoute(handler)
