// Real Python, via Pyodide (a real Python interpreter compiled to
// WebAssembly) — running inside a dedicated Web Worker, not the main
// thread. See QA_REPORT.md CQ-01b: `while True: pass` used to freeze the
// tab with no way out, and `import js; js.localStorage.clear()` could
// wipe a guest's progress, because Pyodide ran on the page itself and
// `js` in Pyodide just IS whatever global scope it's running in. Inside
// a worker, that global scope is the worker's own — no `window`,
// `document`, or `localStorage` at all, same protection runCode.js's JS
// sandbox already has, for the same reason.
//
// The worker is created lazily (first Python run pays for it, same as
// before) and kept alive across runs so Pyodide's startup cost and any
// loaded packages are paid once per session, not once per run. A hard
// timeout is the backstop for a genuine hang: rather than trying to
// interrupt Python mid-loop (Pyodide supports that via setInterruptBuffer
// and a SharedArrayBuffer, but that needs cross-origin-isolation headers
// this app doesn't set), a timeout just terminates the whole worker
// outright and lazily spins up a fresh one next time — slower for that
// one next run (pays Pyodide's startup cost again), but it actually
// recovers, which is what matters.
const PYODIDE_VERSION = "0.26.4";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
// Generous relative to the JS sandbox's 3s: a first run pays Pyodide's
// own load time inside this same budget, and real Python programs (data-
// science packages especially) can legitimately take a few seconds.
const TIMEOUT_MS = 8000;

function workerSource() {
  return `
    importScripts(${JSON.stringify(PYODIDE_CDN + "pyodide.js")});
    let pyodideReadyPromise = null;
    function getPyodide() {
      if (!pyodideReadyPromise) {
        pyodideReadyPromise = loadPyodide({ indexURL: ${JSON.stringify(PYODIDE_CDN)} });
      }
      return pyodideReadyPromise;
    }
    self.onmessage = async (e) => {
      const { code, packages } = e.data;
      const logs = [];
      try {
        const pyodide = await getPyodide();
        if (packages && packages.length) await pyodide.loadPackage(packages);
        pyodide.setStdout({ batched: (msg) => logs.push(msg) });
        pyodide.setStderr({ batched: () => {} });
        await pyodide.runPythonAsync(code);
        self.postMessage({ logs, error: null });
      } catch (err) {
        self.postMessage({ logs, error: (err && err.message) ? err.message : String(err) });
      }
    };
  `;
}

let worker = null;
let workerBlobUrl = null;

function getWorker() {
  if (!worker) {
    workerBlobUrl = URL.createObjectURL(new Blob([workerSource()], { type: "application/javascript" }));
    worker = new Worker(workerBlobUrl);
  }
  return worker;
}

function discardWorker() {
  if (worker) worker.terminate();
  if (workerBlobUrl) URL.revokeObjectURL(workerBlobUrl);
  worker = null;
  workerBlobUrl = null;
}

function lastMeaningfulLine(message) {
  const lines = message.trim().split("\n").filter(Boolean);
  return lines[lines.length - 1] || message;
}

// Data-science packages (numpy, pandas, ...) are multi-megabyte downloads,
// so they're only fetched for lessons that actually need them — never as
// part of the base Python runtime every JS/Python lesson would otherwise
// pay for. Pyodide caches a package once loaded (and the worker persists
// across runs), so this is a no-op on every run after the first, unless a
// timeout discarded the worker in between.
export async function runPythonCode(code, packages = []) {
  return new Promise((resolve) => {
    let settled = false;
    const w = getWorker();

    function finish(result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
      resolve(result);
    }

    const timer = setTimeout(() => {
      discardWorker(); // hard stop — see file header for why this, not an interrupt
      finish({
        logs: [],
        error: "Your code ran for too long — is there a loop that never stops? Check your counter (like `i++`).",
      });
    }, TIMEOUT_MS);

    function onMessage(e) {
      const { logs, error } = e.data;
      finish({ logs, error: error ? lastMeaningfulLine(error) : null });
    }

    function onError() {
      // The worker's own script failed to load/evaluate (e.g. the
      // importScripts for Pyodide itself failed) — discard it so the
      // next attempt starts clean instead of reusing a broken worker.
      discardWorker();
      finish({ logs: [], error: "Couldn't load the Python runtime — check your connection and try again." });
    }

    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    w.postMessage({ code, packages });
  });
}
