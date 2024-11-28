import { openDB } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();
      const { username, password } = req.body;

      // Check if the username is already taken
      const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Hash password and insert new user
      const passwordHash = await hashPassword(password); // Hash the password
      await db.run(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, passwordHash]
      );

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
