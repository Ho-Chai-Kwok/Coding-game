// Sandboxed JS execution shared by CodeChallenge and the ranked modes that
// run learner-typed code (Code Race, Code Golf). Code runs inside an async
// wrapper, so `await fetch(...)` works directly without the learner having
// to write their own `async function` — a real network request genuinely
// happens for REST API / GraphQL lessons. The timeout only helps with an
// async operation that never resolves (a hung fetch, an unresolved
// Promise) — it can't interrupt a tight synchronous loop like
// `while(true){}`, since that starves the event loop the timer itself
// needs to fire. Real infinite-loop protection needs a Web Worker with a
// hard terminate(), which this sandbox doesn't have yet (see ROADMAP.md).
const TIMEOUT_MS = 10000;

export async function runJsCode(code) {
  const logs = [];
  const fakeConsole = {
    log: (...args) => logs.push(args.map(String).join(" ")),
  };

  try {
    const fn = new Function("console", `return (async () => {\n${code}\n})();`);
    await Promise.race([
      fn(fakeConsole),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timed out — check for an infinite loop, or a request that never responded.")), TIMEOUT_MS),
      ),
    ]);
    return { logs, error: null };
  } catch (err) {
    return { logs, error: err.message };
  }
}
