import { withAuth } from "@/lib/api";
import { batch } from "@/lib/db";

export default withAuth(async (req, res) => {
  await batch([
    "UPDATE groceries SET shopping_list = 0 WHERE shopping_list = 1",
    "UPDATE supplies SET shopping_list = 0 WHERE shopping_list = 1",
  ]);
  res.status(200).json({ ok: true });
}, { methods: ["POST"] });
