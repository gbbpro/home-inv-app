import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiPlus, FiSearch, FiShoppingCart, FiCheck, FiPackage, FiUpload, FiX } from "react-icons/fi";
import ItemEditor from "./ItemEditor";
import ScanSheet from "./ScanSheet";
import { LuScanBarcode } from "react-icons/lu";
import { useToast } from "./Toast";
import { PageHeader, EmptyState, ErrorState, ListSkeleton } from "./States";
import { api, useApi } from "@/lib/client";
import { TYPES } from "@/lib/items";
import { amount, categoryLabel, money, relativeDay, titleCase } from "@/lib/format";

function groupByCategory(items) {
  const groups = new Map();
  for (const item of items) {
    const key = item.category || "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()];
}

export default function InventoryPage({ type }) {
  const meta = TYPES[type];
  const router = useRouter();
  const toast = useToast();
  const { data: items, error, loading, reload, setData } = useApi(`/api/items/${type}`);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, object = edit
  const [prefill, setPrefill] = useState(null);
  const [scanning, setScanning] = useState(false);

  // /groceries?edit=12 opens that item (used when a scan finds it on the other page).
  useEffect(() => {
    const id = Number(router.query.edit);
    if (!id || !items) return;
    const found = items.find((i) => i.id === id);
    if (found) setEditing(found);
    const { edit, ...rest } = router.query;
    router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true, scroll: false });
  }, [router.query.edit, items]); // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = (values = null) => {
    setPrefill(values);
    setEditing(null);
  };

  const activeCategory = typeof router.query.category === "string" ? router.query.category : "";
  const setCategory = (c) =>
    router.replace({ pathname: router.pathname, query: c ? { category: c } : {} }, undefined, { shallow: true, scroll: false });

  const categories = useMemo(() => {
    const counts = new Map();
    for (const i of items || []) counts.set(i.category || "", (counts.get(i.category || "") || 0) + 1);
    return [...counts.entries()].sort(([a], [b]) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)));
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items || []).filter((i) => {
      if (activeCategory && (i.category || "") !== (activeCategory === "uncategorized" ? "" : activeCategory)) return false;
      if (!q) return true;
      return [i.item, i.item_variety, i.category, i.upc].some((v) => v && String(v).toLowerCase().includes(q));
    });
  }, [items, search, activeCategory]);

  const onListCount = (items || []).filter((i) => i.shopping_list).length;

  const toggleList = async (item) => {
    const next = item.shopping_list ? 0 : 1;
    setData((all) => all.map((i) => (i.id === item.id ? { ...i, shopping_list: next } : i)));
    try {
      await api(`/api/items/${type}/${item.id}`, { method: "PUT", body: { shopping_list: next } });
      toast(next ? `${titleCase(item.item)} added to your list` : `${titleCase(item.item)} removed from your list`);
    } catch (err) {
      setData((all) => all.map((i) => (i.id === item.id ? { ...i, shopping_list: item.shopping_list } : i)));
      toast(err.message, { error: true });
    }
  };

  const onSaved = (saved) => {
    setData((all) => {
      const exists = all.some((i) => i.id === saved.id);
      return exists ? all.map((i) => (i.id === saved.id ? saved : i)) : [...all, saved];
    });
    reload();
  };

  const groups = activeCategory ? [[activeCategory === "uncategorized" ? "" : activeCategory, visible]] : groupByCategory(visible);

  return (
    <>
      <Head>
        <title>{`${meta.label} · Home Inventory`}</title>
      </Head>
      <PageHeader
        title={meta.label}
        subtitle={items ? `${items.length} items · ${onListCount} on your list` : " "}
        actions={
          <>
            <Link href={`/import?type=${type}`} className="btn-secondary hidden sm:inline-flex">
              <FiUpload size={16} /> Import
            </Link>
            <button className="btn-secondary" onClick={() => setScanning(true)} aria-label="Scan a barcode">
              <LuScanBarcode size={18} /> <span className="hidden sm:inline">Scan</span>
            </button>
            <button className="btn-primary" onClick={() => openNew()}>
              <FiPlus size={18} /> <span className="hidden sm:inline">Add item</span><span className="sm:hidden">Add</span>
            </button>
          </>
        }
      />

      <div className="sticky top-14 z-20 -mx-4 mb-4 space-y-3 bg-stone-50/90 px-4 pb-3 pt-1 backdrop-blur-md md:top-16 md:-mx-6 md:px-6">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            className="input pl-10 pr-10"
            placeholder={`Search ${meta.label.toLowerCase()}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-stone-400 hover:bg-stone-100" onClick={() => setSearch("")} aria-label="Clear search">
              <FiX />
            </button>
          )}
        </div>
        {categories.length > 1 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
            <button className={`chip ${!activeCategory ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`} onClick={() => setCategory("")}>
              All
            </button>
            {categories.map(([c, count]) => {
              const key = c || "uncategorized";
              const on = activeCategory === key;
              return (
                <button key={key} className={`chip ${on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`} onClick={() => setCategory(on ? "" : key)}>
                  {categoryLabel(c)}
                  <span className={on ? "text-stone-400" : "text-stone-400"}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading && !items ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState icon={FiPackage} title={`No ${meta.label.toLowerCase()} yet`}>
          Add your first item, scan a barcode, or{" "}
          <Link className="font-medium text-brand-700 underline-offset-2 hover:underline" href={`/import?type=${type}`}>import a CSV</Link>.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon={FiSearch} title="Nothing matches">
          Try a different search{activeCategory ? " or category" : ""}.
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {groups.map(([category, rows]) => (
            <section key={category || "none"}>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-stone-500">
                {categoryLabel(category)} <span className="font-normal text-stone-400">· {rows.length}</span>
              </h2>
              <ul className="card divide-y divide-stone-100 overflow-hidden">
                {rows.map((item) => (
                  <ItemRow key={item.id} item={item} onEdit={() => setEditing(item)} onToggle={() => toggleList(item)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <ItemEditor
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        type={type}
        item={editing || null}
        prefill={editing === null ? prefill : null}
        categories={categories.map(([c]) => c)}
        defaultCategory={activeCategory && activeCategory !== "uncategorized" ? activeCategory : ""}
        onSaved={onSaved}
        onDeleted={(id) => setData((all) => all.filter((i) => i.id !== id))}
      />

      <ScanSheet
        open={scanning}
        onClose={() => setScanning(false)}
        type={type}
        items={items || []}
        categories={categories.map(([c]) => c)}
        onChanged={reload}
        onAddNew={(values) => {
          setScanning(false);
          openNew(values);
        }}
        onEdit={(matchType, item) => {
          setScanning(false);
          if (matchType === type) setEditing(item);
          else router.push(`/${matchType}?edit=${item.id}`);
        }}
      />
    </>
  );
}

function ItemRow({ item, onEdit, onToggle }) {
  const details = [amount(item), money(item.cost), item.date_purchased && `bought ${relativeDay(item.date_purchased)}`].filter(Boolean);
  const onList = !!item.shopping_list;

  return (
    <li className="flex items-center gap-2 pr-2 transition hover:bg-stone-50/80">
      <button onClick={onEdit} className="min-w-0 flex-1 px-4 py-3.5 text-left">
        <p className="truncate font-medium text-stone-900">
          {titleCase(item.item)}
          {item.item_variety && <span className="font-normal text-stone-500"> · {titleCase(item.item_variety)}</span>}
        </p>
        {details.length > 0 && <p className="mt-0.5 truncate text-sm text-stone-500">{details.join(" · ")}</p>}
      </button>
      <button
        onClick={onToggle}
        aria-pressed={onList}
        aria-label={onList ? `Remove ${item.item} from shopping list` : `Add ${item.item} to shopping list`}
        className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition ${
          onList ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-stone-200 bg-white text-stone-600 hover:border-brand-500 hover:text-brand-700"
        }`}
      >
        {onList ? <FiCheck size={16} /> : <FiShoppingCart size={16} />}
        <span className="hidden sm:inline">{onList ? "On list" : "Add to list"}</span>
      </button>
    </li>
  );
}
