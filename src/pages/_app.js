import { useEffect } from "react";
import Head from "next/head";
import localFont from "next/font/local";
import { useRouter } from "next/router";
import AppShell from "@/components/AppShell";
import { ToastProvider } from "@/components/Toast";
import { applyTheme, getTheme } from "@/lib/theme";
import "@/styles/globals.css";

const geist = localFont({ src: "../fonts/GeistVF.woff", variable: "--font-geist", weight: "100 900" });

const BARE_PAGES = ["/login", "/404"];

export default function App({ Component, pageProps }) {
  const { pathname } = useRouter();
  const bare = BARE_PAGES.includes(pathname);

  // Follow the device's light/dark setting when the theme is "system".
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => getTheme() === "system" && applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

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
