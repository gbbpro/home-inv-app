import bcrypt from "bcryptjs";
import { get } from "@/lib/db";
import { createToken, sessionCookie } from "@/lib/session";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  if (!username || !password) {
    return res.status(400).json({ error: "Enter your username and password." });
  }
  try {
    const user = await get(
      "SELECT username, password_hash FROM users WHERE lower(username) = lower(?)",
      [username]
    );
    const ok = user && (await bcrypt.compare(password, user.password_hash || ""));
    if (!ok) return res.status(401).json({ error: "That username and password don't match." });

    res.setHeader("Set-Cookie", sessionCookie(await createToken(user.username)));
    res.status(200).json({ username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't log in right now. Please try again." });
  }
}
