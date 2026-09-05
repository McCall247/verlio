-- ============================================================================
-- Fashion Designer CRM — initial schema
-- Enums, tables, computed columns, triggers, RLS, views, and analytics RPCs.
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

create type public.production_status as enum (
  'inquiry', 'confirmed', 'measurements', 'design', 'fabric', 'cutting',
  'sewing', 'fitting', 'alterations', 'ready', 'delivered', 'cancelled'
);

create type public.payment_status as enum ('unpaid', 'partially_paid', 'paid', 'refunded');

create type public.payment_method as enum ('cash', 'bank_transfer', 'card', 'pos', 'other');

create type public.profile_role as enum ('owner', 'admin', 'staff');

-- ============================================================================
-- SHARED TRIGGER FUNCTIONS
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Raises if the referenced parent row (by TG_ARGV[0]=table, TG_ARGV[1]=id column,
-- TG_ARGV[2]=fk column on this row) belongs to a different business than NEW.
create or replace function public.enforce_same_business()
returns trigger language plpgsql as $$
declare
  parent_table text := TG_ARGV[0];
  parent_id_col text := TG_ARGV[1];
  fk_col text := TG_ARGV[2];
  fk_value uuid;
  parent_business_id uuid;
begin
  fk_value := (to_jsonb(new) ->> fk_col)::uuid;
  if fk_value is null then
    return new;
  end if;

  execute format('select business_id from public.%I where %I = $1', parent_table, parent_id_col)
    using fk_value into parent_business_id;

  if parent_business_id is null then
    raise exception 'Referenced % % not found', parent_table, fk_value;
  end if;

  if parent_business_id <> new.business_id then
    raise exception 'Cross-tenant reference violation: % on % does not belong to this business', fk_col, TG_TABLE_NAME;
  end if;

  return new;
end;
$$;

-- ============================================================================
-- BUSINESSES & PROFILES
-- ============================================================================

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency_code text not null default 'NGN',
  currency_symbol text not null default '₦',
  timezone text not null default 'Africa/Lagos',
  inactive_customer_days integer not null default 90,
  next_order_seq integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  full_name text,
  role public.profile_role not null default 'owner',
  avatar_url text,
  created_at timestamptz not null default now()
);

create index profiles_business_id_idx on public.profiles (business_id);

-- Security definer avoids RLS-on-profiles recursing into itself when other
-- tables' policies call this function.
create or replace function public.get_current_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select business_id from public.profiles where id = auth.uid()
$$;

-- ============================================================================
-- CONFIGURABLE PER-BUSINESS LISTS
-- ============================================================================

create table public.acquisition_sources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);
create index acquisition_sources_business_id_idx on public.acquisition_sources (business_id);

create table public.cost_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);
create index cost_categories_business_id_idx on public.cost_categories (business_id);

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);
create index expense_categories_business_id_idx on public.expense_categories (business_id);

-- ============================================================================
-- CUSTOMERS
-- ============================================================================

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  whatsapp text,
  address text,
  avatar_url text,
  acquisition_source_id uuid references public.acquisition_sources (id) on delete set null,
  acquisition_source_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_business_id_idx on public.customers (business_id);
create index customers_business_created_idx on public.customers (business_id, created_at desc);

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger customers_enforce_source_business
before insert or update on public.customers
for each row execute function public.enforce_same_business('acquisition_sources', 'id', 'acquisition_source_id');

create or replace function public.customers_snapshot_source_name()
returns trigger language plpgsql as $$
begin
  if new.acquisition_source_id is not null then
    select name into new.acquisition_source_name from public.acquisition_sources where id = new.acquisition_source_id;
  end if;
  return new;
end;
$$;

create trigger customers_snapshot_source_name_trg
before insert or update of acquisition_source_id on public.customers
for each row execute function public.customers_snapshot_source_name();

create table public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create index customer_notes_business_id_idx on public.customer_notes (business_id);
create index customer_notes_customer_id_idx on public.customer_notes (customer_id);

create trigger customer_notes_enforce_customer_business
before insert or update on public.customer_notes
for each row execute function public.enforce_same_business('customers', 'id', 'customer_id');

