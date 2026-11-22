// Display helpers.

export function titleCase(text) {
  if (!text) return "";
  return String(text)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function categoryLabel(category) {
  return category ? titleCase(category) : "Uncategorized";
}

export function money(n) {
  if (n == null || n === "") return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

// Accepts "2024-11-05" and older "11/5/2024" style dates.
export function parseDay(value) {
  if (!value) return null;
  const str = String(value);
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return new Date(year, Number(m[1]) - 1, Number(m[2]));
  }
  return null;
}

// Any supported date → "YYYY-MM-DD" (what date inputs expect), or "".
export function isoDay(value) {
  const d = parseDay(value);
  if (!d) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function shortDate(value) {
  const d = parseDay(value);
  if (!d) return null;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function longDate(value) {
  const d = parseDay(value);
  if (!d) return "Unknown date";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export function relativeDay(value) {
  const d = parseDay(value);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((today - d) / 86400000);
  if (days < 0) return shortDate(value);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const w = Math.round(days / 7);
    return `${w} week${w === 1 ? "" : "s"} ago`;
  }
  if (days < 365) {
    const mo = Math.round(days / 30);
    return `${mo} month${mo === 1 ? "" : "s"} ago`;
  }
  return shortDate(value);
}

// "2 × 12 oz", "2", "12 oz" or null
export function amount(item) {
  const qty = item.qty != null && item.qty !== "" ? item.qty : null;
  // "1 lb", "2 gal" for plain units; "2 × 12 oz" for pack sizes
  if (qty != null && item.pack_size) {
    return /^[a-z.]+$/i.test(item.pack_size.trim()) ? `${qty} ${item.pack_size.trim()}` : `${qty} × ${item.pack_size}`;
  }
  if (qty != null) return `Qty ${qty}`;
  return item.pack_size || null;
}
