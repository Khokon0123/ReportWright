-- ReportWright database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- ============================================================
-- users: app-level profile, one row per auth.users entry
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  agency_name text,
  logo_url text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Automatically create a public.users row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- google_connections: one Google Ads OAuth grant per user
-- ============================================================
create table if not exists public.google_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  token_expiry timestamptz not null,
  connected_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.google_connections enable row level security;

create policy "Users manage their own google connection"
  on public.google_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- clients: Google Ads customer accounts a user reports on
-- ============================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  google_ads_customer_id text not null,
  client_name text not null,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users manage their own clients"
  on public.clients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- reports: generated report runs (metrics + narrative + pdf)
-- ============================================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  date_range_start date not null,
  date_range_end date not null,
  metrics_json jsonb,
  narrative_text text,
  status text not null default 'pending' check (status in ('pending', 'generating', 'complete', 'failed')),
  pdf_url text,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Users manage their own reports"
  on public.reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists reports_user_id_idx on public.reports (user_id);
create index if not exists reports_client_id_idx on public.reports (client_id);

-- ============================================================
-- storage: bucket for agency logos and generated PDFs
-- ============================================================
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('reports', 'reports', true)
on conflict (id) do nothing;

create policy "Users upload their own logo"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Logos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Users upload their own report pdfs"
  on storage.objects for insert
  with check (bucket_id = 'reports' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Report pdfs are publicly readable"
  on storage.objects for select
  using (bucket_id = 'reports');
