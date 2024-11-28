import { openDB } from "@/lib/db";
import bcrypt from "bcryptjs"; // Use bcrypt to compare hashed passwords
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    try {
      const db = await openDB();
      const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);

      if (!user) {
        return res.status(400).json({ message: "Invalid username or password" });
      }

      // Compare the hashed password in the database with the provided password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid username or password" });
      }

      // Generate JWT token after successful login
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; SameSite=Lax; Secure`);
      res.status(200).json({ message: "Login successful" });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
