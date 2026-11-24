// Pick the closest of the household's own categories for a scanned product.

const HINTS = {
  beverage: ["beverage", "drink", "juice", "soda", "water", "coffee", "tea", "kombucha"],
  dairy: ["dair", "milk", "cheese", "yogurt", "yoghurt", "butter", "cream", "egg"],
  protein: ["meat", "beef", "pork", "chicken", "poultry", "fish", "seafood", "tofu", "egg", "sausage"],
  fruits: ["fruit", "berr", "apple", "banana"],
  vegetables: ["vegetable", "legume", "salad"],
  spices: ["spice", "herb", "seasoning", "condiment", "salt", "pepper"],
  "dry-goods": ["cereal", "pasta", "rice", "grain", "flour", "baking", "snack", "cracker", "canned", "bean", "nut", "bread"],
  cleaning: ["clean", "detergent", "laundry", "dish", "disinfect", "household"],
  "self-care": ["beauty", "hygiene", "personal-care", "cosmetic", "shampoo", "soap", "toothpaste", "deodorant", "skin"],
  smallwares: ["kitchen", "storage", "bag", "foil", "wrap", "battery", "batteries", "paper"],
};

const stem = (word) => word.replace(/(ies|es|s)$/, "");

export function guessCategory(productCategories = [], ownCategories = []) {
  const tags = productCategories.join(" ").toLowerCase();
  if (!tags) return "";
  let best = "";
  let bestScore = 0;
  for (const cat of ownCategories.filter(Boolean)) {
    const words = [...cat.split("-").map(stem).filter((w) => w.length > 2), ...(HINTS[cat] || [])];
    const score = words.reduce((n, w) => (tags.includes(w) ? n + 1 : n), 0);
    if (score > bestScore) {
      best = cat;
      bestScore = score;
    }
  }
  return best;
}
