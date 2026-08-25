create table if not exists public.customer_categories (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  category text not null,
  name text not null,
  company text not null,
  phone text not null,
  phone_normalized text not null,
  email text not null default '',
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_phone_normalized_idx
  on public.customers (phone_normalized);

create table if not exists public.customer_contacts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  contact_date date not null,
  method text not null check (method in ('문자','전화','이메일','방문','기타')),
  memo text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists customer_contacts_customer_id_idx
  on public.customer_contacts (customer_id);

alter table public.customer_categories enable row level security;
alter table public.customers enable row level security;
alter table public.customer_contacts enable row level security;

-- customer_categories: everyone reads and adds, only admins delete
create policy "read customer_categories" on public.customer_categories
  for select to authenticated using (true);
create policy "insert customer_categories" on public.customer_categories
  for insert to authenticated with check (true);
create policy "delete customer_categories" on public.customer_categories
  for delete to authenticated using (is_admin());

-- customers: everyone reads and creates; only the owner or an admin can
-- change a row; only an admin can hand a row to a different owner
-- (the WITH CHECK re-evaluates against the *new* row, so a non-admin
-- update that tries to change owner_id away from itself fails)
create policy "read customers" on public.customers
  for select to authenticated using (true);
create policy "insert customers" on public.customers
  for insert to authenticated with check (true);
create policy "update customers" on public.customers
  for update to authenticated
  using (owner_id = auth.uid() or is_admin())
  with check (owner_id = auth.uid() or is_admin());
create policy "delete customers" on public.customers
  for delete to authenticated using (owner_id = auth.uid() or is_admin());

-- customer_contacts: everyone reads and adds; only the person who logged
-- an entry (or an admin) can delete it
create policy "read customer_contacts" on public.customer_contacts
  for select to authenticated using (true);
create policy "insert customer_contacts" on public.customer_contacts
  for insert to authenticated with check (true);
create policy "delete customer_contacts" on public.customer_contacts
  for delete to authenticated using (created_by = auth.uid() or is_admin());
