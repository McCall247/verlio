-- ============================================================================
-- Personal accounts — a second account type alongside businesses, for
-- individuals tracking their own income and spending day-to-day rather than
-- running a customer/order-based business.
-- ============================================================================

create type public.account_type as enum ('business', 'personal');

alter table public.businesses
  add column account_type public.account_type not null default 'business';

-- ============================================================================
-- INCOME (personal-account equivalent of expenses — same shape, mirrored
-- deliberately so the settings/config-list machinery below can stay generic)
-- ============================================================================

create table public.income_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);
create index income_categories_business_id_idx on public.income_categories (business_id);

create table public.income_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  category_id uuid references public.income_categories (id) on delete set null,
  category_name text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  income_date date not null default current_date,
  description text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index income_entries_business_id_idx on public.income_entries (business_id);
create index income_entries_business_date_idx on public.income_entries (business_id, income_date);

create trigger income_entries_enforce_category_business
before insert or update on public.income_entries
for each row execute function public.enforce_same_business('income_categories', 'id', 'category_id');

create or replace function public.income_entries_snapshot_category_name()
returns trigger language plpgsql as $$
begin
  if new.category_id is not null then
    select name into new.category_name from public.income_categories where id = new.category_id;
  end if;
  return new;
end;
$$;

create trigger income_entries_snapshot_category_name_trg
before insert or update of category_id on public.income_entries
for each row execute function public.income_entries_snapshot_category_name();

-- Same 4-policy tenant-isolation pattern as init.sql, applied to the two new tables.
do $$
declare
  t text;
  new_tenant_tables text[] := array['income_categories', 'income_entries'];
begin
  foreach t in array new_tenant_tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I_select on public.%I for select using (business_id = public.get_current_business_id())', t, t);
    execute format('create policy %I_insert on public.%I for insert with check (business_id = public.get_current_business_id())', t, t);
    execute format('create policy %I_update on public.%I for update using (business_id = public.get_current_business_id()) with check (business_id = public.get_current_business_id())', t, t);
    execute format('create policy %I_delete on public.%I for delete using (business_id = public.get_current_business_id())', t, t);
  end loop;
end $$;

-- ============================================================================
-- Personal-account signup defaults (business accounts keep using
-- seed_business_defaults, unchanged)
-- ============================================================================

create or replace function public.seed_personal_defaults(p_business_id uuid)
returns void language plpgsql as $$
begin
  insert into public.income_categories (business_id, name, is_default, sort_order) values
    (p_business_id, 'Salary', true, 1),
    (p_business_id, 'Freelance', true, 2),
    (p_business_id, 'Business Income', true, 3),
    (p_business_id, 'Gift', true, 4),
    (p_business_id, 'Investment', true, 5),
    (p_business_id, 'Other', true, 6);

  insert into public.expense_categories (business_id, name, is_default, sort_order) values
    (p_business_id, 'Groceries', true, 1),
    (p_business_id, 'Rent/Mortgage', true, 2),
    (p_business_id, 'Utilities', true, 3),
    (p_business_id, 'Transport', true, 4),
    (p_business_id, 'Entertainment', true, 5),
    (p_business_id, 'Subscriptions', true, 6),
    (p_business_id, 'Health', true, 7),
    (p_business_id, 'Savings', true, 8),
    (p_business_id, 'Other', true, 9);
end;
$$;

-- Branch signup provisioning on the account_type chosen at registration.
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
  v_account_type public.account_type;
begin
  v_business_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'business_name'), ''), 'My Business');
  v_full_name := new.raw_user_meta_data ->> 'full_name';
  v_account_type := coalesce((new.raw_user_meta_data ->> 'account_type')::public.account_type, 'business');

  insert into public.businesses (name, account_type) values (v_business_name, v_account_type)
    returning id into v_business_id;

  insert into public.profiles (id, business_id, full_name, role)
    values (new.id, v_business_id, v_full_name, 'owner');

  if v_account_type = 'personal' then
    perform public.seed_personal_defaults(v_business_id);
  else
    perform public.seed_business_defaults(v_business_id);
  end if;

  return new;
end;
$$;

-- ============================================================================
-- Personal dashboard summary RPC — mirrors get_dashboard_summary's period
-- comparison pattern, but rolls up income/expenses instead of orders.
-- ============================================================================

create or replace function public.get_personal_summary(p_period text)
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
    'income', jsonb_build_object(
      'current', coalesce((select sum(amount) from public.income_entries where business_id = v_business_id and income_date between v_cur_start and v_cur_end), 0),
      'previous', coalesce((select sum(amount) from public.income_entries where business_id = v_business_id and income_date between v_prev_start and v_prev_end), 0)
    ),
    'expenses', jsonb_build_object(
      'current', coalesce((select sum(amount) from public.expenses where business_id = v_business_id and expense_date between v_cur_start and v_cur_end), 0),
      'previous', coalesce((select sum(amount) from public.expenses where business_id = v_business_id and expense_date between v_prev_start and v_prev_end), 0)
    ),
    'net', jsonb_build_object(
      'current',
        coalesce((select sum(amount) from public.income_entries where business_id = v_business_id and income_date between v_cur_start and v_cur_end), 0)
        - coalesce((select sum(amount) from public.expenses where business_id = v_business_id and expense_date between v_cur_start and v_cur_end), 0),
      'previous',
        coalesce((select sum(amount) from public.income_entries where business_id = v_business_id and income_date between v_prev_start and v_prev_end), 0)
        - coalesce((select sum(amount) from public.expenses where business_id = v_business_id and expense_date between v_prev_start and v_prev_end), 0)
    ),
    'all_time_balance',
      coalesce((select sum(amount) from public.income_entries where business_id = v_business_id), 0)
      - coalesce((select sum(amount) from public.expenses where business_id = v_business_id), 0)
  ) into v_result;

  return v_result;
end;
$$;
