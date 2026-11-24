// Shared rules for grocery and supply items.

export const TYPES = {
  groceries: { table: "groceries", source: "grocery", label: "Groceries", singular: "grocery" },
  supplies: { table: "supplies", source: "supply", label: "Supplies", singular: "supply" },
};

export const ITEM_FIELDS = [
  "item",
  "item_variety",
  "qty",
  "pack_size",
  "cost",
  "date_purchased",
  "remind_after",
  "category",
  "upc",
];

const NUMBER_FIELDS = { qty: "int", remind_after: "int", cost: "float" };

export function getType(name) {
  return Object.prototype.hasOwnProperty.call(TYPES, name) ? TYPES[name] : null;
}

// Normalize one field value coming from a form or CSV.
export function cleanValue(field, value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (NUMBER_FIELDS[field]) {
    const str = String(value).replace(/[$,\s]/g, "");
    if (str === "") return null;
    const n = NUMBER_FIELDS[field] === "int" ? parseInt(str, 10) : parseFloat(str);
    return Number.isFinite(n) ? n : null;
  }
  const str = String(value).trim();
  if (str === "") return null;
  if (field === "date_purchased") return normalizeDate(str);
  if (field === "upc") return normalizeUpc(str);
  if (field === "category") return str.toLowerCase().replace(/\s+/g, "-");
  return str;
}

// Pick and clean only known fields. With `partial`, fields that weren't sent stay out.
export function cleanItem(body, { partial = false } = {}) {
  const out = {};
  for (const field of ITEM_FIELDS) {
    if (partial && !(field in (body || {}))) continue;
    const v = cleanValue(field, body?.[field]);
    out[field] = v === undefined ? null : v;
  }
  return out;
}

// Store dates as YYYY-MM-DD. Also accepts M/D/YYYY from older data and spreadsheets.
export function normalizeDate(str) {
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) {
    const us = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (us) m = [null, us[3].length === 2 ? `20${us[3]}` : us[3], us[1], us[2]];
  }
  if (!m) return str;
  return `${m[1]}-${String(m[2]).padStart(2, "0")}-${String(m[3]).padStart(2, "0")}`;
}

// Barcodes are stored as digits only. A 13-digit EAN that starts with 0 is the
// same product as the 12-digit UPC-A, so store the shorter form.
export function normalizeUpc(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 14) return null;
  if (digits.length === 13 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 14 && digits.startsWith("00")) return digits.slice(2);
  return digits;
}
