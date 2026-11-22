import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiChevronRight, FiKey, FiLoader, FiLogOut, FiTrash2, FiUpload, FiUserPlus } from "react-icons/fi";
import Modal from "@/components/Modal";
import { PageHeader } from "@/components/States";
import { useConfirm } from "@/components/Confirm";
import { useToast } from "@/components/Toast";
import { api, useApi } from "@/lib/client";
import { MIN_PASSWORD } from "@/lib/passwords";

export default function Settings() {
  const router = useRouter();
  const { data: me } = useApi("/api/me");
  const { data: users, reload: reloadUsers } = useApi("/api/users");
  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState(null);
  const [confirm, confirmDialog] = useConfirm();
  const toast = useToast();

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  };

  const removeMember = async (user) => {
    const ok = await confirm({
      title: `Remove ${user.username}?`,
      message: "They won't be able to log in anymore. Your lists and history aren't affected.",
      action: "Remove",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/api/users/${user.user_id}`, { method: "DELETE" });
      toast(`${user.username} removed`);
      reloadUsers();
    } catch (err) {
      toast(err.message, { error: true });
    }
  };

  return (
    <>
      <Head>
        <title>Settings · Home Inventory</title>
      </Head>
      <PageHeader title="Settings" subtitle={me ? `Logged in as ${me.username}` : " "} />

      <div className="max-w-2xl space-y-6">
        <ChangePassword />

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-5 pb-3">
            <div>
              <h2 className="font-semibold text-stone-900">Household</h2>
              <p className="text-sm text-stone-500">Everyone here shares the same lists.</p>
            </div>
            <button className="btn-secondary shrink-0 whitespace-nowrap" onClick={() => setAdding(true)}>
              <FiUserPlus size={16} /> Add person
            </button>
          </div>
          <ul className="divide-y divide-stone-100 border-t border-stone-100">
            {(users || []).map((u) => {
              const isMe = me && u.user_id === me.user_id;
              return (
                <li key={u.user_id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold uppercase text-brand-700">
                    {u.username.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-stone-900">
                    {u.username}
                    {isMe && <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">You</span>}
                  </span>
                  {!isMe && (
                    <>
                      <button className="btn-ghost px-3 text-sm" onClick={() => setResetting(u)}>
                        <FiKey size={15} /> <span className="hidden sm:inline">New password</span>
                      </button>
                      <button className="btn-danger-ghost px-3" onClick={() => removeMember(u)} aria-label={`Remove ${u.username}`}>
                        <FiTrash2 size={16} />
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card divide-y divide-stone-100 overflow-hidden">
          <Link href="/import" className="flex items-center gap-3 px-5 py-4 hover:bg-stone-50/80">
            <FiUpload className="text-stone-400" />
            <span className="flex-1 font-medium text-stone-800">Import items from CSV</span>
            <FiChevronRight className="text-stone-300" />
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 px-5 py-4 text-left text-red-600 hover:bg-red-50/50">
            <FiLogOut />
            <span className="flex-1 font-medium">Log out</span>
          </button>
        </section>
      </div>

      <AddPerson open={adding} onClose={() => setAdding(false)} onAdded={reloadUsers} />
      <SetPassword user={resetting} onClose={() => setResetting(null)} />
      {confirmDialog}
    </>
  );
}

function ErrorText({ children }) {
  return children ? <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">{children}</p> : null;
}

function ChangePassword() {
  const toast = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.next !== form.confirm) return setError("The new passwords don't match.");
    setBusy(true);
    try {
      await api("/api/password", { method: "POST", body: { currentPassword: form.current, newPassword: form.next } });
      setForm({ current: "", next: "", confirm: "" });
      toast("Password changed");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <div>
        <h2 className="font-semibold text-stone-900">Change your password</h2>
        <p className="text-sm text-stone-500">At least {MIN_PASSWORD} characters. Your browser can save it for you.</p>
      </div>
      <input type="text" name="username" autoComplete="username" className="hidden" readOnly />
      <div>
        <label className="label" htmlFor="pw-current">Current password</label>
        <input id="pw-current" type="password" className="input" autoComplete="current-password" value={form.current} onChange={set("current")} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="pw-new">New password</label>
          <input id="pw-new" type="password" className="input" autoComplete="new-password" minLength={MIN_PASSWORD} value={form.next} onChange={set("next")} required />
        </div>
        <div>
          <label className="label" htmlFor="pw-confirm">Confirm new password</label>
          <input id="pw-confirm" type="password" className="input" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} required />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <button className="btn-primary" disabled={busy}>
        {busy && <FiLoader className="animate-spin" />}
        Update password
      </button>
    </form>
  );
}

function AddPerson({ open, onClose, onAdded }) {
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const close = () => {
    setUsername("");
    setPassword("");
    setError("");
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/users", { method: "POST", body: { username, password } });
      toast(`${username} can log in now`);
      onAdded();
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add someone to your household"
      size="sm"
      footer={
        <>
          <button type="button" className="btn-secondary flex-1" onClick={close}>Cancel</button>
          <button type="submit" form="add-person" className="btn-primary flex-1" disabled={busy}>
            {busy && <FiLoader className="animate-spin" />}
            Add
          </button>
        </>
      }
    >
      <form id="add-person" onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="ap-user">Username</label>
          <input id="ap-user" className="input" autoCapitalize="none" autoCorrect="off" autoComplete="off" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="ap-pass">Password</label>
          <input id="ap-pass" type="text" className="input" autoComplete="new-password" minLength={MIN_PASSWORD} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p className="mt-1.5 text-xs text-stone-500">Share it with them. They can change it in Settings.</p>
        </div>
        <ErrorText>{error}</ErrorText>
      </form>
    </Modal>
  );
}

function SetPassword({ user, onClose }) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const close = () => {
    setPassword("");
    setError("");
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/api/users/${user.user_id}`, { method: "PUT", body: { password } });
      toast(`New password set for ${user.username}`);
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={!!user}
      onClose={close}
      title={user ? `New password for ${user.username}` : ""}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-secondary flex-1" onClick={close}>Cancel</button>
          <button type="submit" form="set-password" className="btn-primary flex-1" disabled={busy}>
            {busy && <FiLoader className="animate-spin" />}
            Set password
          </button>
        </>
      }
    >
      <form id="set-password" onSubmit={submit} className="space-y-3">
        <p className="text-sm text-stone-600">Use this when someone forgets theirs. Let them know the new one.</p>
        <input type="text" className="input" autoComplete="new-password" minLength={MIN_PASSWORD} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={`At least ${MIN_PASSWORD} characters`} required />
        <ErrorText>{error}</ErrorText>
      </form>
    </Modal>
  );
}
