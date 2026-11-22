import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Papa from "papaparse";
import { FiFileText, FiLoader, FiUploadCloud } from "react-icons/fi";
import { PageHeader } from "@/components/States";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";
import { TYPES, ITEM_FIELDS } from "@/lib/items";
import { titleCase } from "@/lib/format";

export default function Import() {
  const router = useRouter();
  const toast = useToast();
  const [type, setType] = useState("groceries");
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Pick up ?type= once the router has the query string.
  useEffect(() => {
    if (router.isReady && TYPES[router.query.type]) setType(router.query.type);
  }, [router.isReady, router.query.type]);

  const pick = (f) => {
    setFile(f);
    setRows(null);
    setError("");
    if (!f) return;
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/[\s-]+/g, "_"),
      complete: ({ data, meta }) => {
        if (!meta.fields?.includes("item")) {
          setError("The file needs a column named “item”.");
          return;
        }
        setRows(data.filter((r) => r.item && String(r.item).trim()));
      },
      error: () => setError("Couldn't read that file. Make sure it's a .csv."),
    });
  };

  const upload = async () => {
    setBusy(true);
    setError("");
    try {
      const { imported, skipped } = await api(`/api/import/${type}`, { method: "POST", body: { items: rows } });
      toast(`Imported ${imported} item${imported === 1 ? "" : "s"}${skipped ? ` (${skipped} skipped)` : ""}`);
      router.push(`/${type}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>Import · Home Inventory</title>
      </Head>
      <PageHeader title="Import from CSV" subtitle="Add many items at once from a spreadsheet" />

      <div className="card max-w-2xl space-y-5 p-5 md:p-6">
        <div>
          <p className="label">Add items to</p>
          <div className="inline-flex rounded-xl bg-stone-100 p-1">
            {Object.entries(TYPES).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setType(key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${type === key ? "bg-white text-stone-900 shadow-card" : "text-stone-500 hover:text-stone-800"}`}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 px-6 py-10 text-center transition hover:border-brand-500 hover:bg-brand-50/40">
          {file ? <FiFileText size={28} className="mb-2 text-brand-600" /> : <FiUploadCloud size={28} className="mb-2 text-stone-400" />}
          <span className="font-medium text-stone-800">{file ? file.name : "Choose a CSV file"}</span>
          <span className="mt-1 text-sm text-stone-500">
            {rows ? `${rows.length} item${rows.length === 1 ? "" : "s"} found` : "or drop it here"}
          </span>
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => pick(e.target.files?.[0] || null)} />
        </label>

        {rows && rows.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Item</th>
                  <th className="px-3 py-2 font-medium">Variety</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{titleCase(r.item)}</td>
                    <td className="px-3 py-2 text-stone-500">{titleCase(r.item_variety)}</td>
                    <td className="px-3 py-2 text-stone-500">{titleCase(r.category)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && <p className="bg-stone-50 px-3 py-2 text-xs text-stone-500">…and {rows.length - 5} more</p>}
          </div>
        )}

        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">{error}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" disabled={!rows?.length || busy} onClick={upload}>
            {busy && <FiLoader className="animate-spin" />}
            Import {rows?.length ? `${rows.length} items` : ""}
          </button>
          <Link href={`/${type}`} className="btn-ghost">Cancel</Link>
        </div>

        <p className="text-xs leading-relaxed text-stone-500">
          Columns it understands: {ITEM_FIELDS.map((f) => <code key={f} className="mr-1 rounded bg-stone-100 px-1 py-0.5">{f}</code>)}. Only{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5">item</code> is required.
        </p>
      </div>
    </>
  );
}
