// Helpers for API routes.
import { get } from "./db.js";
import { readToken, COOKIE_NAME } from "./session.js";

// Wraps an API handler: checks the HTTP method, requires a logged-in user
// who still exists, and turns unexpected errors into a clean 500.
export function withAuth(handler, { methods } = {}) {
  return async (req, res) => {
    if (methods && !methods.includes(req.method)) {
      res.setHeader("Allow", methods.join(", "));
      return res.status(405).json({ error: "Method not allowed" });
    }
    try {
      const session = await readToken(req.cookies?.[COOKIE_NAME]);
      const user =
        session &&
        (await get("SELECT user_id, username FROM users WHERE username = ?", [
          session.username,
        ]));
      if (!user) return res.status(401).json({ error: "Please log in." });
      req.user = user;
      await handler(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Something went wrong. Please try again." });
      }
    }
  };
}

export function badRequest(res, message) {
  return res.status(400).json({ error: message });
}
