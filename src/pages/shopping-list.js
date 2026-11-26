import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { FiCheck, FiX, FiShoppingBag, FiBox, FiCheckSquare, FiLoader } from "react-icons/fi";
import { PageHeader, EmptyState, ErrorState, ListSkeleton } from "@/components/States";
import { useConfirm } from "@/components/Confirm";
import { useToast } from "@/components/Toast";
import { api, localToday, useApi } from "@/lib/client";
import { TYPES } from "@/lib/items";
import { amount, categoryLabel, relativeDay, titleCase } from "@/lib/format";

const STORAGE_KEY = "shopping-list-checked";
const NO_CHECKS = { groceries: [], supplies: [] };

function loadChecked() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && Array.isArray(saved.groceries) && Array.isArray(saved.supplies) ? saved : NO_CHECKS;
  } catch {
    return NO_CHECKS;
  }
}

export default function ShoppingList() {
  const { data, error, loading, reload, setData } = useApi("/api/shopping-list");
  const [checked, setChecked] = useState(NO_CHECKS);
  const [busy, setBusy] = useState(false);
  const [confirm, confirmDialog] = useConfirm();
  const toast = useToast();

  // Checked-off items survive a page refresh in the store.
  useEffect(() => setChecked(loadChecked()), []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {}
  }, [checked]);

  // Forget checks for items that are no longer on the list.
  const live = useMemo(() => {
    if (!data) return checked;
    const keep = (key) => checked[key].filter((id) => data[key].some((i) => i.id === id));
    return { groceries: keep("groceries"), supplies: keep("supplies") };
  }, [data, checked]);

  const total = data ? data.groceries.length + data.supplies.length : 0;
  const checkedCount = live.groceries.length + live.supplies.length;

  const toggleCheck = (key, id) =>
    setChecked((c) => ({
      ...live,
      [key]: live[key].includes(id) ? live[key].filter((x) => x !== id) : [...live[key], id],
    }));

  const removeFromList = async (key, item) => {
    setData((d) => ({ ...d, [key]: d[key].filter((i) => i.id !== item.id) }));
    try {
      await api(`/api/items/${key}/${item.id}`, { method: "PUT", body: { shopping_list: 0 } });
      toast(`${titleCase(item.item)} removed from your list`);
    } catch (err) {
      toast(err.message, { error: true });
      reload();
    }
  };

  const finishTrip = async () => {
    const left = total - checkedCount;
    const ok = await confirm({
      title: "Finish this trip?",
      message: `${checkedCount} item${checkedCount === 1 ? "" : "s"} will be saved to your history as bought today.${
        left ? ` The ${left} unchecked item${left === 1 ? "" : "s"} will stay on your list.` : ""
      }`,
      action: "Finish trip",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await api("/api/shopping-list/complete", { method: "POST", body: { ...live, date: localToday() } });
      setChecked(NO_CHECKS);
      toast("Trip saved to history");
      await reload();
    } catch (err) {
      toast(err.message, { error: true });
    } finally {
      setBusy(false);
    }
  };

  const clearList = async () => {
    const ok = await confirm({
      title: "Clear the whole list?",
      message: "Every item comes off the list. Nothing is saved to history.",
      action: "Clear list",
      danger: true,
    });
    if (!ok) return;
    try {
      await api("/api/shopping-list/clear", { method: "POST" });
      setChecked(NO_CHECKS);
      toast("List cleared");
      reload();
    } catch (err) {
      toast(err.message, { error: true });
    }
  };

  return (
    <>
      <Head>
        <title>Shopping list · Home Inventory</title>
      </Head>
      <PageHeader
        title="Shopping list"
        subtitle={data ? (total ? `${total} item${total === 1 ? "" : "s"}${checkedCount ? ` · ${checkedCount} in the cart` : ""}` : "Nothing to buy") : " "}
        actions={total > 0 && <button className="btn-ghost text-stone-500" onClick={clearList}>Clear list</button>}
      />

      {loading && !data ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : total === 0 ? (
        <EmptyState icon={FiCheckSquare} title="Your list is empty">
          Tap <span className="font-medium text-stone-700">Add to list</span> on anything in{" "}
          <Link href="/groceries" className="font-medium text-brand-ink hover:underline">Groceries</Link> or{" "}
          <Link href="/supplies" className="font-medium text-brand-ink hover:underline">Supplies</Link>.
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {Object.entries(TYPES).map(([key, meta]) =>
            data[key].length === 0 ? null : (
              <Section
                key={key}
                title={meta.label}
                icon={key === "groceries" ? FiShoppingBag : FiBox}
                items={data[key]}
                checkedIds={live[key]}
                onCheck={(id) => toggleCheck(key, id)}
                onRemove={(item) => removeFromList(key, item)}
              />
            )
          )}
        </div>
      )}

      {checkedCount > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 px-4 md:bottom-6">
          <div className="mx-auto flex max-w-md animate-slide-up items-center gap-3 rounded-2xl bg-stone-900 p-2 pl-4 text-stone-50 shadow-lg">
            <span className="text-sm">
              <span className="font-semibold">{checkedCount}</span> of {total} in the cart
            </span>
            <button className="btn ml-auto bg-brand-500 text-white hover:bg-brand-600" onClick={finishTrip} disabled={busy}>
              {busy ? <FiLoader className="animate-spin" /> : <FiCheck />}
              Finish trip
            </button>
          </div>
        </div>
      )}
      {confirmDialog}
    </>
  );
}

function Section({ title, icon: Icon, items, checkedIds, onCheck, onRemove }) {
  const done = items.filter((i) => checkedIds.includes(i.id)).length;
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 px-1">
        <Icon className="text-stone-400" size={16} />
        <h2 className="text-sm font-semibold text-stone-700">{title}</h2>
        <span className="text-sm text-stone-400">{done}/{items.length}</span>
      </div>
      <ul className="card divide-y divide-stone-100 overflow-hidden">
        {items.map((item, idx) => {
          const isChecked = checkedIds.includes(item.id);
          const showCategory = idx === 0 || items[idx - 1].category !== item.category;
          const details = [amount(item), item.date_purchased && `last bought ${relativeDay(item.date_purchased)}`].filter(Boolean);
          return (
            <li key={item.id}>
              {showCategory && (
                <p className="bg-stone-50/80 px-4 pb-1.5 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  {categoryLabel(item.category)}
                </p>
              )}
              <div className="flex items-center">
                <button
                  onClick={() => onCheck(item.id)}
                  role="checkbox"
                  aria-checked={isChecked}
                  className="flex min-w-0 flex-1 items-center gap-3.5 px-4 py-3.5 text-left"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      isChecked ? "border-brand-600 bg-brand-600 text-white" : "border-stone-300 bg-surface"
                    }`}
                  >
                    {isChecked && <FiCheck size={16} strokeWidth={3} />}
                  </span>
                  <span className={`min-w-0 transition ${isChecked ? "opacity-50" : ""}`}>
                    <span className={`block truncate font-medium text-stone-900 ${isChecked ? "line-through decoration-stone-400" : ""}`}>
                      {titleCase(item.item)}
                      {item.item_variety && <span className="font-normal text-stone-500"> · {titleCase(item.item_variety)}</span>}
                    </span>
                    {details.length > 0 && <span className="block truncate text-sm text-stone-500">{details.join(" · ")}</span>}
                  </span>
                </button>
                <button
                  onClick={() => onRemove(item)}
                  className="mr-2 rounded-full p-2.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                  aria-label={`Take ${item.item} off the list`}
                >
                  <FiX size={18} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
