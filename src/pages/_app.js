import Head from "next/head";
import localFont from "next/font/local";
import { useRouter } from "next/router";
import AppShell from "@/components/AppShell";
import { ToastProvider } from "@/components/Toast";
import "@/styles/globals.css";

const geist = localFont({ src: "../fonts/GeistVF.woff", variable: "--font-geist", weight: "100 900" });

const BARE_PAGES = ["/login", "/404"];

export default function App({ Component, pageProps }) {
  const { pathname } = useRouter();
  const bare = BARE_PAGES.includes(pathname);

  return (
    <div className={`${geist.variable} font-sans`}>
      <Head>
        <title>Home Inventory</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <ToastProvider>
        {bare ? <Component {...pageProps} /> : (
          <AppShell>
            <Component {...pageProps} />
          </AppShell>
        )}
      </ToastProvider>
    </div>
  );
}
