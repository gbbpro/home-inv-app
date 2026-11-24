import { useEffect, useState } from "react";
import { FiLoader, FiTrash2 } from "react-icons/fi";
import Modal from "./Modal";
import { useConfirm } from "./Confirm";
import { useToast } from "./Toast";
import { api } from "@/lib/client";
import { TYPES } from "@/lib/items";
import { categoryLabel, isoDay, titleCase } from "@/lib/format";

const EMPTY = {
  item: "",
  item_variety: "",
  category: "",
  qty: "",
  pack_size: "",
  cost: "",
  date_purchased: "",
  remind_after: "",
  upc: "",
  shopping_list: false,
};

function toForm(item, defaults) {
  if (!item) return { ...EMPTY, ...defaults };
  return Object.fromEntries(
    Object.keys(EMPTY).map((k) => [
      k,
      k === "shopping_list" ? !!item[k] : k === "date_purchased" ? isoDay(item[k]) : item[k] ?? "",
    ])
  );
}

export default function ItemEditor({ open, onClose, type, item, categories = [], defaultCategory, prefill, onSaved, onDeleted }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, confirmDialog] = useConfirm();
  const toast = useToast();
  const isNew = !item;
  const meta = TYPES[type];

  useEffect(() => {
    if (open) {
      const defaults = { ...(defaultCategory ? { category: defaultCategory } : {}) };
      for (const [k, v] of Object.entries(prefill || {})) if (v) defaults[k] = v;
      setForm(toForm(item, defaults));
      setError("");
      setBusy(false);
    }
  }, [open, item, defaultCategory, prefill]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const saved = isNew
        ? await api(`/api/items/${type}`, { method: "POST", body: form })
        : await api(`/api/items/${type}/${item.id}`, { method: "PUT", body: form });
      toast(isNew ? `Added ${titleCase(saved.item)}` : "Changes saved");
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${titleCase(item.item)}?`,
      message: "This removes it from your inventory. Your purchase history keeps past trips.",
      action: "Delete",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await api(`/api/items/${type}/${item.id}`, { method: "DELETE" });
      toast(`Deleted ${titleCase(item.item)}`);
      onDeleted?.(item.id);
      onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const listId = `categories-${type}`;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isNew ? `New ${meta.singular} item` : "Edit item"}
        footer={
          <>
            {!isNew && (
              <button type="button" onClick={remove} className="btn-danger-ghost px-3" disabled={busy} aria-label="Delete item">
                <FiTrash2 size={18} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-secondary ml-auto">
              Cancel
            </button>
            <button type="submit" form="item-form" className="btn-primary min-w-24" disabled={busy}>
              {busy && <FiLoader className="animate-spin" />}
              {isNew ? "Add item" : "Save"}
            </button>
          </>
        }
      >
        <form id="item-form" onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="f-item">Item</label>
              <input id="f-item" className="input" value={form.item} onChange={set("item")} placeholder="e.g. Apples" required />
            </div>
            <div>
              <label className="label" htmlFor="f-variety">Variety <span className="font-normal text-stone-400">(optional)</span></label>
              <input id="f-variety" className="input" value={form.item_variety} onChange={set("item_variety")} placeholder="e.g. Granny Smith" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="f-category">Category</label>
            <input
              id="f-category"
              className="input"
              list={listId}
              value={form.category}
              onChange={set("category")}
              placeholder="Pick or type a new one"
            />
            <datalist id={listId}>
              {categories.filter(Boolean).map((c) => (
                <option key={c} value={c}>{categoryLabel(c)}</option>
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label" htmlFor="f-qty">Qty</label>
              <input id="f-qty" className="input" type="number" inputMode="numeric" min="0" value={form.qty} onChange={set("qty")} placeholder="1" />
            </div>
            <div>
              <label className="label" htmlFor="f-pack">Pack size</label>
              <input id="f-pack" className="input" value={form.pack_size} onChange={set("pack_size")} placeholder="12 oz" />
            </div>
            <div>
              <label className="label" htmlFor="f-cost">Cost</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                <input id="f-cost" className="input pl-7" type="number" inputMode="decimal" min="0" step="0.01" value={form.cost} onChange={set("cost")} placeholder="0.00" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="f-date">Last bought</label>
              <input id="f-date" className="input" type="date" value={form.date_purchased} onChange={set("date_purchased")} />
            </div>
            <div>
              <label className="label" htmlFor="f-remind">Lasts about</label>
              <div className="relative">
                <input id="f-remind" className="input pr-14" type="number" inputMode="numeric" min="0" value={form.remind_after} onChange={set("remind_after")} placeholder="30" />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400">days</span>
              </div>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="f-upc">Barcode <span className="font-normal text-stone-400">(optional)</span></label>
            <input id="f-upc" className="input font-mono text-sm" inputMode="numeric" autoComplete="off" value={form.upc} onChange={set("upc")} placeholder="Scan or type the UPC" />
          </div>

          {isNew && (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-stone-50 px-3.5 py-3 text-sm font-medium text-stone-700">
              <input type="checkbox" className="h-5 w-5 rounded accent-brand-600" checked={form.shopping_list} onChange={set("shopping_list")} />
              Add to shopping list too
            </label>
          )}

          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">{error}</p>}
        </form>
      </Modal>
      {confirmDialog}
    </>
  );
}
