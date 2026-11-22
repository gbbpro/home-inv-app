import { useState } from "react";
import Head from "next/head";
import { FiBarChart2, FiChevronDown } from "react-icons/fi";
import { PageHeader, EmptyState, ErrorState, ListSkeleton } from "@/components/States";
import { useApi } from "@/lib/client";
import { amount, categoryLabel, longDate, money, titleCase } from "@/lib/format";

export default function History() {
  const { data, error, loading, reload } = useApi("/api/history");

  return (
    <>
      <Head>
        <title>History · Home Inventory</title>
      </Head>
      <PageHeader title="History" subtitle="What you've bought and where the money went" />

      {loading && !data ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.totals.purchases === 0 ? (
        <EmptyState icon={FiBarChart2} title="No trips yet">
          When you check items off your shopping list and tap Finish trip, they show up here.
        </EmptyState>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Spent" value={money(data.totals.spent)} />
            <Stat label="Trips" value={data.totals.trips} />
            <Stat label="Items bought" value={data.totals.purchases} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="card p-5">
              <h2 className="mb-4 font-semibold text-stone-900">Spending by category</h2>
              <CategoryBars categories={data.categories} />
            </section>
            <section className="card p-5">
              <h2 className="mb-3 font-semibold text-stone-900">Most bought</h2>
              <ol className="space-y-2.5">
                {data.topItems.map((item, i) => (
                  <li key={`${item.item}-${item.item_variety}`} className="flex items-center gap-3 text-sm">
                    <span className="w-5 text-right tabular-nums text-stone-400">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-stone-800">
                      {titleCase(item.item)}
                      {item.item_variety && <span className="text-stone-500"> · {titleCase(item.item_variety)}</span>}
                    </span>
                    <span className="tabular-nums text-stone-500">{item.times}×</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section>
            <h2 className="mb-2 px-1 text-sm font-semibold text-stone-700">Trips</h2>
            <div className="card divide-y divide-stone-100 overflow-hidden">
              {data.trips.map((trip, i) => (
                <Trip key={trip.date || i} trip={trip} defaultOpen={i === 0} />
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card px-4 py-3.5">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-stone-900 md:text-2xl">{value}</p>
    </div>
  );
}

function CategoryBars({ categories }) {
  const max = Math.max(...categories.map((c) => c.spent || 0), 0);
  if (max === 0) {
    return (
      <ul className="space-y-2 text-sm">
        {categories.map((c) => (
          <li key={c.category} className="flex justify-between">
            <span>{categoryLabel(c.category === "uncategorized" ? null : c.category)}</span>
            <span className="text-stone-500">{c.purchases} items</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="space-y-3">
      {categories.map((c) => (
        <li key={c.category}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-stone-700">{categoryLabel(c.category === "uncategorized" ? null : c.category)}</span>
            <span className="tabular-nums text-stone-500">{money(c.spent || 0)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-100">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(2, ((c.spent || 0) / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Trip({ trip, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-stone-50/80" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-stone-900">{longDate(trip.date)}</p>
          <p className="text-sm text-stone-500">
            {trip.items.length} item{trip.items.length === 1 ? "" : "s"}
            {trip.spent > 0 && ` · ${money(trip.spent)}`}
          </p>
        </div>
        <FiChevronDown className={`text-stone-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="space-y-2 px-4 pb-4">
          {trip.items.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate">
                {titleCase(p.item)}
                {p.item_variety && <span className="text-stone-500"> · {titleCase(p.item_variety)}</span>}
                {amount(p) && <span className="text-stone-400"> · {amount(p)}</span>}
              </span>
              {p.cost != null && <span className="tabular-nums text-stone-500">{money(p.cost)}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

