# Home Inventory

Track groceries and household supplies, build a shopping list, check things off in the store, and see what you've bought over time. Built with Next.js, Tailwind, and [Turso](https://turso.tech) (hosted SQLite).

## Run it locally

```bash
npm install
cp .env.example .env.local      # optional locally
npm run reset-password -- bart 'a-new-password'   # creates the account if it doesn't exist
npm run dev                     # http://localhost:8024
```

With no `TURSO_DATABASE_URL`, the app uses a local `home_inv.db` file (git-ignored).

## Deploy to Vercel

1. **Create a Turso database.** Use the Turso integration in the Vercel Marketplace, or sign up at turso.tech and run:
   ```bash
   turso db create home-inventory
   turso db show home-inventory --url        # → TURSO_DATABASE_URL
   turso db tokens create home-inventory     # → TURSO_AUTH_TOKEN
   ```
2. **Add environment variables** in Vercel → Project → Settings → Environment Variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET`: a long random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Copy your existing data** into Turso (run on your computer, with the Turso values in `.env.local`):
   ```bash
   npm run db:import -- ./home_inv.db
   ```
4. **Set a password** you'll remember:
   ```bash
   npm run reset-password -- bart 'a-new-password'
   ```
5. Redeploy.

## Forgotten passwords

- **Someone in the household forgot theirs:** anyone logged in can go to **Settings → Household → New password** for them.
- **Everyone is locked out:** run `npm run reset-password -- <username> <new-password>` with the Turso values in `.env.local`.

There's no public sign-up. Add people from **Settings → Household**.

## Barcode scanning

Tap **Scan** on Groceries or Supplies and point your phone's camera at a barcode (needs HTTPS, which Vercel provides).

- If the barcode belongs to something you already have, it opens that item so you can add it to the list or edit it.
- If not, it looks the product up in Open Food Facts, Open Products Facts, Open Beauty Facts and UPCitemdb (free, no keys) and fills in the name, brand, size and a best-guess category.
- Existing items don't have barcodes yet: when you scan one, choose **It's something already in …** and pick the item. From then on, scanning it finds that item.
- You can also type the numbers under the barcode, or search your inventory by barcode.

## CSV import

**Settings → Import items from CSV.** Columns: `item` (required), `item_variety`, `category`, `qty`, `pack_size`, `cost`, `date_purchased`, `remind_after`, `upc`.
