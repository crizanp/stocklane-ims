# Stocklane — Offline-first Inventory Management (web + mobile)

A simple, mobile-friendly inventory, sales and stock management web app built with
Next.js and Supabase. No desktop install needed — runs in any browser, phone or laptop.

## What's included

- Email/password login (shop owner + staff)
- Products: add / edit / delete / search, SKU + barcode fields, category, supplier, price, quantity, unit, expiry date
- Categories: simple CRUD
- Suppliers & payments: manage suppliers, record payments made to them
- Sales: search-and-add billing screen that deducts stock automatically on each sale
- Dashboard: total products, low-stock alerts, items expiring within 3 months, today's sales total

## 1. Set up the database

1. Open your Supabase project → **SQL Editor**.
2. Paste the contents of `supabase/schema.sql` and run it. This creates all tables,
   enables Row Level Security, and adds policies so any signed-in user can read/write.

## 2. Configure environment variables

`.env.local` is already filled in with the values you gave me:

```
NEXT_PUBLIC_SUPABASE_URL=https://bpwgdowucddysqtfiaps.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ZR2OmwSHtaEskCuKI4dKHw_d6shPsnZ
```

**Important — rotate your secret key.** You pasted a `sb_secret_...` service-role key in
chat. That key bypasses Row Level Security entirely and must never be used in a browser
or mobile app. This project never uses it — only the public `sb_publishable_...` key,
which is safe to expose client-side. Please go to Supabase → Settings → API and
regenerate the secret key so the one shared here stops working.

## 3. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, click **Create account** to make the first shop-owner
login, then sign in.

## 4. Deploy (so it's reachable on mobile)

Push this folder to a GitHub repo and import it into [Vercel](https://vercel.com), or run
`npx vercel`. Add the two environment variables above in the Vercel project settings.
Once deployed, open the URL on your phone — it's fully responsive.

## Notes on "offline-first"

This build is the **web/mobile version** you asked for first — it talks to Supabase
directly, so it needs a connection to load/save data right now. True offline billing
(queueing sales locally and syncing later) is the next layer to add — for example with a
local IndexedDB queue and a background sync service worker — once this online version is
confirmed to match what you want.

## Project structure

```
app/
  login/                 sign in / sign up
  (app)/                 authenticated shell (sidebar + topbar)
    dashboard/
    products/
    categories/
    suppliers/
    sales/
lib/
  supabase/client.ts     Supabase browser client
  auth-context.tsx       session/profile React context
  types.ts               shared TypeScript types
supabase/
  schema.sql             tables + RLS policies
```