-- ============================================================================
-- ORDERS
-- ============================================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
  order_number text not null,
  outfit_name text not null,
  description text,
  notes text,
  order_date date not null default current_date,
  due_date date,
  selling_price numeric(14, 2) not null default 0 check (selling_price >= 0),
  production_status public.production_status not null default 'inquiry',
  total_cost numeric(14, 2) not null default 0,
  total_paid numeric(14, 2) not null default 0,
  payment_status public.payment_status not null default 'unpaid',
  profit numeric(14, 2) generated always as (selling_price - total_cost) stored,
  outstanding_balance numeric(14, 2) generated always as (selling_price - total_paid) stored,
  gross_margin_pct numeric(6, 2) generated always as (
    case when selling_price = 0 then 0
    else round(((selling_price - total_cost) / selling_price) * 100, 2) end
  ) stored,
  payment_pct numeric(6, 2) generated always as (
    case when selling_price = 0 then 0
    else round((total_paid / selling_price) * 100, 2) end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, order_number)
);

create index orders_business_id_idx on public.orders (business_id);
create index orders_customer_id_idx on public.orders (customer_id);
create index orders_business_status_date_idx on public.orders (business_id, production_status, order_date desc);
create index orders_business_order_date_idx on public.orders (business_id, order_date);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger orders_enforce_customer_business
before insert or update on public.orders
for each row execute function public.enforce_same_business('customers', 'id', 'customer_id');

create or replace function public.assign_order_number()
returns trigger language plpgsql as $$
declare
  seq integer;
begin
  if new.order_number is null or new.order_number = '' then
    update public.businesses set next_order_seq = next_order_seq + 1
      where id = new.business_id
      returning next_order_seq into seq;
    new.order_number := 'ORD-' || lpad(seq::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger orders_assign_order_number
before insert on public.orders
for each row execute function public.assign_order_number();

create or replace function public.compute_payment_status(v_selling_price numeric, v_total_paid numeric, v_has_refund boolean)
returns public.payment_status
language plpgsql immutable as $$
begin
  if v_has_refund and v_total_paid <= 0 then
    return 'refunded';
  elsif v_total_paid <= 0 then
    return 'unpaid';
  elsif v_selling_price > 0 and v_total_paid >= v_selling_price then
    return 'paid';
  else
    return 'partially_paid';
  end if;
end;
$$;

-- Keeps payment_status correct if selling_price changes after payments exist.
create or replace function public.recalc_payment_status_on_price_change()
returns trigger language plpgsql as $$
declare
  v_has_refund boolean;
begin
  if new.selling_price is distinct from old.selling_price then
    select bool_or(payment_type = 'refund') into v_has_refund
      from public.order_payments where order_id = new.id;
    new.payment_status := public.compute_payment_status(new.selling_price, new.total_paid, coalesce(v_has_refund, false));
  end if;
  return new;
end;
$$;

create trigger orders_recalc_payment_status_on_price_change
before update of selling_price on public.orders
for each row execute function public.recalc_payment_status_on_price_change();

create or replace function public.log_production_status_change()
returns trigger language plpgsql as $$
begin
  if new.production_status is distinct from old.production_status then
    insert into public.order_status_history (business_id, order_id, status_type, from_status, to_status, changed_by)
    values (new.business_id, new.id, 'production', old.production_status::text, new.production_status::text, auth.uid());
  end if;
  return new;
end;
$$;

create trigger orders_log_production_status_change
after update of production_status on public.orders
for each row execute function public.log_production_status_change();

create or replace function public.log_payment_status_change()
returns trigger language plpgsql as $$
begin
  if new.payment_status is distinct from old.payment_status then
    insert into public.order_status_history (business_id, order_id, status_type, from_status, to_status, changed_by)
    values (new.business_id, new.id, 'payment', old.payment_status::text, new.payment_status::text, auth.uid());
  end if;
  return new;
end;
$$;

create trigger orders_log_payment_status_change
after update of payment_status on public.orders
for each row execute function public.log_payment_status_change();

-- ============================================================================
-- ORDER COST ITEMS
-- ============================================================================

create table public.order_cost_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  category_id uuid references public.cost_categories (id) on delete set null,
  category_name text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  note text,
  created_at timestamptz not null default now()
);

