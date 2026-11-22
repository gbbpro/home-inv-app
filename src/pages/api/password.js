import bcrypt from "bcryptjs";
import { withAuth, badRequest } from "@/lib/api";
import { get, run } from "@/lib/db";
import { passwordProblem } from "@/lib/passwords";

export default withAuth(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const problem = passwordProblem(newPassword);
  if (problem) return badRequest(res, problem);

  const user = await get("SELECT password_hash FROM users WHERE user_id = ?", [req.user.user_id]);
  if (!(await bcrypt.compare(String(currentPassword || ""), user.password_hash || ""))) {
    return badRequest(res, "Your current password isn't right.");
  }
  await run(
    "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
    [await bcrypt.hash(newPassword, 10), req.user.user_id]
  );
  res.status(200).json({ ok: true });
}, { methods: ["POST"] });

