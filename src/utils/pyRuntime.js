// Lazy-loads Pyodide (a real Python interpreter compiled to WebAssembly)
// only the first time someone actually runs Python code, so JavaScript-only
// sessions never pay for it.

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideReadyPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load the Python runtime."));
    document.body.appendChild(script);
  });
}

async function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = (async () => {
      await loadScript(`${PYODIDE_CDN}pyodide.js`);
      return window.loadPyodide({ indexURL: PYODIDE_CDN });
    })();
  }
  return pyodideReadyPromise;
}

function lastMeaningfulLine(message) {
  const lines = message.trim().split("\n").filter(Boolean);
  return lines[lines.length - 1] || message;
}

export async function runPythonCode(code) {
  let pyodide;
  try {
    pyodide = await getPyodide();
  } catch {
    return {
      logs: [],
      error: "Couldn't load the Python runtime — check your connection and try again.",
    };
  }

  const logs = [];
  pyodide.setStdout({ batched: (msg) => logs.push(msg) });
  pyodide.setStderr({ batched: () => {} });

  try {
    await pyodide.runPythonAsync(code);
    return { logs, error: null };
  } catch (err) {
    return { logs, error: lastMeaningfulLine(err.message) };
  }
}
