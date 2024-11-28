import bcrypt from 'bcryptjs';
import { openDB } from '@/lib/db';
import { verifyToken } from '../../middlewares/auth';
import { protectedRoute } from '@/middlewares/protectedRoute';

 function handler(req, res) {
  if (req.method === 'POST') {
    verifyToken(req, res, async () => {
      const { oldPassword, newPassword } = req.body;
      const username = req.user.username; // Use username from token

      try {
        const db = await openDB(); // Open database connection

        // Fetch the user from the database
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
          return res.status(400).json({ message: 'User not found' });
        }

        // Compare the old password with the stored password hash
        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
          return res.status(400).json({ message: 'Incorrect current password' });
        }

        // Hash the new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await db.run(
          'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?',
          [newPasswordHash, username]
        );

        res.status(200).json({ message: 'Password updated successfully' });
      } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
export default protectedRoute(handler)