import { openDB } from "@/lib/db";
import { protectedRoute } from "@/middlewares/protectedRoute";

async function handler(req, res) {
  const db = await openDB();

  const dates = await db.all("SELECT * FROM purchase_dates");
  res.status(200).json(dates);
}
export default protectedRoute(handler)
