import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logoutUser = async () => {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login'); // Redirect to login after logout
    };

    logoutUser();
  }, [router]);

  return <p>Logging out...</p>;
}
