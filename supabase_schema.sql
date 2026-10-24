-- CONTREPOIDS — base de données Supabase
-- À exécuter une seule fois dans Supabase > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('CP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  name text not null check (char_length(trim(name)) between 2 and 120),
  phone text check (phone is null or char_length(phone) <= 40),
  service text not null check (char_length(trim(service)) between 2 and 120),
  message text not null check (char_length(trim(message)) between 2 and 3000),
  status text not null default 'nouveau' check (status in ('nouveau', 'en_cours', 'traite', 'archive')),
  created_at timestamptz not null default now()
);

alter table public.contact_requests enable row level security;
grant insert on public.contact_requests to anon, authenticated;
-- Un visiteur peut créer une demande, mais ne peut ni lire ni modifier les demandes.
drop policy if exists "Visitors can submit a request" on public.contact_requests;
create policy "Visitors can submit a request"
  on public.contact_requests for insert to anon, authenticated
  with check (
    char_length(trim(name)) between 2 and 120 and
    char_length(trim(service)) between 2 and 120 and
    char_length(trim(message)) between 2 and 3000 and
    (phone is null or char_length(phone) <= 40)
  );

create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null check (char_length(session_id) between 8 and 100),
  event_name text not null check (char_length(event_name) between 1 and 80),
  page_path text not null check (char_length(page_path) between 1 and 300),
  created_at timestamptz not null default now()
);
alter table public.site_events enable row level security;
grant insert on public.site_events to anon, authenticated;
drop policy if exists "Visitors can register anonymous site events" on public.site_events;
create policy "Visitors can register anonymous site events"
  on public.site_events for insert to anon, authenticated
  with check (
    char_length(session_id) between 8 and 100 and
    char_length(event_name) between 1 and 80 and
    char_length(page_path) between 1 and 300
  );

-- Aucun droit SELECT public : les demandes et statistiques restent privées.
-- Pour consulter les commandes, ouvrez Supabase > Table Editor après connexion au compte propriétaire.
