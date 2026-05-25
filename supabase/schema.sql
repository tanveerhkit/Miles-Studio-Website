create extension if not exists pgcrypto;

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content
for select
using (true);

grant usage on schema public to anon, authenticated, service_role;
grant select on public.site_content to anon, authenticated, service_role;
grant insert, update, delete on public.site_content to service_role;

insert into public.site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Public can create contact messages" on public.contact_messages;
create policy "Public can create contact messages"
on public.contact_messages
for insert
with check (true);

grant insert on public.contact_messages to anon, authenticated;
grant select, insert, delete on public.contact_messages to service_role;
