// Real JSX + real React, for the React side quest. See QA_REPORT.md
// CQ-01b. Two layers of protection against a hang, because testing this
// live exposed that relying on just one isn't enough:
//
//   1. loopGuardPlugin below instruments every while/do-while/for loop
//      in the learner's code (via Babel, in the SAME transform pass as
//      the JSX compile) with a self-contained counter + wall-clock
//      check that throws a catchable, friendly error once a loop has
//      been spinning for 3s — regardless of which thread or process
//      it's running on. This is the same technique CodePen/JSFiddle-
//      style in-browser sandboxes use for exactly this case (DOM-
//      rendering code that can't run in a Worker). It's the layer that
//      actually matters: an iframe with sandbox="allow-scripts" was
//      tried first on the assumption that an opaque-origin iframe gets
//      its own renderer process (true in a full desktop browser with
//      Site Isolation on) — but a live test against a real `while(true)
//      {}` showed the whole page, including Playwright's own automation
//      commands, hang for 30+ seconds, meaning that isolation can't be
//      relied on (browser/headless-config dependent, not spec-
//      guaranteed the way a dedicated Worker's separate thread is).
//   2. The sandboxed iframe + outer timeout (below) stays as a second
//      layer regardless — it's still what keeps the code from touching
//      this page's window/document/localStorage at all, and it's a
//      backstop for anything outside a loop construct (though nothing
//      else can actually hang forever in JS: recursion hits the
//      engine's own stack-size limit and throws on its own).

const BABEL_CDN = "https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.4/babel.min.js";
// React 19 dropped UMD builds from the npm package entirely (no
// umd/react.production.min.js ships past 18.x — confirmed with a direct
// HEAD request before shipping this, not assumed). 18.3.1 is the last
// version with one. That's fine here: this iframe's React is completely
// isolated from the app's own (no shared state, no interop — it only
// needs to render JSX into its own DOM and hand back text content), so
// running an older React inside it than the app itself uses doesn't
// matter, and createRoot() has existed since 18.
const REACT_CDN = "https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js";
const REACT_DOM_CDN = "https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js";
// 8s, not 3s: live-tested and found that React 18, with no error boundary
// around the rendered tree, retries a render that threw synchronously once
// more from the root before giving up (part of its own "is this a real
// error or a transient concurrent-mode glitch" recovery heuristic) — so the
// loop-guard's ~3s throw was observed happening TWICE back to back on the
// same thread before the error actually surfaced. Wrapping the render in
// an ErrorBoundary below avoids that retry in the common case, but this
// stays generous as a backstop for whatever doesn't go through render.
const TIMEOUT_MS = 8000;

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

// A real Babel plugin (passed directly as a function — Babel Standalone
// accepts plugin objects/functions inline, not just registered names),
// not a string-level hack. Verified interactively before shipping (not
// assumed): infinite while/for/do-while all throw the friendly message
// at ~3001ms; a normal bounded loop (even one iterating 100,000 times
// with real work each pass) runs unaffected in a couple of ms; a
// for-of/for-in loop is left untouched entirely, since it's bounded by
// definition; nested loops each get their own independent counter via
// generateUidIdentifier, so one finishing doesn't reset another's timer.
function loopGuardPlugin({ types: t }) {
  function injectGuard(path) {
    const counterId = path.scope.generateUidIdentifier("loopGuardCount");
    const startId = path.scope.generateUidIdentifier("loopGuardStart");
    path.insertBefore([
      t.variableDeclaration("let", [t.variableDeclarator(counterId, t.numericLiteral(0))]),
      t.variableDeclaration("const", [
        t.variableDeclarator(startId, t.callExpression(t.memberExpression(t.identifier("Date"), t.identifier("now")), [])),
      ]),
    ]);
    // Only actually calls Date.now() every 1000th iteration — frequent
    // enough to catch a hang within ~3s even for a near-instant empty
    // loop body, infrequent enough that a legitimate tight loop doing
    // real work isn't meaningfully slowed by the check itself.
    const guard = t.ifStatement(
      t.logicalExpression(
        "&&",
        t.binaryExpression("===", t.binaryExpression("%", t.updateExpression("++", counterId, false), t.numericLiteral(1000)), t.numericLiteral(0)),
        t.binaryExpression(">", t.binaryExpression("-", t.callExpression(t.memberExpression(t.identifier("Date"), t.identifier("now")), []), startId), t.numericLiteral(3000)),
      ),
      t.throwStatement(
        t.newExpression(t.identifier("Error"), [
          t.stringLiteral("Your code ran for too long — is there a loop that never stops?"),
        ]),
      ),
    );
    const body = path.get("body");
    if (body.isBlockStatement()) {
      body.unshiftContainer("body", guard);
    } else {
      body.replaceWith(t.blockStatement([guard, body.node]));
    }
  }
  return {
    visitor: {
      WhileStatement: injectGuard,
      DoWhileStatement: injectGuard,
      ForStatement: injectGuard,
    },
  };
}

