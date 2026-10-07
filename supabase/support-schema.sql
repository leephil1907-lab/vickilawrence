-- Vicki Lawrence support chat: secure realtime schema
-- Run this in the Supabase SQL Editor after creating the project.
create extension if not exists pgcrypto;

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  visitor_name text,
  visitor_email text,
  status text not null default 'open' check (status in ('open','pending','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('visitor','admin')),
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists support_conversations_user_idx on public.support_conversations(user_id);
create index if not exists support_conversations_last_message_idx on public.support_conversations(last_message_at desc);
create index if not exists support_messages_conversation_idx on public.support_messages(conversation_id,created_at);

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

create or replace function public.is_support_admin()
returns boolean
language sql
stable
as $$
  select coalesce((select auth.jwt()->'app_metadata'->>'role') = 'admin', false);
$$;

drop policy if exists "visitor creates own conversation" on public.support_conversations;
create policy "visitor creates own conversation" on public.support_conversations for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "visitor reads own conversation" on public.support_conversations;
create policy "visitor reads own conversation" on public.support_conversations for select to authenticated using ((select auth.uid()) = user_id or public.is_support_admin());

drop policy if exists "admin updates conversations" on public.support_conversations;
create policy "admin updates conversations" on public.support_conversations for update to authenticated using (public.is_support_admin()) with check (public.is_support_admin());

drop policy if exists "visitor reads own messages" on public.support_messages;
create policy "visitor reads own messages" on public.support_messages for select to authenticated using (
  exists (select 1 from public.support_conversations c where c.id=support_messages.conversation_id and c.user_id=(select auth.uid()))
  or public.is_support_admin()
);

drop policy if exists "visitor sends own messages" on public.support_messages;
create policy "visitor sends own messages" on public.support_messages for insert to authenticated with check (
  sender_type='visitor' and sender_id=(select auth.uid())
  and exists (select 1 from public.support_conversations c where c.id=support_messages.conversation_id and c.user_id=(select auth.uid()))
);

drop policy if exists "admin sends replies" on public.support_messages;
create policy "admin sends replies" on public.support_messages for insert to authenticated with check (public.is_support_admin() and sender_type='admin' and sender_id=(select auth.uid()));

create or replace function public.touch_support_conversation()
returns trigger
language plpgsql
as $$
begin
  update public.support_conversations
  set updated_at=now(), last_message_at=now()
  where id=new.conversation_id;
  return new;
end;
$$;

drop trigger if exists support_message_touch on public.support_messages;
create trigger support_message_touch after insert on public.support_messages
for each row execute function public.touch_support_conversation();

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='support_conversations') then
    alter publication supabase_realtime add table public.support_conversations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='support_messages') then
    alter publication supabase_realtime add table public.support_messages;
  end if;
end $$;

-- IMPORTANT:
-- 1) Enable Auth > Anonymous Sign-Ins.
-- 2) Create the support administrator as a normal Auth user.
-- 3) Assign app_metadata.role='admin' from a trusted server/admin workflow; never from the browser.
-- 4) Never put a Supabase secret/service_role key in the public site or admin browser.
