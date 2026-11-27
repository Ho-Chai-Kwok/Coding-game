// Applies supabase/schema.sql to a throwaway Postgres database that mimics
// Supabase's auth setup (auth.users, auth.uid(), the anon / authenticated /
// service_role roles, the supabase_realtime publication), then checks the
// security rules by acting as real signed-in users.
//
// What this proves, against the actual file that ships:
//   - the schema applies cleanly, and applies AGAIN on top of itself
//     (re-running it in the Supabase SQL editor must never fail)
//   - it still applies when a live row already breaks a new rule
//   - Row Level Security: a player can't read or write another player's data
//   - ranked: no forged LP, no score overwrite, no planted questions,
//     no unsafe names shown to an opponent
//
// Needs `psql` and a reachable Postgres server (standard PG* env vars).
// Creates and drops its own database, so it never touches real data.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
const DB = `verify_schema_${process.pid}`;

function psql(sql, { db = DB, allowFail = false } = {}) {
  try {
    return execFileSync("psql", ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-t", "-A", "-d", db], {
      input: sql,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (err) {
    if (allowFail) return { error: String(err.stderr || err.message) };
    throw new Error(String(err.stderr || err.message));
  }
}

const adminDb = process.env.PGDATABASE || "postgres";
psql(`drop database if exists ${DB}; create database ${DB};`, { db: adminDb });

let pass = 0;
let fail = 0;
function check(label, ok, detail = "") {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${!ok && detail ? `\n      ${detail}` : ""}`);
}

// Run `sql` as a signed-in user (role authenticated, JWT sub = uid), the
// way PostgREST does for a real request.
function asUser(uid, sql, opts) {
  return psql(
    `begin; set local role authenticated; set local request.jwt.claim.sub = '${uid}';\n${sql}\ncommit;`,
    opts,
  );
}
const denied = (r) => typeof r === "object" && r.error;

const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
const C = "00000000-0000-0000-0000-00000000000c";

try {
  // --- Supabase stand-in --------------------------------------------------
  psql(`
    do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
    end $$;
    create schema auth;
    create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    create publication supabase_realtime;
    grant usage on schema public to anon, authenticated, service_role;
    -- Supabase's default: API roles get table privileges, RLS does the rest.
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  `);

  // --- Applies, and re-applies --------------------------------------------
  const first = psql(schema, { allowFail: true });
  check("schema.sql applies to a fresh database", !denied(first), first.error);

  const second = psql(schema, { allowFail: true });
  check("schema.sql re-applies on top of itself (idempotent)", !denied(second), second.error);

  // Sign-ups go through the trigger, like Supabase Auth does.
  psql(`
    insert into auth.users (id, raw_user_meta_data) values
      ('${A}', '{"display_name":"Grape"}'),
      ('${B}', '{"display_name":"kid@mail.com"}'),
      ('${C}', '{"display_name":"Coder C"}');
  `);
  check("safe sign-up name is kept", psql(`select display_name from profiles where id='${A}'`) === "Grape");
  check(
    "unsafe sign-up name falls back to 'Coder' (sign-up doesn't fail)",
    psql(`select display_name from profiles where id='${B}'`) === "Coder",
  );

  // A live row that breaks the rule must not stop a re-run.
  psql(`
    alter table profiles drop constraint profiles_display_name_safe;
    update profiles set display_name = 'mysite.com' where id = '${C}';
  `);
  const third = psql(schema, { allowFail: true });
  check("schema.sql re-applies when an existing row breaks the name rule", !denied(third), third.error);
  check("...and that row is cleaned up", psql(`select display_name from profiles where id='${C}'`) === "Coder");

  // --- RLS: your own data only --------------------------------------------
  asUser(A, `insert into progress (user_id, data) values ('${A}', '{"xp":1}');`);
  asUser(B, `insert into progress (user_id, data) values ('${B}', '{"xp":2}');`);
  check("player sees own progress", asUser(A, `select count(*) from progress where user_id='${A}';`) === "1");
  check("player can't see another player's progress", asUser(A, `select count(*) from progress;`) === "1");
  asUser(A, `update progress set data='{"xp":999}' where user_id='${B}';`);
  check("player can't overwrite another player's progress", psql(`select data->>'xp' from progress where user_id='${B}'`) === "2");
  check(
    "player can't create a progress row for someone else",
    denied(asUser(A, `insert into progress (user_id) values ('${C}');`, { allowFail: true })),
  );
  check(
    "oversized progress save (>1 MB) is rejected",
    denied(asUser(A, `update progress set data = jsonb_build_object('x', repeat(md5(random()::text), 70000)) where user_id='${A}';`, { allowFail: true })),
  );
  check(
    "profile can't be renamed to an unsafe name directly",
    denied(asUser(A, `update profiles set display_name='call 91234567' where id='${A}';`, { allowFail: true })),
  );
  check("profiles of others are hidden", asUser(A, `select count(*) from profiles;`) === "1");

  // --- Ranked: no forged LP -----------------------------------------------
  check(
    "player can't write ranked_stats directly",
    denied(asUser(A, `insert into ranked_stats (user_id, points) values ('${A}', 99999);`, { allowFail: true })) ||
      asUser(A, `select count(*) from ranked_stats where points = 99999;`) === "0",
  );
  check(
    "player can't call apply_ranked_settlement (internal only)",
    denied(asUser(A, `select apply_ranked_settlement('${A}','${B}','${A}',500,-500);`, { allowFail: true })),
  );
  asUser(A, `select * from claim_initial_ranked_stats(100,100,0,0,0);`);
  asUser(A, `select * from claim_initial_ranked_stats(99999,99999,0,0,0);`);
  check("initial ranked stats can only be claimed once", psql(`select points from ranked_stats where user_id='${A}'`) === "100");

  // --- Ranked: matchmaking + names shown to opponents ---------------------
  asUser(B, `select * from try_ranked_match('race', 'see kid@mail.com', 5000);`);
  check("unsafe queue name is replaced before an opponent can see it", psql(`select display_name from ranked_queue where user_id='${B}'`) === "Coder");
  const matchId = asUser(A, `select match_id from try_ranked_match('race', 'call 91234567', 5000);`);
  check("two queued players get matched", /^[0-9a-f-]{36}$/.test(matchId), matchId);
  check(
    "unsafe name never reaches the match row the opponent reads",
    psql(`select player1_name || '|' || player2_name from ranked_matches where id='${matchId}'`) === "Coder|Coder",
  );
  check("outsider can't read the match", asUser(C, `select count(*) from ranked_matches;`) === "0");
  check(
    "outsider can't submit a result",
    denied(asUser(C, `select submit_ranked_result('${matchId}', 10, now());`, { allowFail: true })),
  );
  check(
    "negative / absurd scores are rejected",
    denied(asUser(A, `select submit_ranked_result('${matchId}', -5, now());`, { allowFail: true })) &&
      denied(asUser(A, `select submit_ranked_result('${matchId}', 'NaN', now());`, { allowFail: true })),
  );

  // --- Ranked: no planted questions ---------------------------------------
  check(
    "player can't plant their own question set",
    denied(asUser(A, `select save_match_questions('${matchId}', '[{"q":"x"}]'::jsonb, '${A}');`, { allowFail: true })),
  );

  // --- Ranked: settlement --------------------------------------------------
  asUser(A, `select submit_ranked_result('${matchId}', 5, '2000-01-01');`);
  asUser(A, `select submit_ranked_result('${matchId}', 1000, now());`);
  check(
    "a submitted score can't be overwritten",
    psql(`select player2_result->>'score' from ranked_matches where id='${matchId}'`) === "5",
  );
  check(
    "finish time comes from the server clock, not the client",
    psql(`select (player2_result->>'finishedAt')::timestamptz > now() - interval '1 hour' from ranked_matches where id='${matchId}'`) === "t",
  );
  asUser(B, `select submit_ranked_result('${matchId}', 3, now());`);
  const settled = psql(`select status || '|' || (winner_id = '${A}') || '|' || (player1_delta + player2_delta) from ranked_matches where id='${matchId}'`);
  check("match settles with the higher score winning, zero-sum LP", settled === "settled|true|0", settled);
  const lp = psql(`select string_agg(points::text, ',' order by user_id) from ranked_stats where user_id in ('${A}','${B}')`);
  check("both players' LP updated server-side", lp.split(",").length === 2 && !lp.includes("99999"), lp);

  // --- Code Helper usage table is server-only ------------------------------
  check(
    "player can't read or reset their Code Helper usage counter",
    denied(asUser(A, `delete from code_help_usage;`, { allowFail: true })),
  );

  // --- Account deletion cascades ------------------------------------------
  asUser(B, `select delete_my_account();`);
  check(
    "delete_my_account() removes the user and all their rows",
    psql(`select (select count(*) from auth.users where id='${B}') + (select count(*) from profiles where id='${B}') + (select count(*) from progress where user_id='${B}') + (select count(*) from ranked_stats where user_id='${B}')`) === "0",
  );
  check("anon can't call delete_my_account()", denied(psql(`set role anon; select delete_my_account();`, { allowFail: true })));
} finally {
  psql(`drop database if exists ${DB};`, { db: adminDb, allowFail: true });
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
