-- Vicki Lawrence private control-center foundation
-- Run this in the Supabase SQL editor for the project.

create extension if not exists pgcrypto;

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  visitor_name text,
  visitor_email text,
  status text not null default 'open' check (status in ('open','pending','closed')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('visitor','admin')),
  sender_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  button_text text,
  button_url text,
  placement text not null default 'homepage' check (placement in ('homepage','news','both')),
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  starts_at timestamptz,
  image_url text,
  rsvp_url text,
  status text not null default 'draft' check (status in ('draft','published','cancelled')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.special_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  requester_email text not null,
  request_type text not null,
  recipient text,
  occasion text,
  details text not null,
  preferred_delivery_date date,
  status text not null default 'new' check (status in ('new','review','approved','invoiced','paid','fulfilled','declined')),
  invoice_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  client_name text not null,
  client_email text,
  currency text not null default 'USD' check (currency in ('USD','EUR')),
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft','sent','paid','void','overdue')),
  issue_date date not null default current_date,
  due_date date,
  items jsonb not null default '[]'::jsonb,
  payment_instructions text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  alt_text text,
  caption text,
  category text,
  featured boolean not null default false,
  published boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;
alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.special_requests enable row level security;
alter table public.invoices enable row level security;
alter table public.gallery_items enable row level security;
alter table public.activity_log enable row level security;

-- Admin authorization uses server-controlled app_metadata.role.
create policy "visitors create own conversations" on public.support_conversations
for insert to authenticated
with check (user_id = (select auth.uid()));

create policy "visitors read own conversations" on public.support_conversations
for select to authenticated
using (user_id = (select auth.uid()));

create policy "admins manage support conversations" on public.support_conversations
for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "visitors insert own messages" on public.support_messages
for insert to authenticated
with check (sender_type = 'visitor' and sender_id = (select auth.uid()) and exists (select 1 from public.support_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));

create policy "visitors read own messages" on public.support_messages
for select to authenticated
using (exists (select 1 from public.support_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));

create policy "admins manage support messages" on public.support_messages
for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "admins manage announcements" on public.announcements
for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "public reads published announcements" on public.announcements
for select to anon, authenticated
using (status = 'published' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));

create policy "admins manage events" on public.events
for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "admins manage requests" on public.special_requests
for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "admins manage invoices" on public.invoices
for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "admins manage gallery" on public.gallery_items
for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "public reads published gallery" on public.gallery_items
for select to anon, authenticated
using (published = true);

create policy "admins read activity log" on public.activity_log
for select to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "admins write activity log" on public.activity_log
for insert to authenticated
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create or replace function public.touch_support_conversation()
returns trigger
language plpgsql
security invoker
as $$
begin
  update public.support_conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists support_message_touch on public.support_messages;
create trigger support_message_touch
after insert on public.support_messages
for each row execute function public.touch_support_conversation();

-- Enable realtime for live support and publishing updates.
alter publication supabase_realtime add table public.support_conversations;
alter publication supabase_realtime add table public.support_messages;
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.events;


-- Dynamic archive expansion: works, newsletter, merch, fan community and notification feeds.
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  work_type text not null check (work_type in ('television','film','music','stage','voice','other')),
  year integer,
  description text,
  poster_url text,
  trailer_url text,
  credits jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  published boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text,
  status text not null default 'subscribed' check (status in ('subscribed','unsubscribed')),
  source text default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  price numeric(12,2) not null default 0,
  currency text not null default 'USD' check (currency in ('USD','EUR')),
  stripe_price_id text,
  checkout_url text,
  inventory integer,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fan_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  display_name text not null,
  body text not null,
  media_url text,
  post_type text not null default 'message' check (post_type in ('message','fan_art','submission')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  target text not null default 'all' check (target in ('all','members','vip')),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.works enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.products enable row level security;
alter table public.fan_posts enable row level security;
alter table public.notifications enable row level security;

create policy "public reads published works" on public.works
for select to anon, authenticated using (published = true);
create policy "admins manage works" on public.works
for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin')
with check ((select auth.jwt()->'app_metadata'->>'role')='admin');

create policy "public subscribes newsletter" on public.newsletter_subscribers
for insert to anon, authenticated with check (status = 'subscribed');
create policy "admins manage newsletter" on public.newsletter_subscribers
for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin')
with check ((select auth.jwt()->'app_metadata'->>'role')='admin');

create policy "public reads published products" on public.products
for select to anon, authenticated using (published = true);
create policy "admins manage products" on public.products
for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin')
with check ((select auth.jwt()->'app_metadata'->>'role')='admin');

create policy "authenticated submit fan posts" on public.fan_posts
for insert to authenticated with check (user_id = (select auth.uid()));
create policy "public reads approved fan posts" on public.fan_posts
for select to anon, authenticated using (status = 'approved');
create policy "admins manage fan posts" on public.fan_posts
for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin')
with check ((select auth.jwt()->'app_metadata'->>'role')='admin');

create policy "public reads published notifications" on public.notifications
for select to authenticated using (published = true);
create policy "admins manage notifications" on public.notifications
for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin')
with check ((select auth.jwt()->'app_metadata'->>'role')='admin');

do $
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='works') then
    alter publication supabase_realtime add table public.works;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='products') then
    alter publication supabase_realtime add table public.products;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='fan_posts') then
    alter publication supabase_realtime add table public.fan_posts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $;