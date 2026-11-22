import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { FiLoader } from "react-icons/fi";
import { Logo } from "@/components/AppShell";
import { api } from "@/lib/client";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/login", { method: "POST", body: { username, password } });
      const next = typeof router.query.next === "string" && router.query.next.startsWith("/") && !router.query.next.startsWith("//")
        ? router.query.next
        : "/shopping-list";
      router.replace(next);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-brand-50 via-stone-50 to-stone-50 px-4 py-12">
      <Head>
        <title>Log in · Home Inventory</title>
      </Head>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo className="text-lg" />
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6 md:p-7">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Welcome back</h1>
            <p className="mt-1 text-sm text-stone-500">Log in to see your list and pantry.</p>
          </div>
          <div>
            <label htmlFor="username" className="label">Username</label>
            <input
              id="username"
              className="input"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">{error}</p>}
          <button className="btn-primary w-full py-3" disabled={busy}>
            {busy && <FiLoader className="animate-spin" />}
            Log in
          </button>
        </form>
        <p className="mt-5 px-4 text-center text-xs leading-relaxed text-stone-500">
          Forgot your password? Ask someone in your household to set a new one from Settings, or run{" "}
          <code className="rounded bg-stone-200/70 px-1 py-0.5 text-[11px]">npm run reset-password</code>.
        </p>
      </div>
    </div>
  );
}
