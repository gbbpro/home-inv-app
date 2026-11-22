import { withAuth } from "@/lib/api";
import { all } from "@/lib/db";

export default withAuth(async (req, res) => {
  const query = (table) =>
    all(
      `SELECT * FROM ${table} WHERE shopping_list = 1
       ORDER BY category IS NULL, lower(category), lower(item)`
    );
  const [groceries, supplies] = await Promise.all([query("groceries"), query("supplies")]);
  res.status(200).json({ groceries, supplies });
}, { methods: ["GET"] });
