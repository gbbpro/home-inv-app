import { useEffect, useState } from "react";

const CompletedPurchases = () => {
  const [topItems, setTopItems] = useState([]);
  const [purchaseDates, setPurchaseDates] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);

  useEffect(() => {
    fetch("/api/top-20-items")
      .then((res) => res.json())
      .then(setTopItems);

    fetch("/api/purchase-dates")
      .then((res) => res.json())
      .then(setPurchaseDates);

    fetch("/api/category-totals")
      .then((res) => res.json())
      .then(setCategoryTotals);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Completed Purchases</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold">Top 20 Items</h2>
        <ul className="list-disc pl-6">
          {topItems.map((item, index) => (
            <li key={index}>
              {item.item} ({item.item_variety || "No Variety"}):{" "}
              {item.purchase_count} times, {item.total_qty} qty.
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold">Purchase Dates</h2>
        <ul className="list-disc pl-6">
          {purchaseDates.map((date, index) => (
            <li key={index}>
              <a href={`/completed-purchases/${date.purchase_date}`}>
                {date.purchase_date}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Category Totals</h2>
        <ul className="list-disc pl-6">
          {categoryTotals.map((category, index) => (
            <li key={index}>
              {category.category}: {category.total_qty} qty, $
              {(category.total_spent.toFixed(2) || "no-purchases")} spent.
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default CompletedPurchases;
