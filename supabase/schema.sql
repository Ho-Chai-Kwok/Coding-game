-- Code Quest — Supabase schema
-- Run this once in your project's SQL Editor (https://supabase.com/dashboard
-- → your project → SQL Editor → New query → paste → Run).
--
-- Two tables:
--   profiles  — one row per user, display name + preferred UI language
--   progress  — one row per user, a single JSON blob holding everything
--               (worlds/levels completed, side quests, ranked stats).
--               A JSON blob keeps this simple: the app already has a
--               well-defined shape for this state, and there's no need
--               for a fully relational schema across 100 worlds worth
--               of levels for a single-player progress save.
--
-- Row Level Security (RLS) ensures each user can only ever read or write
-- their own row — this is what actually makes the client-exposed anon
-- key safe to use.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Coder',
  ui_language text not null default 'en',
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can view their own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.progress for update
  using (auth.uid() = user_id);

-- Automatically create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Coder'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Lets a signed-in user permanently delete their own account. The profile
-- and progress rows are removed automatically (on delete cascade above).
-- Run this once in the SQL Editor, same as the rest of this file.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
