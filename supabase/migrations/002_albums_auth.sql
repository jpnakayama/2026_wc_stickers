-- Álbum por utilizador autenticado (Google OAuth, etc.). RLS: cada um só vê a sua linha.

create table if not exists public.albums (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists albums_updated_at_idx on public.albums (updated_at desc);

alter table public.albums enable row level security;

drop policy if exists "albums_select_own" on public.albums;
drop policy if exists "albums_insert_own" on public.albums;
drop policy if exists "albums_update_own" on public.albums;

create policy "albums_select_own"
  on public.albums for select
  to authenticated
  using (auth.uid() = user_id);

create policy "albums_insert_own"
  on public.albums for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "albums_update_own"
  on public.albums for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.albums is 'Álbum WC2026 por user_id; payload = mapa código -> true';
