// Look up a barcode in free product databases. Server-side only.

const UA = "HomeInventory/1.0 (personal household app)";

async function getJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  return res.json();
}

const clean = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);

// Open Food Facts and its sister databases share one API.
const OPEN_FACTS = [
  { host: "world.openfoodfacts.org", source: "Open Food Facts", kind: "groceries" },
  { host: "world.openproductsfacts.org", source: "Open Products Facts", kind: "supplies" },
  { host: "world.openbeautyfacts.org", source: "Open Beauty Facts", kind: "supplies" },
];

async function openFacts({ host, source, kind }, code) {
  const fields = "product_name,product_name_en,generic_name,brands,quantity,categories_tags,image_front_small_url";
  const data = await getJson(`https://${host}/api/v2/product/${code}.json?fields=${fields}`);
  const p = data?.status === 1 ? data.product : null;
  const name = clean(p?.product_name_en) || clean(p?.product_name) || clean(p?.generic_name);
  if (!name) return null;
  return {
    name,
    brand: clean(p.brands?.split(",")[0]),
    size: clean(p.quantity),
    categories: (p.categories_tags || []).map((t) => t.replace(/^[a-z]{2}:/, "")),
    image: clean(p.image_front_small_url),
    kind,
    source,
  };
}

async function upcItemDb(code) {
  const data = await getJson(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`);
  const item = data?.items?.[0];
  const name = clean(item?.title);
  if (!name) return null;
  return {
    name,
    brand: clean(item.brand),
    size: clean(item.size),
    categories: clean(item.category) ? item.category.split(">").map((c) => c.trim().toLowerCase()) : [],
    image: clean(item.images?.[0])?.replace(/^http:/, "https:") ?? null,
    kind: null,
    source: "UPCitemdb",
  };
}

// Returns product info or null. `code` must already be normalized digits.
export async function lookupBarcode(code) {
  const ean13 = code.length === 12 ? `0${code}` : code;
  const attempts = [...OPEN_FACTS.map((db) => () => openFacts(db, ean13)), () => upcItemDb(code)];
  for (const attempt of attempts) {
    try {
      const found = await attempt();
      if (found) return found;
    } catch (err) {
      console.warn("Barcode lookup failed:", err.message);
    }
  }
  return null;
}
