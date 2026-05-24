create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

insert into public.site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
