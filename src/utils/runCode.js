// Sandboxed JS execution shared by CodeChallenge and the ranked modes that
// run learner-typed code (Code Golf). Runs inside a dedicated Web Worker,
// created fresh per run from a Blob URL — not the main thread — so:
//   - a tight synchronous infinite loop (`while(i<10){...}` with no `i++`)
//     only hangs the disposable worker thread, never the page; a hard
//     timeout calls worker.terminate() to kill it outright.
//   - the worker has no `window`, `document`, or `localStorage` at all, so
//     learner code genuinely cannot wipe progress or deface the page —
//     this isn't a policy, it's just not reachable from worker scope.
//   - `fetch` IS available in a worker, so the REST/GraphQL lessons that
//     need a real network call keep working unchanged.
// See QA_REPORT.md CQ-01 for the exact repro this replaces (an `i++`-less
// while loop froze the tab for 20+ seconds; `localStorage.clear()` in a
// lesson wiped a guest's progress; `print()` — a common Python habit —
// opened the browser's print dialog via the old main-thread `window`).
const TIMEOUT_MS = 3000;

function workerSource() {
  // Intentionally minimal: collects console.log output into `logs` the
  // same way the old main-thread version did, then posts the result back.
  // No access to anything outside this worker's own global scope.
  return `
    self.onmessage = async (e) => {
      const code = e.data.code;
      const logs = [];
      const fakeConsole = {
        log: (...args) => logs.push(args.map(String).join(" ")),
      };
      try {
        const fn = new Function("console", "return (async () => {\\n" + code + "\\n})();");
        await fn(fakeConsole);
        self.postMessage({ logs, error: null });
      } catch (err) {
        self.postMessage({ logs, error: (err && err.message) ? err.message : String(err) });
      }
    };
  `;
}

// Rewrites a handful of common Python-habit / dialog-API mistakes into a
// plain-language hint instead of the raw "X is not defined" the engine
// would otherwise show — these are genuinely the most common first
// mistakes beginners make, not a general error-translation layer (see
// CQ-07 for the broader friendly-error-message work).
function friendlyError(message) {
  if (!message) return message;
  if (/\bprint\s+is not defined\b/.test(message)) {
    return "`print` isn't JavaScript — use `console.log()` instead.";
  }
  if (/\balert\s+is not defined\b/.test(message)) {
    return "`alert` isn't available here — use `console.log()` to show output.";
  }
  if (/\bconfirm\s+is not defined\b/.test(message)) {
    return "`confirm` isn't available here — use `console.log()` to show output.";
  }
  return message;
}

export async function runJsCode(code) {
  return new Promise((resolve) => {
    let settled = false;
    const blobUrl = URL.createObjectURL(new Blob([workerSource()], { type: "application/javascript" }));
    const worker = new Worker(blobUrl);

    function finish(result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      resolve(result);
    }

    const timer = setTimeout(() => {
      finish({
        logs: [],
        error: "Your code ran for too long — is there a loop that never stops? Check your counter (like `i++`).",
      });
    }, TIMEOUT_MS);

    worker.onmessage = (e) => {
      const { logs, error } = e.data;
      finish({ logs, error: friendlyError(error) });
    };

    worker.onerror = (e) => {
      finish({ logs: [], error: friendlyError(e.message) });
    };

    worker.postMessage({ code });
  });
}
