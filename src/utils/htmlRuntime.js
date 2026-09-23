// Real HTML + CSS execution, for the HTML and CSS side quests. The
// learner's markup (optionally with a <style> block) is rendered by the
// actual browser inside a sandboxed, same-origin-only iframe (scripts
// disabled) — genuine parsing, cascade, and layout, not a simulation, and
// fully isolated from the app's own page (a <style> tag in the learner's
// code can't leak out and restyle anything outside the iframe).
//
// HTML/CSS lessons aren't about printed console lines, so instead of a
// single expectedOutput string compared to console.log output, each lesson
// provides a small list of `checks` describing what to read back out of
// the real rendered DOM — one output line per check, in order. A lesson's
// expectedOutput is still just those lines joined with "\n", so it slots
// into the exact same CodeChallenge comparison every other language uses.
//
// Check shapes:
//   { type: "text", selector }         -> element's trimmed textContent
//   { type: "count", selector }        -> number of matching elements
//   { type: "attr", selector, attr }   -> an attribute's value
//   { type: "style", selector, prop }  -> a computed CSS property's value
//   { type: "tagName", selector }      -> the matched element's tag name

function loadIframe(code) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.width = "600px";
    iframe.style.height = "400px";
    // No "allow-scripts": the learner's HTML renders and cascades for
    // real, but any <script> in it simply won't execute.
    iframe.setAttribute("sandbox", "allow-same-origin");
    document.body.appendChild(iframe);

    const timeout = setTimeout(() => {
      reject(new Error("The preview took too long to load."));
    }, 5000);

    iframe.onload = () => {
      clearTimeout(timeout);
      resolve(iframe);
    };
    iframe.srcdoc = code;
  });
}

export async function runHtmlCode(code, checks = []) {
  let iframe;
  try {
    iframe = await loadIframe(code);
  } catch (err) {
    return { logs: [], error: err.message };
  }

  try {
    const doc = iframe.contentDocument;
    const view = iframe.contentWindow;
    const logs = checks.map((check) => {
      if (check.type === "count") {
        return String(doc.querySelectorAll(check.selector).length);
      }
      const el = doc.querySelector(check.selector);
      if (!el) return "(not found)";
      switch (check.type) {
        case "text":
          return (el.textContent || "").trim();
        case "attr":
          return el.getAttribute(check.attr) ?? "(missing)";
        case "style":
          return view.getComputedStyle(el)[check.prop];
        case "tagName":
          return el.tagName.toLowerCase();
        default:
          return "";
      }
    });
    return { logs, error: null };
  } catch (err) {
    return { logs: [], error: err.message };
  } finally {
    document.body.removeChild(iframe);
  }
}
