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


-- ============================================================
-- Ranked Mode: real player-vs-player matchmaking
-- Run this block once in the SQL Editor too, same as the rest of this
-- file — it only adds new tables/functions, nothing above is touched.
-- Requires being signed in (not a guest): matchmaking needs a stable
-- identity to pair two devices together, which guests don't have.
--
-- Design: two tables, and every write to them goes through one of the
-- SECURITY DEFINER functions below (never a raw insert/update/delete from
-- the client) — each function trusts only auth.uid(), never a
-- client-supplied "which player am I" value, so a match's real result and
-- rank change can't be forged by either side. This mirrors
-- delete_my_account() above.
-- ============================================================

create extension if not exists pgcrypto;

-- One row per player currently waiting for an opponent in a given mode.
-- Only touched by try_ranked_match()/leave_ranked_queue() below.
create table if not exists public.ranked_queue (
  user_id uuid primary key references auth.users (id) on delete cascade,
  mode_id text not null,
  points int not null,
  display_name text not null,
  joined_at timestamptz not null default now(),
  -- Refreshed on every poll (see try_ranked_match() below) — distinct
  -- from joined_at, which stays fixed so the widen-over-time search
  -- schedule reflects real wait time. A row whose last_seen_at goes
  -- stale (closed tab, crash — no more polls) simply stops being
  -- matchable a few seconds later, with no separate cleanup job needed.
  last_seen_at timestamptz not null default now()
);

alter table public.ranked_queue enable row level security;

create policy "Users can view their own queue entry"
  on public.ranked_queue for select
  using (auth.uid() = user_id);

