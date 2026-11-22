/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/", destination: "/shopping-list", permanent: false },
      // Old URLs from the previous version of the app
      { source: "/groceries/:category", destination: "/groceries?category=:category", permanent: true },
      { source: "/supplies/:category", destination: "/supplies?category=:category", permanent: true },
      { source: "/completedPurchases", destination: "/history", permanent: true },
      { source: "/upload", destination: "/import", permanent: true },
      { source: "/update-password", destination: "/settings", permanent: true },
      { source: "/registration", destination: "/settings", permanent: true },
      { source: "/logout", destination: "/settings", permanent: false },
    ];
  },
};
