import Link from "next/link";
import { Logo } from "@/components/AppShell";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-8" />
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-stone-500">That page doesn&apos;t exist.</p>
      <Link href="/shopping-list" className="btn-primary mt-6">Go to your list</Link>
    </div>
  );
}
