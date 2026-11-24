import { withAuth, badRequest } from "@/lib/api";
import { get } from "@/lib/db";
import { TYPES, normalizeUpc } from "@/lib/items";
import { lookupBarcode } from "@/lib/upc-lookup";

// GET /api/upc/0123456789012
// → { code, match: { type, item } }   if it's already in your inventory
// → { code, product: {...} }          if a product database knows it
// → { code }                          if nobody knows it
export default withAuth(async (req, res) => {
  const code = normalizeUpc(req.query.code);
  if (!code) return badRequest(res, "That doesn't look like a barcode number.");

  for (const [type, meta] of Object.entries(TYPES)) {
    const item = await get(`SELECT * FROM ${meta.table} WHERE upc = ? ORDER BY id LIMIT 1`, [code]);
    if (item) return res.status(200).json({ code, match: { type, item } });
  }

  const product = await lookupBarcode(code);
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.status(200).json(product ? { code, product } : { code });
}, { methods: ["GET"] });
