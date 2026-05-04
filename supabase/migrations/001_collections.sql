-- Uma linha por código de sincronização (sync id). A API usa a service role (sem auth de utilizador por agora).
create table if not exists public.collections (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists collections_updated_at_idx on public.collections (updated_at desc);

alter table public.collections enable row level security;

-- Sem políticas para anon/authenticated: apenas a service role (API server-side) acede.
comment on table public.collections is 'Álbum WC2026: mapa código figurinha -> true (tenho)';
