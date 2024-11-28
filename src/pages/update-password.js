import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function UpdatePassword() {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check for token; if not present, redirect to login
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords don't match.");
      return;
    }

    const response = await fetch('/api/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, oldPassword, newPassword }),
    });
    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cornsilk">
      <div className="w-full max-w-md p-8 space-y-4 bg-earth-yellow rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-dark-moss-green">Update Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full px-4 py-2 border border-dark-moss-green rounded-lg focus:outline-none focus:ring-2 focus:ring-pakistan-green"
          />
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Current Password"
            required
            className="w-full px-4 py-2 border border-dark-moss-green rounded-lg focus:outline-none focus:ring-2 focus:ring-pakistan-green"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            required
            className="w-full px-4 py-2 border border-dark-moss-green rounded-lg focus:outline-none focus:ring-2 focus:ring-pakistan-green"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            required
            className="w-full px-4 py-2 border border-dark-moss-green rounded-lg focus:outline-none focus:ring-2 focus:ring-pakistan-green"
          />
          <button
            type="submit"
            className="w-full py-2 text-white bg-tigers-eye rounded-lg hover:bg-pakistan-green"
          >
            Update Password
          </button>
        </form>
        <p className="text-center text-dark-moss-green">{message}</p>
      </div>
    </div>
  );
}
