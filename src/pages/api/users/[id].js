import bcrypt from "bcryptjs";
import { withAuth, badRequest } from "@/lib/api";
import { get, run } from "@/lib/db";
import { passwordProblem } from "@/lib/passwords";

// PUT: set a new password for a household member. DELETE: remove them.
export default withAuth(async (req, res) => {
  const id = Number(req.query.id);
  const member = await get("SELECT user_id, username FROM users WHERE user_id = ?", [id]);
  if (!member) return res.status(404).json({ error: "That person isn't in your household." });

  if (req.method === "PUT") {
    const problem = passwordProblem(req.body?.password);
    if (problem) return badRequest(res, problem);
    await run(
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
      [await bcrypt.hash(req.body.password, 10), id]
    );
    return res.status(200).json({ ok: true });
  }

  if (id === req.user.user_id) return badRequest(res, "You can't remove yourself.");
  await run("DELETE FROM users WHERE user_id = ?", [id]);
  res.status(200).json({ ok: true });
}, { methods: ["PUT", "DELETE"] });
