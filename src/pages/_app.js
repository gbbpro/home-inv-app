// src/pages/_app.js
import Layout from "@/components/Layout";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
    <Layout>
      <Component {...pageProps} />
    </Layout>
    </AuthProvider>
  );
}
