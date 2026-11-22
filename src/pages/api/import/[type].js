import { withAuth, badRequest } from "@/lib/api";
import { batch } from "@/lib/db";
import { getType, cleanItem, ITEM_FIELDS } from "@/lib/items";

export const config = { api: { bodyParser: { sizeLimit: "2mb" } } };

export default withAuth(async (req, res) => {
  const type = getType(req.query.type);
  if (!type) return res.status(404).json({ error: "Unknown list" });
  const rows = req.body?.items;
  if (!Array.isArray(rows) || rows.length === 0) return badRequest(res, "No rows to import.");
  if (rows.length > 2000) return badRequest(res, "That file is too big — import up to 2,000 rows at a time.");

  const items = rows.map((r) => cleanItem(r)).filter((r) => r.item);
  if (items.length === 0) return badRequest(res, "None of the rows have an item name.");

  await batch(
    items.map((data) => ({
      sql: `INSERT INTO ${type.table} (${ITEM_FIELDS.join(", ")}, reminder_flag, shopping_list)
            VALUES (${ITEM_FIELDS.map(() => "?").join(", ")}, 0, 0)`,
      args: ITEM_FIELDS.map((f) => data[f]),
    }))
  );
  res.status(200).json({ imported: items.length, skipped: rows.length - items.length });
}, { methods: ["POST"] });
