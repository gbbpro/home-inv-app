import bcrypt from "bcryptjs";
import { withAuth, badRequest } from "@/lib/api";
import { all, get, run } from "@/lib/db";
import { passwordProblem } from "@/lib/passwords";

export default withAuth(async (req, res) => {
  if (req.method === "GET") {
    const users = await all(
      "SELECT user_id, username, created_at FROM users ORDER BY lower(username)"
    );
    return res.status(200).json(users);
  }

  // POST: add a household member
  const username = String(req.body?.username || "").trim();
  const { password } = req.body || {};
  if (!/^[A-Za-z0-9._-]{2,32}$/.test(username)) {
    return badRequest(res, "Usernames need 2–32 letters, numbers, dots, dashes or underscores.");
  }
  const problem = passwordProblem(password);
  if (problem) return badRequest(res, problem);
  if (await get("SELECT 1 FROM users WHERE lower(username) = lower(?)", [username])) {
    return badRequest(res, "Someone already has that username.");
  }
  const { lastId } = await run(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, await bcrypt.hash(password, 10)]
  );
  res.status(201).json({ user_id: lastId, username });
}, { methods: ["GET", "POST"] });
