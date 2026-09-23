// Lazy-loads sql.js (a real SQLite database compiled to WebAssembly) only
// the first time someone actually runs a SQL lesson — same pattern as
// pyRuntime.js for Python. Queries run against a real, in-memory SQLite
// database seeded fresh for each lesson, so results are genuinely computed,
// not simulated: a wrong WHERE clause really does return the wrong rows.

const SQLJS_VERSION = "1.10.3";
const SQLJS_CDN = `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/`;

let sqlJsReadyPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load the SQL engine."));
    document.body.appendChild(script);
  });
}

async function getSqlJs() {
  if (!sqlJsReadyPromise) {
    sqlJsReadyPromise = (async () => {
      await loadScript(`${SQLJS_CDN}sql-wasm.js`);
      return window.initSqlJs({ locateFile: (file) => `${SQLJS_CDN}${file}` });
    })();
  }
  return sqlJsReadyPromise;
}

// One value from a result row, formatted the way sqlite3's CLI would show
// it: NULL prints as the literal text "NULL", everything else as-is.
function formatCell(v) {
  return v === null ? "NULL" : String(v);
}

// seedSql sets up the lesson's starting table(s) and data; querySql is
// whatever the learner typed. Output is one result row per line,
// comma-separated — a SELECT's real output, or nothing for a statement
// that doesn't return rows (INSERT/UPDATE/DELETE/CREATE).
export async function runSqlCode(seedSql, querySql) {
  let SQL;
  try {
    SQL = await getSqlJs();
  } catch {
    return { logs: [], error: "Couldn't load the SQL engine — check your connection and try again." };
  }

  const db = new SQL.Database();
  try {
    if (seedSql) db.run(seedSql);
  } catch (err) {
    db.close();
    return { logs: [], error: `Lesson setup error: ${err.message}` };
  }

  try {
    const results = db.exec(querySql);
    db.close();
    const lines = [];
    for (const result of results) {
      for (const row of result.values) lines.push(row.map(formatCell).join(","));
    }
    return { logs: lines, error: null };
  } catch (err) {
    db.close();
    return { logs: [], error: err.message };
  }
}
