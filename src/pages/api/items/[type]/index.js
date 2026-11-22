import { withAuth, badRequest } from "@/lib/api";
import { all, run } from "@/lib/db";
import { getType, cleanItem, ITEM_FIELDS } from "@/lib/items";

export default withAuth(async (req, res) => {
  const type = getType(req.query.type);
  if (!type) return res.status(404).json({ error: "Unknown list" });

  if (req.method === "GET") {
    const items = await all(
      `SELECT * FROM ${type.table}
       ORDER BY category IS NULL, lower(category), lower(item), lower(item_variety)`
    );
    return res.status(200).json(items);
  }

  const data = cleanItem(req.body);
  if (!data.item) return badRequest(res, "Give the item a name.");
  const { lastId } = await run(
    `INSERT INTO ${type.table} (${ITEM_FIELDS.join(", ")}, reminder_flag, shopping_list)
     VALUES (${ITEM_FIELDS.map(() => "?").join(", ")}, 0, ?)`,
    [...ITEM_FIELDS.map((f) => data[f]), req.body?.shopping_list ? 1 : 0]
  );
  res.status(201).json({ id: lastId, ...data });
}, { methods: ["GET", "POST"] });
