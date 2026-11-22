import { withAuth } from "@/lib/api";
import { all } from "@/lib/db";

// Day the trip happened. New trips store the shopper's local date in
// date_purchased; older rows only have a reliable completed_at.
const TRIP_DATE = `CASE
  WHEN date_purchased GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
   AND abs(julianday(date_purchased) - julianday(DATE(completed_at))) <= 1
  THEN date_purchased ELSE DATE(completed_at) END`;

export default withAuth(async (req, res) => {
  const [categories, topItems, purchases] = await Promise.all([
    all(`SELECT COALESCE(category, 'uncategorized') AS category,
                COUNT(*) AS purchases, SUM(COALESCE(cost, 0)) AS spent
         FROM completed_purchases GROUP BY 1 ORDER BY spent DESC, purchases DESC`),
    all(`SELECT item, item_variety, COUNT(*) AS times, SUM(COALESCE(qty, 0)) AS total_qty
         FROM completed_purchases GROUP BY lower(item), lower(COALESCE(item_variety, ''))
         ORDER BY times DESC, total_qty DESC LIMIT 10`),
    all(`SELECT id, item, item_variety, qty, pack_size, category, cost, source,
                ${TRIP_DATE} AS trip_date
         FROM completed_purchases ORDER BY trip_date DESC, lower(category), lower(item)`),
  ]);

  const trips = [];
  for (const p of purchases) {
    let trip = trips[trips.length - 1];
    if (!trip || trip.date !== p.trip_date) {
      trip = { date: p.trip_date, items: [], spent: 0 };
      trips.push(trip);
    }
    trip.items.push(p);
    trip.spent += p.cost || 0;
  }

  res.status(200).json({
    totals: {
      spent: categories.reduce((s, c) => s + (c.spent || 0), 0),
      purchases: purchases.length,
      trips: trips.length,
    },
    categories,
    topItems,
    trips,
  });
}, { methods: ["GET"] });
