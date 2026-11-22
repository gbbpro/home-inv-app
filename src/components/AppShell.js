import Link from "next/link";
import { useRouter } from "next/router";
import { FiCheckSquare, FiShoppingBag, FiBox, FiBarChart2, FiSettings } from "react-icons/fi";

export const NAV = [
  { href: "/shopping-list", label: "List", long: "Shopping list", icon: FiCheckSquare },
  { href: "/groceries", label: "Groceries", long: "Groceries", icon: FiShoppingBag },
  { href: "/supplies", label: "Supplies", long: "Supplies", icon: FiBox },
  { href: "/history", label: "History", long: "History", icon: FiBarChart2 },
  { href: "/settings", label: "Settings", long: "Settings", icon: FiSettings },
];

export function Logo({ className = "" }) {
  return (
    <span className={`flex items-center gap-2.5 font-semibold tracking-tight text-stone-900 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M9.5 14.5h5" />
        </svg>
      </span>
      Home Inventory
    </span>
  );
}

export default function AppShell({ children }) {
  const { pathname } = useRouter();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-stone-50/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:h-16 md:px-6">
          <Link href="/shopping-list" aria-label="Home Inventory home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map(({ href, long, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive(href) ? "bg-white text-brand-700 shadow-card" : "text-stone-600 hover:bg-white/70 hover:text-stone-900"
                }`}
              >
                <Icon size={16} />
                {long}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-5 md:px-6 md:pb-16 md:pt-8">{children}</main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                isActive(href) ? "text-brand-700" : "text-stone-500"
              }`}
            >
              <span className={`flex h-7 w-12 items-center justify-center rounded-full ${isActive(href) ? "bg-brand-50" : ""}`}>
                <Icon size={20} />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
