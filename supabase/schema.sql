-- Offline-first Inventory Management System — Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- ── Profiles (extends auth.users) ─────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

-- ── Categories ─────────────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ── Suppliers ──────────────────────────────────────────────────
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now()
);

-- ── Products ───────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  barcode text,
  category_id uuid references categories(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  unit text not null default 'pcs',
  price numeric(12,2) not null default 0,
  cost numeric(12,2),
  quantity numeric(12,2) not null default 0,
  low_stock_threshold numeric(12,2) not null default 5,
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Sales & sale items ─────────────────────────────────────────
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  sold_at timestamptz not null default now(),
  total numeric(12,2) not null default 0,
  created_by uuid references auth.users(id)
);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity numeric(12,2) not null,
  price numeric(12,2) not null
);

-- ── Supplier payments ──────────────────────────────────────────
create table if not exists supplier_payments (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  amount numeric(12,2) not null,
  note text,
  paid_at timestamptz not null default now()
);

-- ── Row Level Security ─────────────────────────────────────────
-- Simple model: any signed-in user (shop owner or staff) can read/write.
-- Tighten per-table policies later if you need owner-only actions.

alter table profiles enable row level security;
alter table categories enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table supplier_payments enable row level security;

create policy "profiles: read own or any authenticated" on profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles: insert own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

create policy "categories: authenticated full access" on categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "suppliers: authenticated full access" on suppliers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "products: authenticated full access" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "sales: authenticated full access" on sales
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "sale_items: authenticated full access" on sale_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "supplier_payments: authenticated full access" on supplier_payments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Keep updated_at fresh on products
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();
