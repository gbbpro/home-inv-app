import { withAuth, badRequest } from "@/lib/api";
import { get, run } from "@/lib/db";
import { getType, cleanItem } from "@/lib/items";

export default withAuth(async (req, res) => {
  const type = getType(req.query.type);
  if (!type) return res.status(404).json({ error: "Unknown list" });
  const id = Number(req.query.id);

  if (req.method === "DELETE") {
    await run(`DELETE FROM ${type.table} WHERE id = ?`, [id]);
    return res.status(200).json({ ok: true });
  }

  // PUT: update only the fields that were sent
  const updates = cleanItem(req.body, { partial: true });
  if ("shopping_list" in (req.body || {})) updates.shopping_list = req.body.shopping_list ? 1 : 0;
  if ("item" in updates && !updates.item) return badRequest(res, "Give the item a name.");
  const fields = Object.keys(updates);
  if (fields.length === 0) return badRequest(res, "Nothing to update.");

  const { changes } = await run(
    `UPDATE ${type.table} SET ${fields.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`,
    [...fields.map((f) => updates[f]), id]
  );
  if (!changes) return res.status(404).json({ error: "That item no longer exists." });
  res.status(200).json(await get(`SELECT * FROM ${type.table} WHERE id = ?`, [id]));
}, { methods: ["PUT", "DELETE"] });
