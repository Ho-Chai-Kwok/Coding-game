// Real JSX + real React, for the React side quest. Babel Standalone (lazy-
// loaded, same pattern as Pyodide/sql.js) compiles the learner's JSX into
// plain JS, which then runs using this app's own bundled React — genuine
// component rendering into an off-screen DOM node, not a simulation. The
// learner calls a provided render(<Thing />) helper; what actually shows
// up in the real DOM afterward (its text content) is the result.
import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";

const BABEL_CDN = "https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.4/babel.min.js";
let babelReadyPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load the JSX compiler."));
    document.body.appendChild(script);
  });
}

async function getBabel() {
  if (!babelReadyPromise) {
    babelReadyPromise = (async () => {
      await loadScript(BABEL_CDN);
      return window.Babel;
    })();
  }
  return babelReadyPromise;
}

export async function runReactCode(code) {
  let Babel;
  try {
    Babel = await getBabel();
  } catch {
    return { logs: [], error: "Couldn't load the JSX compiler — check your connection and try again." };
  }

  let transformed;
  try {
    // Classic runtime compiles JSX to React.createElement(...) calls, which
    // only need a `React` global in scope — simpler and more reliable to
    // sandbox than the automatic runtime's jsx-runtime imports.
    transformed = Babel.transform(code, { presets: [["react", { runtime: "classic" }]] }).code;
  } catch (err) {
    return { logs: [], error: `JSX error: ${err.message}` };
  }

  let renderedElement;
  try {
    const fn = new Function("React", "render", transformed);
    fn(React, (element) => {
      renderedElement = element;
    });
  } catch (err) {
    return { logs: [], error: err.message };
  }

  if (renderedElement === undefined) {
    return { logs: [], error: "Nothing was rendered — call render(<YourComponent />)." };
  }

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    flushSync(() => root.render(renderedElement));
    const text = container.textContent;
    return { logs: [text], error: null };
  } catch (err) {
    return { logs: [], error: err.message };
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}