// The iframe's whole document, built fresh per run. Loads its own copy of
// React/ReactDOM from a CDN (a live React object can't cross a postMessage
// boundary — functions and classes don't structured-clone), waits for the
// parent to post the already-Babel-transformed code, runs it, and reports
// back either the rendered text or an error. Never touches anything
// outside itself.
function iframeDocument() {
  return `<!doctype html>
<html><head>
<script src="${REACT_CDN}"></script>
<script src="${REACT_DOM_CDN}"></script>
</head><body>
<div id="root"></div>
<script>
var reported = false;
function report(result) {
  // React 18's createRoot().render() doesn't reliably let a synchronous
  // error thrown during a component's own render function propagate back
  // out through a plain try/catch around render() itself (confirmed live
  // before shipping: the loop-guard's error correctly fired and showed
  // up via window.onerror, but a try/catch around root.render() never
  // saw it) — so this is the one, single place every path (the direct
  // try/catch below AND this page-level error listener) reports through,
  // guarded so only the first result actually gets sent.
  if (reported) return;
  reported = true;
  parent.postMessage(result, "*");
}
window.addEventListener("error", function (e) {
  report({ type: "result", error: String((e.error && e.error.message) || e.message || e) });
});
window.addEventListener("message", function (e) {
  if (e.data?.type !== "run") return;
  var transformed = e.data.code;
  var renderedElement;
  try {
    var fn = new Function("React", "render", transformed);
    fn(React, function (el) { renderedElement = el; });
  } catch (err) {
    report({ type: "result", error: String(err && err.message || err) });
    return;
  }
  if (renderedElement === undefined) {
    report({ type: "result", error: "Nothing was rendered — call render(<YourComponent />)." });
    return;
  }
  try {
    var container = document.getElementById("root");
    var root = ReactDOM.createRoot(container);
    // Catches a render error via componentDidCatch instead of letting it
    // escape uncaught — avoids React's from-the-root retry-once recovery
    // pass for uncaught render errors, which otherwise ran the loop-guard
    // twice back to back before the error surfaced.
    var ErrorBoundary = /*#__PURE__*/ (function (Component) {
      function ErrorBoundary() {
        var instance = Component.call(this, arguments[0]) || this;
        instance.state = { hasError: false };
        return instance;
      }
      ErrorBoundary.prototype = Object.create(Component.prototype);
      ErrorBoundary.prototype.constructor = ErrorBoundary;
      ErrorBoundary.getDerivedStateFromError = function () {
        return { hasError: true };
      };
      ErrorBoundary.prototype.componentDidCatch = function (error) {
        report({ type: "result", error: String((error && error.message) || error) });
      };
      ErrorBoundary.prototype.render = function () {
        return this.state.hasError ? null : this.props.children;
      };
      return ErrorBoundary;
    })(React.Component);
    // flushSync forces the commit to happen synchronously right here —
    // createRoot's commit otherwise runs on React's own scheduler (a
    // later macrotask), so reading container.textContent right after
    // root.render() would see it still empty.
    ReactDOM.flushSync(function () {
      root.render(React.createElement(ErrorBoundary, null, renderedElement));
    });
    // A no-op if componentDidCatch already reported above.
    report({ type: "result", text: container.textContent, error: null });
  } catch (err) {
    report({ type: "result", error: String(err && err.message || err) });
  }
});
parent.postMessage({ type: "ready" }, "*");
</script>
</body></html>`;
}

function runInIframe(transformedCode) {
  return new Promise((resolve) => {
    let settled = false;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.width = "600px";
    iframe.style.height = "400px";
    // allow-scripts WITHOUT allow-same-origin: the code genuinely runs
    // (needed for React to render), but the iframe gets an opaque origin
    // with no access to this page's window, document, or storage at all.
    iframe.setAttribute("sandbox", "allow-scripts");

    function finish(result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      iframe.remove();
      resolve(result);
    }

    const timer = setTimeout(() => {
      finish({
        logs: [],
        error: "Your code ran for too long — is there a loop that never stops? Check your counter (like `i++`).",
      });
    }, TIMEOUT_MS);

    function onMessage(e) {
      if (e.source !== iframe.contentWindow || !e.data) return;
      if (e.data.type === "ready") {
        iframe.contentWindow.postMessage({ type: "run", code: transformedCode }, "*");
        return;
      }
      if (e.data.type === "result") {
        if (e.data.error) {
          finish({ logs: [], error: e.data.error });
        } else {
          finish({ logs: [e.data.text], error: null });
        }
      }
    }
    window.addEventListener("message", onMessage);

    document.body.appendChild(iframe);
    iframe.srcdoc = iframeDocument();
  });
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
    // sandbox than the automatic runtime's jsx-runtime imports. (This
    // React import is only for Babel's transform target/typing context
    // here on the main thread — the code that actually RUNS uses the
    // iframe's own separately-loaded React, never this one.)
    transformed = Babel.transform(code, {
      presets: [["react", { runtime: "classic" }]],
      plugins: [loopGuardPlugin],
    }).code;
  } catch (err) {
    return { logs: [], error: `JSX error: ${err.message}` };
  }

  return runInIframe(transformed);
}
