import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiEdit2, FiLink, FiLoader, FiPlus, FiSearch, FiShoppingCart } from "react-icons/fi";
import { LuScanBarcode } from "react-icons/lu";
import Modal from "./Modal";
import BarcodeScanner from "./BarcodeScanner";
import { useToast } from "./Toast";
import { api } from "@/lib/client";
import { TYPES } from "@/lib/items";
import { guessCategory } from "@/lib/category-guess";
import { amount, money, relativeDay, titleCase } from "@/lib/format";

// Scan a barcode, then: open the item you already have, or add a new one
// pre-filled from a product database, or attach the barcode to an existing item.
export default function ScanSheet({ open, onClose, type, items = [], categories = [], onAddNew, onEdit, onChanged }) {
  const toast = useToast();
  const [phase, setPhase] = useState("scan"); // scan | looking | result
  const [manual, setManual] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase("scan");
      setResult(null);
      setManual("");
      setError("");
      setLinking(false);
    }
  }, [open]);

  const lookUp = async (raw) => {
    const code = String(raw).replace(/\D/g, "");
    if (code.length < 6) {
      setError("Barcodes are usually 8, 12 or 13 digits.");
      return;
    }
    setError("");
    setPhase("looking");
    try {
      setResult(await api(`/api/upc/${code}`));
      setPhase("result");
    } catch (err) {
      setError(err.message);
      setPhase("scan");
    }
  };

  const scanAgain = () => {
    setResult(null);
    setManual("");
    setLinking(false);
    setPhase("scan");
  };

  const addNew = () => {
    const p = result.product;
    onAddNew({
      item: p?.name || "",
      item_variety: p?.brand || "",
      pack_size: p?.size || "",
      category: p ? guessCategory(p.categories, categories) : "",
      upc: result.code,
    });
  };

  const toggleList = async () => {
    const { type: matchType, item } = result.match;
    const next = item.shopping_list ? 0 : 1;
    try {
      await api(`/api/items/${matchType}/${item.id}`, { method: "PUT", body: { shopping_list: next } });
      setResult((r) => ({ ...r, match: { ...r.match, item: { ...item, shopping_list: next } } }));
      toast(next ? `${titleCase(item.item)} added to your list` : `${titleCase(item.item)} removed from your list`);
      onChanged?.();
    } catch (err) {
      toast(err.message, { error: true });
    }
  };

  const linkTo = async (item) => {
    try {
      const saved = await api(`/api/items/${type}/${item.id}`, { method: "PUT", body: { upc: result.code } });
      toast(`Barcode saved to ${titleCase(item.item)}`);
      setLinking(false);
      setResult((r) => ({ code: r.code, match: { type, item: saved } }));
      onChanged?.();
    } catch (err) {
      toast(err.message, { error: true });
    }
  };

  const meta = TYPES[type];
  let title = "Scan a barcode";
  if (phase === "result" && result?.match) title = "Already in your inventory";
  else if (phase === "result" && result?.product) title = "Product found";
  else if (phase === "result") title = "Not found";
  if (linking) title = "Which item is this?";

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {phase === "scan" && (
        <div className="space-y-4">
          <BarcodeScanner onDetected={lookUp} />
          <p className="text-center text-sm text-stone-500">Hold the barcode inside the box. It scans by itself.</p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              lookUp(manual);
            }}
          >
            <input
              className="input"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Or type the numbers under the barcode"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              aria-label="Barcode number"
            />
            <button className="btn-secondary shrink-0" disabled={!manual.trim()}>Look up</button>
          </form>
          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">{error}</p>}
        </div>
      )}

      {phase === "looking" && (
        <div className="flex flex-col items-center gap-3 py-14 text-stone-500">
          <FiLoader className="animate-spin" size={26} />
          Looking it up…
        </div>
      )}

      {phase === "result" && linking && (
        <LinkPicker items={items} onPick={linkTo} onCancel={() => setLinking(false)} />
      )}

      {phase === "result" && !linking && result?.match && (
        <MatchView match={result.match} onToggle={toggleList} onEdit={() => onEdit(result.match.type, result.match.item)} onScanAgain={scanAgain} />
      )}

      {phase === "result" && !linking && !result?.match && (
        <div className="space-y-4">
          {result?.product ? (
            <div className="flex gap-4 rounded-2xl bg-stone-50 p-4">
              {result.product.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result.product.image} alt="" className="h-20 w-20 shrink-0 rounded-xl bg-white object-contain" referrerPolicy="no-referrer" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-stone-900">{result.product.name}</p>
                <p className="text-sm text-stone-500">{[result.product.brand, result.product.size].filter(Boolean).join(" · ")}</p>
                <p className="mt-1 text-xs text-stone-400">From {result.product.source} · {result.code}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
              <p>
                No product database knows barcode <span className="font-mono text-stone-900">{result?.code}</span>. You can still add it, and next
                time you scan it, it will find your item.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button className="btn-primary flex-1" onClick={addNew}>
              <FiPlus /> {result?.product ? `Add to ${meta.label}` : "Add it yourself"}
            </button>
            <button className="btn-secondary flex-1" onClick={scanAgain}>
              <LuScanBarcode size={18} /> Scan another
            </button>
          </div>
          {items.length > 0 && (
            <button className="btn-ghost w-full text-sm text-stone-500" onClick={() => setLinking(true)}>
              <FiLink size={15} /> It&apos;s something already in {meta.label}
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}

function MatchView({ match, onToggle, onEdit, onScanAgain }) {
  const { item, type } = match;
  const onList = !!item.shopping_list;
  const details = [amount(item), money(item.cost), item.date_purchased && `bought ${relativeDay(item.date_purchased)}`].filter(Boolean);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-stone-50 p-4">
        <p className="font-semibold text-stone-900">
          {titleCase(item.item)}
          {item.item_variety && <span className="font-normal text-stone-500"> · {titleCase(item.item_variety)}</span>}
        </p>
        {details.length > 0 && <p className="mt-0.5 text-sm text-stone-500">{details.join(" · ")}</p>}
        <p className="mt-1 text-xs text-stone-400">In {TYPES[type].label}</p>
      </div>
      <button className={onList ? "btn-secondary w-full" : "btn-primary w-full"} onClick={onToggle}>
        {onList ? <FiCheck /> : <FiShoppingCart />}
        {onList ? "On your shopping list. Tap to remove" : "Add to shopping list"}
      </button>
      <div className="flex gap-2">
        <button className="btn-secondary flex-1" onClick={onEdit}>
          <FiEdit2 size={16} /> Edit item
        </button>
        <button className="btn-secondary flex-1" onClick={onScanAgain}>
          <LuScanBarcode size={18} /> Scan another
        </button>
      </div>
    </div>
  );
}

function LinkPicker({ items, onPick, onCancel }) {
  const [q, setQ] = useState("");
  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter((i) => !needle || [i.item, i.item_variety].some((v) => v && String(v).toLowerCase().includes(needle)))
      .slice(0, 50);
  }, [items, q]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500">Pick the item this barcode belongs to. Next time you scan it, it will open that item.</p>
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input className="input pl-10" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      </div>
      <ul className="max-h-72 divide-y divide-stone-100 overflow-y-auto rounded-xl border border-stone-200">
        {matches.map((i) => (
          <li key={i.id}>
            <button className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left hover:bg-stone-50" onClick={() => onPick(i)}>
              <span className="min-w-0 truncate">
                {titleCase(i.item)}
                {i.item_variety && <span className="text-stone-500"> · {titleCase(i.item_variety)}</span>}
              </span>
              {i.upc && <span className="shrink-0 text-xs text-stone-400">has a barcode</span>}
            </button>
          </li>
        ))}
        {matches.length === 0 && <li className="px-3.5 py-6 text-center text-sm text-stone-500">Nothing matches.</li>}
      </ul>
      <button className="btn-ghost w-full" onClick={onCancel}>Back</button>
    </div>
  );
}