create index order_cost_items_business_id_idx on public.order_cost_items (business_id);
create index order_cost_items_order_id_idx on public.order_cost_items (order_id);

create trigger order_cost_items_enforce_order_business
before insert or update on public.order_cost_items
for each row execute function public.enforce_same_business('orders', 'id', 'order_id');

create trigger order_cost_items_enforce_category_business
before insert or update on public.order_cost_items
for each row execute function public.enforce_same_business('cost_categories', 'id', 'category_id');

create or replace function public.order_cost_items_snapshot_category_name()
returns trigger language plpgsql as $$
begin
  if new.category_id is not null then
    select name into new.category_name from public.cost_categories where id = new.category_id;
  end if;
  return new;
end;
$$;

create trigger order_cost_items_snapshot_category_name_trg
before insert or update of category_id on public.order_cost_items
for each row execute function public.order_cost_items_snapshot_category_name();

create or replace function public.recalc_order_total_cost()
returns trigger language plpgsql as $$
declare
  target_order_id uuid;
begin
  target_order_id := coalesce(new.order_id, old.order_id);
  update public.orders
    set total_cost = coalesce((select sum(amount) from public.order_cost_items where order_id = target_order_id), 0)
    where id = target_order_id;
  return null;
end;
$$;

create trigger order_cost_items_recalc
after insert or update or delete on public.order_cost_items
for each row execute function public.recalc_order_total_cost();

-- ============================================================================
-- ORDER PAYMENTS
-- ============================================================================

create table public.order_payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  payment_type text not null default 'payment' check (payment_type in ('payment', 'refund')),
  payment_date date not null default current_date,
  method public.payment_method,
  note text,
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_payments_business_id_idx on public.order_payments (business_id);
create index order_payments_order_id_idx on public.order_payments (order_id);

create trigger order_payments_enforce_order_business
before insert or update on public.order_payments
for each row execute function public.enforce_same_business('orders', 'id', 'order_id');

create or replace function public.recalc_order_payments()
returns trigger language plpgsql as $$
declare
  target_order_id uuid;
  v_selling_price numeric(14, 2);
  v_total_paid numeric(14, 2);
  v_has_refund boolean;
begin
  target_order_id := coalesce(new.order_id, old.order_id);

  select
    greatest(coalesce(sum(case when payment_type = 'payment' then amount else -amount end), 0), 0),
    bool_or(payment_type = 'refund')
  into v_total_paid, v_has_refund
  from public.order_payments
  where order_id = target_order_id;

  select selling_price into v_selling_price from public.orders where id = target_order_id;

  update public.orders
    set total_paid = v_total_paid,
        payment_status = public.compute_payment_status(v_selling_price, v_total_paid, coalesce(v_has_refund, false))
    where id = target_order_id;

  return null;
end;
$$;

create trigger order_payments_recalc
after insert or update or delete on public.order_payments
for each row execute function public.recalc_order_payments();

-- ============================================================================
-- ORDER STATUS HISTORY & IMAGES
-- ============================================================================

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  status_type text not null check (status_type in ('production', 'payment')),
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles (id) on delete set null,
  changed_at timestamptz not null default now(),
  note text
);

create index order_status_history_business_id_idx on public.order_status_history (business_id);
create index order_status_history_order_id_idx on public.order_status_history (order_id);

