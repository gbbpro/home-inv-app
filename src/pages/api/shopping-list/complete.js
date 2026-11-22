import { withAuth, badRequest } from "@/lib/api";
import { batch } from "@/lib/db";
import { TYPES } from "@/lib/items";

// Records the checked-off items as a completed trip, marks them as bought
// today, and takes them off the shopping list. Unchecked items stay on it.
export default withAuth(async (req, res) => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(req.body?.date || "")
    ? req.body.date
    : new Date().toISOString().slice(0, 10);

  const statements = [];
  let count = 0;
  for (const [key, type] of Object.entries(TYPES)) {
    const ids = (req.body?.[key] || []).map(Number).filter(Number.isInteger);
    if (ids.length === 0) continue;
    count += ids.length;
    const marks = ids.map(() => "?").join(", ");
    statements.push(
      {
        sql: `INSERT INTO completed_purchases
                (item, item_variety, qty, pack_size, category, cost, date_purchased, source)
              SELECT item, item_variety, qty, pack_size, category, cost, ?, ?
              FROM ${type.table} WHERE id IN (${marks})`,
        args: [date, type.source, ...ids],
      },
      {
        sql: `UPDATE ${type.table} SET date_purchased = ?, shopping_list = 0 WHERE id IN (${marks})`,
        args: [date, ...ids],
      }
    );
  }
  if (count === 0) return badRequest(res, "Check off what you bought first.");
  await batch(statements);
  res.status(200).json({ completed: count });
}, { methods: ["POST"] });
