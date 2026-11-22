// Set a new password for someone (or create the account if it doesn't exist).
//
//   npm run reset-password -- <username> <new-password>
//
// Uses TURSO_DATABASE_URL / TURSO_AUTH_TOKEN from your shell or .env.local,
// otherwise the local home_inv.db file.
import bcrypt from "bcryptjs";
import { openTarget, ensureSchema, toObjects } from "./_db.mjs";
import { passwordProblem } from "../src/lib/passwords.js";

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error("Usage: npm run reset-password -- <username> <new-password>");
  process.exit(1);
}
const problem = passwordProblem(password);
if (problem) {
  console.error(problem);
  process.exit(1);
}

const { url, client } = openTarget();
await ensureSchema(client);
const hash = await bcrypt.hash(password, 10);
const [existing] = toObjects(
  await client.execute({
    sql: "SELECT user_id, username FROM users WHERE lower(username) = lower(?)",
    args: [username],
  })
);

if (existing) {
  await client.execute({
    sql: "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
    args: [hash, existing.user_id],
  });
  console.log(`Password updated for "${existing.username}" (${url.split("?")[0]}).`);
} else {
  await client.execute({
    sql: "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    args: [username, hash],
  });
  console.log(`Created account "${username}" (${url.split("?")[0]}).`);
}