create table public.order_images (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_images_business_id_idx on public.order_images (business_id);
create index order_images_order_id_idx on public.order_images (order_id);

create trigger order_images_enforce_order_business
before insert or update on public.order_images
for each row execute function public.enforce_same_business('orders', 'id', 'order_id');

-- ============================================================================
-- EXPENSES
-- ============================================================================

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  category_id uuid references public.expense_categories (id) on delete set null,
  category_name text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  expense_date date not null default current_date,
  description text,
  receipt_image_path text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index expenses_business_id_idx on public.expenses (business_id);
create index expenses_business_date_idx on public.expenses (business_id, expense_date);

create trigger expenses_enforce_category_business
before insert or update on public.expenses
for each row execute function public.enforce_same_business('expense_categories', 'id', 'category_id');

create or replace function public.expenses_snapshot_category_name()
returns trigger language plpgsql as $$
begin
  if new.category_id is not null then
    select name into new.category_name from public.expense_categories where id = new.category_id;
  end if;
  return new;
end;
$$;

create trigger expenses_snapshot_category_name_trg
before insert or update of category_id on public.expenses
for each row execute function public.expenses_snapshot_category_name();

-- ============================================================================
-- SIGNUP PROVISIONING (new auth.users row -> business + profile + defaults)
-- ============================================================================

create or replace function public.seed_business_defaults(p_business_id uuid)
returns void language plpgsql as $$
begin
  insert into public.acquisition_sources (business_id, name, is_default, sort_order) values
    (p_business_id, 'Instagram', true, 1),
    (p_business_id, 'TikTok', true, 2),
    (p_business_id, 'Facebook', true, 3),
    (p_business_id, 'WhatsApp', true, 4),
    (p_business_id, 'Referral', true, 5),
    (p_business_id, 'Walk-in', true, 6),
    (p_business_id, 'Website', true, 7),
    (p_business_id, 'Google', true, 8),
    (p_business_id, 'Other', true, 9);

  insert into public.cost_categories (business_id, name, is_default, sort_order) values
    (p_business_id, 'Fabric', true, 1),
    (p_business_id, 'Lining', true, 2),
    (p_business_id, 'Buttons/Zippers', true, 3),
    (p_business_id, 'Tailoring', true, 4),
    (p_business_id, 'Embroidery', true, 5),
    (p_business_id, 'Transport', true, 6),
    (p_business_id, 'Other', true, 7);

  insert into public.expense_categories (business_id, name, is_default, sort_order) values
    (p_business_id, 'Rent', true, 1),
    (p_business_id, 'Electricity', true, 2),
    (p_business_id, 'Staff Salary', true, 3),
    (p_business_id, 'Marketing', true, 4),
    (p_business_id, 'Transportation', true, 5),
    (p_business_id, 'Equipment', true, 6),
    (p_business_id, 'Software', true, 7),
    (p_business_id, 'Packaging', true, 8),
    (p_business_id, 'Other', true, 9);
end;
$$;

-- Runs as table owner (security definer), so it can create the business/profile
-- rows atomically with the auth.users insert, bypassing RLS by ownership.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_business_name text;
  v_full_name text;
begin
  v_business_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'business_name'), ''), 'My Business');
  v_full_name := new.raw_user_meta_data ->> 'full_name';

  insert into public.businesses (name) values (v_business_name)
    returning id into v_business_id;

  insert into public.profiles (id, business_id, full_name, role)
    values (new.id, v_business_id, v_full_name, 'owner');

  perform public.seed_business_defaults(v_business_id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.businesses enable row level security;
create policy businesses_select on public.businesses for select
  using (id = public.get_current_business_id());
create policy businesses_update on public.businesses for update
  using (id = public.get_current_business_id())
  with check (id = public.get_current_business_id());

alter table public.profiles enable row level security;
create policy profiles_select on public.profiles for select
  using (id = auth.uid());
create policy profiles_update on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Standard 4-policy tenant-isolation pattern, applied uniformly so every
-- table gets the exact same predicate (single code path for RLS correctness).
do $$
declare
  t text;
  tenant_tables text[] := array[
    'acquisition_sources', 'cost_categories', 'expense_categories',
    'customer_notes', 'orders', 'order_cost_items', 'order_payments',
    'order_status_history', 'order_images', 'expenses'
  ];
begin
  foreach t in array tenant_tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I_select on public.%I for select using (business_id = public.get_current_business_id())', t, t);
    execute format('create policy %I_insert on public.%I for insert with check (business_id = public.get_current_business_id())', t, t);
    execute format('create policy %I_update on public.%I for update using (business_id = public.get_current_business_id()) with check (business_id = public.get_current_business_id())', t, t);
    execute format('create policy %I_delete on public.%I for delete using (business_id = public.get_current_business_id())', t, t);
  end loop;
end $$;

-- customers: select/insert/update only — no delete policy, ever.
-- Customer history is permanent; the DB layer enforces this, not just the UI.
alter table public.customers enable row level security;
create policy customers_select on public.customers for select
  using (business_id = public.get_current_business_id());
create policy customers_insert on public.customers for insert
  with check (business_id = public.get_current_business_id());
create policy customers_update on public.customers for update
  using (business_id = public.get_current_business_id())
  with check (business_id = public.get_current_business_id());

-- ============================================================================
-- VIEWS (security_invoker so RLS applies based on the querying user)
-- ============================================================================

create view public.customer_lifecycle with (security_invoker = true) as
select
  c.id as customer_id,
  c.business_id,
  case
    when exists (
      select 1 from public.orders o
      where o.customer_id = c.id and o.production_status not in ('delivered', 'cancelled')
    ) then 'active'
    when (
      select count(*) from public.orders o
      where o.customer_id = c.id and o.production_status <> 'cancelled'
    ) >= 2
    and exists (
      select 1 from public.orders o
      where o.customer_id = c.id and o.production_status = 'delivered'
    ) then 'returning'
    when coalesce(
      (select max(o.order_date) from public.orders o where o.customer_id = c.id and o.production_status <> 'cancelled'),
      c.created_at::date
    ) < (current_date - (b.inactive_customer_days || ' days')::interval)
    then 'inactive'
    else 'new'
  end as lifecycle_status
from public.customers c
join public.businesses b on b.id = c.business_id;

-- Flat, queryable view (customer columns + lifecycle_status) so the customer
-- list page can filter/sort/paginate directly via PostgREST without needing
-- an FK-based embed (customer_lifecycle is a derived view, not embeddable).
create view public.customers_with_lifecycle with (security_invoker = true) as
select c.*, cl.lifecycle_status
from public.customers c
join public.customer_lifecycle cl on cl.customer_id = c.id;

create view public.acquisition_source_stats with (security_invoker = true) as
select
  s.id as source_id,
  s.business_id,
  s.name,
  count(distinct c.id) as customer_count,
  coalesce(sum(o.selling_price) filter (where o.production_status <> 'cancelled'), 0) as revenue
from public.acquisition_sources s
left join public.customers c on c.acquisition_source_id = s.id
left join public.orders o on o.customer_id = c.id
group by s.id, s.business_id, s.name;

-- ============================================================================
-- ANALYTICS RPCs
-- All derive business_id from get_current_business_id() internally — callers
-- never pass a business_id, so there is no parameter to spoof.
-- ============================================================================

create or replace function public.get_dashboard_summary(p_period text)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_business_id uuid := public.get_current_business_id();
  v_tz text;
  v_now timestamp;
  v_cur_start date;
  v_cur_end date;
  v_prev_start date;
  v_prev_end date;
  v_len int;
  v_result jsonb;
begin
  select timezone into v_tz from public.businesses where id = v_business_id;
  v_now := now() at time zone coalesce(v_tz, 'UTC');

  case p_period
    when 'today' then
      v_cur_start := v_now::date;
      v_cur_end := v_now::date;
    when 'week' then
      v_cur_start := date_trunc('week', v_now)::date;
      v_cur_end := v_now::date;
    when 'month' then
      v_cur_start := date_trunc('month', v_now)::date;
      v_cur_end := v_now::date;
    when 'year' then
      v_cur_start := date_trunc('year', v_now)::date;
      v_cur_end := v_now::date;
    else
      raise exception 'Invalid period: %', p_period;
  end case;

  v_len := (v_cur_end - v_cur_start);
  v_prev_end := v_cur_start - 1;
  v_prev_start := v_prev_end - v_len;

  select jsonb_build_object(
    'period', p_period,
    'range', jsonb_build_object('start', v_cur_start, 'end', v_cur_end),
    'revenue', jsonb_build_object(
      'current', coalesce((select sum(selling_price) from public.orders where business_id = v_business_id and production_status <> 'cancelled' and order_date between v_cur_start and v_cur_end), 0),
      'previous', coalesce((select sum(selling_price) from public.orders where business_id = v_business_id and production_status <> 'cancelled' and order_date between v_prev_start and v_prev_end), 0)
    ),
    'production_cost', jsonb_build_object(
      'current', coalesce((select sum(total_cost) from public.orders where business_id = v_business_id and production_status <> 'cancelled' and order_date between v_cur_start and v_cur_end), 0),
      'previous', coalesce((select sum(total_cost) from public.orders where business_id = v_business_id and production_status <> 'cancelled' and order_date between v_prev_start and v_prev_end), 0)
    ),
    'gross_profit', jsonb_build_object(
      'current', coalesce((select sum(profit) from public.orders where business_id = v_business_id and production_status <> 'cancelled' and order_date between v_cur_start and v_cur_end), 0),
      'previous', coalesce((select sum(profit) from public.orders where business_id = v_business_id and production_status <> 'cancelled' and order_date between v_prev_start and v_prev_end), 0)
    ),
    'orders', jsonb_build_object(
      'new', coalesce((select count(*) from public.orders where business_id = v_business_id and order_date between v_cur_start and v_cur_end), 0),
      'active', coalesce((select count(*) from public.orders where business_id = v_business_id and production_status not in ('delivered', 'cancelled')), 0),
      'completed', coalesce((select count(*) from public.orders where business_id = v_business_id and production_status = 'delivered' and order_date between v_cur_start and v_cur_end), 0),
      'cancelled', coalesce((select count(*) from public.orders where business_id = v_business_id and production_status = 'cancelled' and order_date between v_cur_start and v_cur_end), 0)
    ),
    'customers', jsonb_build_object(
      'total', coalesce((select count(*) from public.customers where business_id = v_business_id), 0),
      'new_this_period', coalesce((select count(*) from public.customers where business_id = v_business_id and created_at::date between v_cur_start and v_cur_end), 0),
      'returning', coalesce((select count(*) from public.customer_lifecycle where business_id = v_business_id and lifecycle_status = 'returning'), 0),
      'inactive', coalesce((select count(*) from public.customer_lifecycle where business_id = v_business_id and lifecycle_status = 'inactive'), 0)
    ),
    'outstanding_balance', coalesce((select sum(outstanding_balance) from public.orders where business_id = v_business_id and production_status <> 'cancelled'), 0)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.get_revenue_analytics(p_start date, p_end date, p_granularity text default 'day')
returns table (
  bucket date,
  revenue numeric,
  production_cost numeric,
  profit numeric,
  order_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    date_trunc(p_granularity, o.order_date)::date as bucket,
    coalesce(sum(o.selling_price), 0) as revenue,
    coalesce(sum(o.total_cost), 0) as production_cost,
    coalesce(sum(o.profit), 0) as profit,
    count(*) as order_count
  from public.orders o
  where o.business_id = public.get_current_business_id()
    and o.production_status <> 'cancelled'
    and o.order_date between p_start and p_end
  group by 1
  order by 1
$$;

create or replace function public.get_profit_and_loss(p_start date, p_end date)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_business_id uuid := public.get_current_business_id();
  v_revenue numeric;
  v_production_cost numeric;
  v_expenses numeric;
begin
  select coalesce(sum(selling_price), 0), coalesce(sum(total_cost), 0)
    into v_revenue, v_production_cost
    from public.orders
    where business_id = v_business_id and production_status <> 'cancelled'
      and order_date between p_start and p_end;

  select coalesce(sum(amount), 0) into v_expenses
    from public.expenses
    where business_id = v_business_id and expense_date between p_start and p_end;

  return jsonb_build_object(
    'range', jsonb_build_object('start', p_start, 'end', p_end),
    'revenue', v_revenue,
    'production_cost', v_production_cost,
    'expenses', v_expenses,
    'net_profit', v_revenue - v_production_cost - v_expenses
  );
end;
$$;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('order-images', 'order-images', false),
  ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy avatars_public_read on storage.objects for select
  using (bucket_id = 'avatars');

create policy avatars_tenant_write on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = public.get_current_business_id()::text);

create policy avatars_tenant_update on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = public.get_current_business_id()::text);

create policy avatars_tenant_delete on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = public.get_current_business_id()::text);

create policy order_images_tenant_all on storage.objects for all
  using (bucket_id = 'order-images' and (storage.foldername(name))[1] = public.get_current_business_id()::text)
  with check (bucket_id = 'order-images' and (storage.foldername(name))[1] = public.get_current_business_id()::text);

create policy receipts_tenant_all on storage.objects for all
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = public.get_current_business_id()::text)
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = public.get_current_business_id()::text);