-- One row per matched pair, playing the same seeded content so neither
-- side gets an easier draw. Only touched by try_ranked_match() (creates
-- it) and submit_ranked_result()/claim_forfeit_win() (settle it) below.
create table if not exists public.ranked_matches (
  id uuid primary key default gen_random_uuid(),
  mode_id text not null,
  player1_id uuid not null references auth.users (id) on delete cascade,
  player2_id uuid not null references auth.users (id) on delete cascade,
  player1_name text not null,
  player2_name text not null,
  player1_points int not null,
  player2_points int not null,
  seed int not null,
  status text not null default 'active', -- 'active' | 'settled'
  player1_result jsonb,
  player2_result jsonb,
  winner_id uuid,
  player1_delta int,
  player2_delta int,
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

alter table public.ranked_matches enable row level security;

create policy "Players can view their own match"
  on public.ranked_matches for select
  using (auth.uid() = player1_id or auth.uid() = player2_id);

-- Realtime: lets both players' clients receive live updates on their
-- match row (the opponent's result landing, settlement) without polling.
alter publication supabase_realtime add table public.ranked_matches;

-- Atomically finds the closest-ranked waiting opponent in `p_mode_id`
-- within `p_max_gap` LP and pairs with them, or (if no one close enough
-- is waiting) joins/refreshes the caller's own queue entry and returns no
-- match yet. The client re-calls this every couple of seconds while
-- waiting, growing `p_max_gap` each time — so a close-rank opponent is
-- always preferred, but the search widens over time instead of waiting
-- forever for a perfect match. `for update skip locked` keeps two
-- players who poll at the same instant from both grabbing the same
-- opponent.
create or replace function public.try_ranked_match(
  p_mode_id text,
  p_points int,
  p_display_name text,
  p_max_gap int
)
returns table (match_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_opponent record;
  v_match_id uuid;
  v_seed int;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  -- Someone else's poll may have already matched us since our last call.
  select id into v_match_id from public.ranked_matches
    where (player1_id = auth.uid() or player2_id = auth.uid())
      and status = 'active'
      and created_at > now() - interval '2 minutes'
    order by created_at desc limit 1;
  if v_match_id is not null then
    return query select v_match_id;
    return;
  end if;

  select * into v_opponent from public.ranked_queue
    where mode_id = p_mode_id
      and user_id <> auth.uid()
      and abs(points - p_points) <= p_max_gap
      and last_seen_at > now() - interval '15 seconds'
    order by abs(points - p_points) asc, joined_at asc
    for update skip locked
    limit 1;

  if v_opponent.user_id is not null then
    delete from public.ranked_queue where user_id = v_opponent.user_id;
    delete from public.ranked_queue where user_id = auth.uid();
    v_seed := floor(random() * 2147483647)::int;
    insert into public.ranked_matches (
      mode_id, player1_id, player2_id, player1_name, player2_name,
      player1_points, player2_points, seed
    ) values (
      p_mode_id, v_opponent.user_id, auth.uid(), v_opponent.display_name, p_display_name,
      v_opponent.points, p_points, v_seed
    ) returning id into v_match_id;
    return query select v_match_id;
    return;
  end if;

  insert into public.ranked_queue (user_id, mode_id, points, display_name)
    values (auth.uid(), p_mode_id, p_points, p_display_name)
    on conflict (user_id) do update
      -- joined_at is deliberately left untouched on conflict (defaults to
      -- the existing row's value) so re-polling doesn't reset the widen
      -- schedule; last_seen_at always refreshes to now().
      set mode_id = excluded.mode_id, points = excluded.points,
          display_name = excluded.display_name, last_seen_at = now();

  return query select null::uuid;
end;
$$;

revoke all on function public.try_ranked_match(text, int, text, int) from public, anon;
grant execute on function public.try_ranked_match(text, int, text, int) to authenticated;

-- Leaves the queue (Cancel button, or navigating away while searching).
create or replace function public.leave_ranked_queue()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.ranked_queue where user_id = auth.uid();
$$;

revoke all on function public.leave_ranked_queue() from public, anon;
grant execute on function public.leave_ranked_queue() to authenticated;

-- Submits the caller's own score for a match. Once BOTH sides have
-- reported, settles it: higher score wins (a tie on score is broken by
-- who finished first; an exact tie on both is a draw), and each player's
-- LP change is a zero-sum, ELO-style swing computed from their *real*
-- rank going into the match — beating a higher-ranked opponent nets more
-- than beating a lower-ranked one, and vice versa for a loss. This is the
-- only place LP changes for a ranked match; the client only ever learns
-- the result after the fact, from this row.
create or replace function public.submit_ranked_result(
  p_match_id uuid,
  p_score numeric,
  p_finished_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  p1_score numeric; p2_score numeric;
  p1_finished timestamptz; p2_finished timestamptz;
  expected numeric;
  k constant int := 40;
  winner uuid;
  p1_delta int; p2_delta int;
begin
  select * into m from public.ranked_matches where id = p_match_id for update;
  if m is null then raise exception 'Match not found'; end if;
  if m.status = 'settled' then return; end if;
  if auth.uid() <> m.player1_id and auth.uid() <> m.player2_id then
    raise exception 'Not a player in this match';
  end if;

  if auth.uid() = m.player1_id then
    update public.ranked_matches
      set player1_result = jsonb_build_object('score', p_score, 'finishedAt', p_finished_at)
      where id = p_match_id;
  else
    update public.ranked_matches
      set player2_result = jsonb_build_object('score', p_score, 'finishedAt', p_finished_at)
      where id = p_match_id;
  end if;

  select (player1_result ->> 'score')::numeric, (player2_result ->> 'score')::numeric,
         (player1_result ->> 'finishedAt')::timestamptz, (player2_result ->> 'finishedAt')::timestamptz
    into p1_score, p2_score, p1_finished, p2_finished
    from public.ranked_matches where id = p_match_id;

  if p1_score is null or p2_score is null then
    return; -- still waiting on the other player
  end if;

  if p1_score > p2_score or (p1_score = p2_score and p1_finished < p2_finished) then
    winner := m.player1_id;
  elsif p2_score > p1_score or (p2_score = p1_score and p2_finished < p1_finished) then
    winner := m.player2_id;
  else
    winner := null; -- identical score AND identical timestamp — a true draw
  end if;

  expected := 1.0 / (1.0 + power(10.0, (m.player2_points - m.player1_points) / 400.0));
  if winner = m.player1_id then
    p1_delta := round(k * (1 - expected))::int;
  elsif winner = m.player2_id then
    p1_delta := round(k * (0 - expected))::int;
  else
    p1_delta := round(k * (0.5 - expected))::int;
  end if;
  p2_delta := -p1_delta;

  update public.ranked_matches
    set status = 'settled', winner_id = winner,
        player1_delta = p1_delta, player2_delta = p2_delta,
        settled_at = now()
    where id = p_match_id;
end;
$$;

revoke all on function public.submit_ranked_result(uuid, numeric, timestamptz) from public, anon;
grant execute on function public.submit_ranked_result(uuid, numeric, timestamptz) to authenticated;

-- If an opponent disconnects mid-match, the caller isn't stuck forever:
-- once at least 45 seconds have passed since the caller submitted their
-- own result with no reply from the other side, they can claim the win.
-- Uses the same zero-sum ELO calculation as submit_ranked_result().
create or replace function public.claim_forfeit_win(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  caller_result jsonb;
  caller_finished timestamptz;
  expected numeric;
  k constant int := 40;
  p1_delta int; p2_delta int;
begin
  select * into m from public.ranked_matches where id = p_match_id for update;
  if m is null then raise exception 'Match not found'; end if;
  if m.status = 'settled' then return; end if;
  if auth.uid() <> m.player1_id and auth.uid() <> m.player2_id then
    raise exception 'Not a player in this match';
  end if;

  caller_result := case when auth.uid() = m.player1_id then m.player1_result else m.player2_result end;
  if caller_result is null then
    raise exception 'Finish the match yourself before claiming a forfeit win';
  end if;
  caller_finished := (caller_result ->> 'finishedAt')::timestamptz;
  if now() - caller_finished < interval '45 seconds' then
    raise exception 'Give your opponent a bit more time';
  end if;

  expected := 1.0 / (1.0 + power(10.0, (m.player2_points - m.player1_points) / 400.0));
  if auth.uid() = m.player1_id then
    p1_delta := round(k * (1 - expected))::int;
  else
    p1_delta := round(k * (0 - expected))::int;
  end if;
  p2_delta := -p1_delta;

  update public.ranked_matches
    set status = 'settled', winner_id = auth.uid(),
        player1_delta = p1_delta, player2_delta = p2_delta,
        settled_at = now()
    where id = p_match_id;
end;
$$;

revoke all on function public.claim_forfeit_win(uuid) from public, anon;
grant execute on function public.claim_forfeit_win(uuid) to authenticated;


-- ============================================================
-- Ranked Mode: server-side LP storage
-- Run this block once in the SQL Editor too — it only adds one new table
-- plus a few functions/redefinitions, nothing above is touched except
-- try_ranked_match() and submit_ranked_result()/claim_forfeit_win(),
-- which are redefined in place (see the "drop function" line below —
-- try_ranked_match()'s parameter list changes, which Postgres treats as
-- a different function unless the old one is dropped first).
--
-- Until now, a signed-in player's actual LP number lived only in the
-- `progress` table's free-form JSON blob, which RLS only restricts by
-- *whose* row it is, never *what value* is written — so while a match's
-- outcome/delta couldn't be forged (see submit_ranked_result() above),
-- nothing stopped a client from just writing a new rankedPoints number
-- into their own progress blob directly and skipping the ladder
-- entirely. ranked_stats closes that: the client can only ever SELECT
-- it, every write goes through a SECURITY DEFINER function, and the one
-- function a client can call that sets a starting value
-- (claim_initial_ranked_stats) only ever fires once per account and only
-- ever INSERTs — it can't overwrite an existing row, so after the first
-- real match it's permanently out of the client's hands.
-- ============================================================

create table if not exists public.ranked_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  points int not null default 0,
  peak_points int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  shield int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.ranked_stats enable row level security;

create policy "Users can view their own ranked stats"
  on public.ranked_stats for select
  using (auth.uid() = user_id);

-- One-time migration bootstrap: seeds ranked_stats from whatever the
-- client's local/cloud progress blob already said (the only place a
-- client gets to self-report one of these numbers, and only because
-- there's genuinely no other source for LP earned before this table
-- existed — there's no leaderboard yet for this to matter to). Safe to
-- call on every login: if a row already exists for this account, this is
-- a complete no-op (`on conflict do nothing`) and just returns the real
-- stored values instead.
create or replace function public.claim_initial_ranked_stats(
  p_points int, p_peak_points int, p_wins int, p_losses int, p_shield int
)
returns table (points int, peak_points int, wins int, losses int, shield int)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  insert into public.ranked_stats (user_id, points, peak_points, wins, losses, shield)
  values (
    auth.uid(),
    greatest(0, coalesce(p_points, 0)),
    greatest(0, coalesce(p_peak_points, 0)),
    greatest(0, coalesce(p_wins, 0)),
    greatest(0, coalesce(p_losses, 0)),
    greatest(0, coalesce(p_shield, 0))
  )
  on conflict (user_id) do nothing;

  return query select s.points, s.peak_points, s.wins, s.losses, s.shield
    from public.ranked_stats s where s.user_id = auth.uid();
end;
$$;

revoke all on function public.claim_initial_ranked_stats(int, int, int, int, int) from public, anon;
grant execute on function public.claim_initial_ranked_stats(int, int, int, int, int) to authenticated;

-- Internal only — deliberately NOT granted to authenticated (see the
-- revoke below): if a client could call this directly, they could hand
-- it arbitrary deltas and forge any rank. It only ever runs as a step
-- inside submit_ranked_result()/claim_forfeit_win(), which are
-- themselves SECURITY DEFINER, so the privilege check that matters
-- already happened by the time this runs.
--
-- Applies one settled match's already-computed, zero-sum deltas to both
-- real players' stored LP: clamped at 0, the tier-floor promotion shield
-- and its 3-match refresh work exactly like the client's own display
-- math (see getRankInfo()/TIERS in src/data/rank.js — tiers are exactly
-- 1000 points apart, so tier = least(6, points / 1000) mirrors that
-- table without needing to duplicate it here), wins/losses come from the
-- real winner_id (a draw increments neither), and peak_points tracks the
-- highest LP ever reached.
create or replace function public.apply_ranked_settlement(
  p_player1_id uuid, p_player2_id uuid, p_winner uuid,
  p_p1_delta int, p_p2_delta int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p1_points int; p1_shield int; p1_tier int; p1_floor int; p1_next_points int; p1_next_tier int; p1_next_shield int;
  p2_points int; p2_shield int; p2_tier int; p2_floor int; p2_next_points int; p2_next_tier int; p2_next_shield int;
begin
  insert into public.ranked_stats (user_id) values (p_player1_id) on conflict do nothing;
  insert into public.ranked_stats (user_id) values (p_player2_id) on conflict do nothing;

  select points, shield into p1_points, p1_shield from public.ranked_stats where user_id = p_player1_id for update;
  select points, shield into p2_points, p2_shield from public.ranked_stats where user_id = p_player2_id for update;

  p1_tier := least(6, p1_points / 1000);
  p1_floor := p1_tier * 1000;
  p1_next_points := greatest(0, p1_points + p_p1_delta);
  if p_p1_delta < 0 and p1_shield > 0 and p1_next_points < p1_floor then
    p1_next_points := p1_floor;
  end if;
  p1_next_tier := least(6, p1_next_points / 1000);
  p1_next_shield := case when p1_next_tier > p1_tier then 3 else greatest(0, p1_shield - 1) end;

  p2_tier := least(6, p2_points / 1000);
  p2_floor := p2_tier * 1000;
  p2_next_points := greatest(0, p2_points + p_p2_delta);
  if p_p2_delta < 0 and p2_shield > 0 and p2_next_points < p2_floor then
    p2_next_points := p2_floor;
  end if;
  p2_next_tier := least(6, p2_next_points / 1000);
  p2_next_shield := case when p2_next_tier > p2_tier then 3 else greatest(0, p2_shield - 1) end;

  update public.ranked_stats set
    points = p1_next_points,
    peak_points = greatest(peak_points, p1_next_points),
    shield = p1_next_shield,
    wins = wins + (case when p_winner = p_player1_id then 1 else 0 end),
    losses = losses + (case when p_winner = p_player2_id then 1 else 0 end),
    updated_at = now()
  where user_id = p_player1_id;

  update public.ranked_stats set
    points = p2_next_points,
    peak_points = greatest(peak_points, p2_next_points),
    shield = p2_next_shield,
    wins = wins + (case when p_winner = p_player2_id then 1 else 0 end),
    losses = losses + (case when p_winner = p_player1_id then 1 else 0 end),
    updated_at = now()
  where user_id = p_player2_id;
end;
$$;

revoke all on function public.apply_ranked_settlement(uuid, uuid, uuid, int, int) from public, anon, authenticated;

-- try_ranked_match() no longer accepts the caller's points as a
-- parameter — it now reads them from ranked_stats itself, so a client
-- can't skew matchmaking pairing (or the ELO expected-score math derived
-- from the points stamped onto the match row) by just claiming a
-- different rank. A missing ranked_stats row (never played before, never
-- bootstrapped) is treated as 0 LP, same as a genuinely brand-new player.
drop function if exists public.try_ranked_match(text, int, text, int);

create or replace function public.try_ranked_match(
  p_mode_id text,
  p_display_name text,
  p_max_gap int
)
returns table (match_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_opponent record;
  v_match_id uuid;
  v_seed int;
  v_points int;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  select coalesce(points, 0) into v_points from public.ranked_stats where user_id = auth.uid();
  v_points := coalesce(v_points, 0);

  -- Someone else's poll may have already matched us since our last call.
  select id into v_match_id from public.ranked_matches
    where (player1_id = auth.uid() or player2_id = auth.uid())
      and status = 'active'
      and created_at > now() - interval '2 minutes'
    order by created_at desc limit 1;
  if v_match_id is not null then
    return query select v_match_id;
    return;
  end if;

  select * into v_opponent from public.ranked_queue
    where mode_id = p_mode_id
      and user_id <> auth.uid()
      and abs(points - v_points) <= p_max_gap
      and last_seen_at > now() - interval '15 seconds'
    order by abs(points - v_points) asc, joined_at asc
    for update skip locked
    limit 1;

  if v_opponent.user_id is not null then
    delete from public.ranked_queue where user_id = v_opponent.user_id;
    delete from public.ranked_queue where user_id = auth.uid();
    v_seed := floor(random() * 2147483647)::int;
    insert into public.ranked_matches (
      mode_id, player1_id, player2_id, player1_name, player2_name,
      player1_points, player2_points, seed
    ) values (
      p_mode_id, v_opponent.user_id, auth.uid(), v_opponent.display_name, p_display_name,
      v_opponent.points, v_points, v_seed
    ) returning id into v_match_id;
    return query select v_match_id;
    return;
  end if;

  insert into public.ranked_queue (user_id, mode_id, points, display_name)
    values (auth.uid(), p_mode_id, v_points, p_display_name)
    on conflict (user_id) do update
      set mode_id = excluded.mode_id, points = excluded.points,
          display_name = excluded.display_name, last_seen_at = now();

  return query select null::uuid;
end;
$$;

revoke all on function public.try_ranked_match(text, text, int) from public, anon;
grant execute on function public.try_ranked_match(text, text, int) to authenticated;

-- Redefines submit_ranked_result() to also actually apply the settled
-- deltas to ranked_stats (via apply_ranked_settlement() above), instead
-- of only recording them on the match row for the client to apply
-- itself. Same signature as before, so this is a straight replace.
create or replace function public.submit_ranked_result(
  p_match_id uuid,
  p_score numeric,
  p_finished_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  p1_score numeric; p2_score numeric;
  p1_finished timestamptz; p2_finished timestamptz;
  expected numeric;
  k constant int := 40;
  winner uuid;
  p1_delta int; p2_delta int;
begin
  select * into m from public.ranked_matches where id = p_match_id for update;
  if m is null then raise exception 'Match not found'; end if;
  if m.status = 'settled' then return; end if;
  if auth.uid() <> m.player1_id and auth.uid() <> m.player2_id then
    raise exception 'Not a player in this match';
  end if;

  if auth.uid() = m.player1_id then
    update public.ranked_matches
      set player1_result = jsonb_build_object('score', p_score, 'finishedAt', p_finished_at)
      where id = p_match_id;
  else
    update public.ranked_matches
      set player2_result = jsonb_build_object('score', p_score, 'finishedAt', p_finished_at)
      where id = p_match_id;
  end if;

  select (player1_result ->> 'score')::numeric, (player2_result ->> 'score')::numeric,
         (player1_result ->> 'finishedAt')::timestamptz, (player2_result ->> 'finishedAt')::timestamptz
    into p1_score, p2_score, p1_finished, p2_finished
    from public.ranked_matches where id = p_match_id;

  if p1_score is null or p2_score is null then
    return; -- still waiting on the other player
  end if;

  if p1_score > p2_score or (p1_score = p2_score and p1_finished < p2_finished) then
    winner := m.player1_id;
  elsif p2_score > p1_score or (p2_score = p1_score and p2_finished < p1_finished) then
    winner := m.player2_id;
  else
    winner := null; -- identical score AND identical timestamp — a true draw
  end if;

  expected := 1.0 / (1.0 + power(10.0, (m.player2_points - m.player1_points) / 400.0));
  if winner = m.player1_id then
    p1_delta := round(k * (1 - expected))::int;
  elsif winner = m.player2_id then
    p1_delta := round(k * (0 - expected))::int;
  else
    p1_delta := round(k * (0.5 - expected))::int;
  end if;
  p2_delta := -p1_delta;

  perform public.apply_ranked_settlement(m.player1_id, m.player2_id, winner, p1_delta, p2_delta);

  update public.ranked_matches
    set status = 'settled', winner_id = winner,
        player1_delta = p1_delta, player2_delta = p2_delta,
        settled_at = now()
    where id = p_match_id;
end;
$$;

-- Redefines claim_forfeit_win() the same way. Same signature as before.
create or replace function public.claim_forfeit_win(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  caller_result jsonb;
  caller_finished timestamptz;
  expected numeric;
  k constant int := 40;
  p1_delta int; p2_delta int;
begin
  select * into m from public.ranked_matches where id = p_match_id for update;
  if m is null then raise exception 'Match not found'; end if;
  if m.status = 'settled' then return; end if;
  if auth.uid() <> m.player1_id and auth.uid() <> m.player2_id then
    raise exception 'Not a player in this match';
  end if;

  caller_result := case when auth.uid() = m.player1_id then m.player1_result else m.player2_result end;
  if caller_result is null then
    raise exception 'Finish the match yourself before claiming a forfeit win';
  end if;
  caller_finished := (caller_result ->> 'finishedAt')::timestamptz;
  if now() - caller_finished < interval '45 seconds' then
    raise exception 'Give your opponent a bit more time';
  end if;

  expected := 1.0 / (1.0 + power(10.0, (m.player2_points - m.player1_points) / 400.0));
  if auth.uid() = m.player1_id then
    p1_delta := round(k * (1 - expected))::int;
  else
    p1_delta := round(k * (0 - expected))::int;
  end if;
  p2_delta := -p1_delta;

  perform public.apply_ranked_settlement(m.player1_id, m.player2_id, auth.uid(), p1_delta, p2_delta);

  update public.ranked_matches
    set status = 'settled', winner_id = auth.uid(),
        player1_delta = p1_delta, player2_delta = p2_delta,
        settled_at = now()
    where id = p_match_id;
end;
$$;
