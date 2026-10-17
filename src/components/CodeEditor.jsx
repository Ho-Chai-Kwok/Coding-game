import { useId, useRef } from "react";

// A plain <textarea>, upgraded with the editor conveniences kids will
// recognize from VSCode/LeetCode: typing an opening bracket or quote
// auto-inserts its match (typing a closing one right after just skips
// over it instead of doubling up), Backspace deletes an empty pair
// together, Tab indents, and Enter carries the current line's indent
// forward — adding one extra level after a Python ":" or an opening
// bracket, and splitting an empty {}/[]/() onto three lines.
const PAIRS = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
const CLOSERS = new Set(Object.values(PAIRS));

export default function CodeEditor({
  value,
  onChange,
  language = "javascript",
  rows = 5,
  className = "",
  ariaLabel = "Code editor",
  describedBy,
}) {
  const textareaRef = useRef(null);
  const indentUnit = ["python", "c", "cpp", "java"].includes(language) ? "    " : "  ";
  // CQ-10a: Tab always inserted a space before this, trapping keyboard
  // focus inside the editor with no way out (WCAG 2.1.2) — same escape
  // CodeMirror and other code editors use: Esc arms a one-shot "let the
  // next Tab actually leave" flag, cleared by any other key so a normal
  // Tab-to-indent still works the rest of the time.
  const escapeArmedRef = useRef(false);
  const hintId = useId();

  function applyChange(newValue, selStart, selEnd = selStart) {
    // Write the DOM node directly and synchronously, instead of waiting
    // for React to re-render with the new controlled value: back-to-back
    // keystrokes (e.g. typing "foo()" quickly) would otherwise read a
    // stale value/selection if the next keydown fires before React has
    // committed the previous one. React's later re-render with the same
    // value is a no-op against what's already on the node.
    const el = textareaRef.current;
    if (el) {
      el.value = newValue;
      el.selectionStart = selStart;
      el.selectionEnd = selEnd;
    }
    onChange({ target: { value: newValue } });
  }

  function handleKeyDown(e) {
    const el = e.target;
    const { selectionStart: start, selectionEnd: end, value: text } = el;

    if (e.key === "Escape") {
      escapeArmedRef.current = true;
      return;
    }
    const escapeArmed = escapeArmedRef.current;
    escapeArmedRef.current = false;

    if (e.key === "Tab") {
      if (escapeArmed) {
        // Don't preventDefault — let the browser move focus to the next
        // element like it would for any ordinary textarea.
        return;
      }
      e.preventDefault();
      if (e.shiftKey) {
        const lineStart = text.lastIndexOf("\n", start - 1) + 1;
        const lineEnd = text.indexOf("\n", start);
        const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
        const leading = line.match(/^[ \t]*/)[0];
        const removeLen = Math.min(leading.length, indentUnit.length);
        if (removeLen > 0) {
          const newValue = text.slice(0, lineStart) + line.slice(removeLen) + text.slice(lineStart + line.length);
          const delta = Math.min(removeLen, start - lineStart);
          applyChange(newValue, start - delta, end - delta);
        }
        return;
      }
      const newValue = text.slice(0, start) + indentUnit + text.slice(end);
      applyChange(newValue, start + indentUnit.length);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const currentLine = text.slice(lineStart, start);
      const currentIndent = currentLine.match(/^[ \t]*/)[0];
      const lastChar = currentLine.trim().slice(-1);
      const charAfterCursor = text[end];

      const closesImmediately =
        (lastChar === "{" && charAfterCursor === "}") ||
        (lastChar === "[" && charAfterCursor === "]") ||
        (lastChar === "(" && charAfterCursor === ")");

      if (closesImmediately) {
        const innerIndent = currentIndent + indentUnit;
        const insertion = `\n${innerIndent}\n${currentIndent}`;
        const newValue = text.slice(0, start) + insertion + text.slice(end);
        applyChange(newValue, start + 1 + innerIndent.length);
        return;
      }

      // Python's ":" opens a block the same way { [ ( do — indent once more.
      const opensBlock = lastChar === ":" || lastChar === "{" || lastChar === "[" || lastChar === "(";
      const newIndent = opensBlock ? currentIndent + indentUnit : currentIndent;
      const insertion = `\n${newIndent}`;
      const newValue = text.slice(0, start) + insertion + text.slice(end);
      applyChange(newValue, start + insertion.length);
      return;
    }

    if (e.key === "Backspace" && start === end && start > 0) {
      const charBefore = text[start - 1];
      const charAfter = text[start];
      if (PAIRS[charBefore] && PAIRS[charBefore] === charAfter) {
        e.preventDefault();
        const newValue = text.slice(0, start - 1) + text.slice(start + 1);
        applyChange(newValue, start - 1);
      }
      return;
    }

    if (Object.prototype.hasOwnProperty.call(PAIRS, e.key)) {
      const closeChar = PAIRS[e.key];
      const isSymmetric = closeChar === e.key;

      if (start !== end) {
        e.preventDefault();
        const selected = text.slice(start, end);
        const newValue = text.slice(0, start) + e.key + selected + closeChar + text.slice(end);
        applyChange(newValue, start + 1, end + 1);
        return;
      }

      if (isSymmetric && text[start] === e.key) {
        e.preventDefault();
        applyChange(text, start + 1);
        return;
      }

      e.preventDefault();
      const newValue = text.slice(0, start) + e.key + closeChar + text.slice(end);
      applyChange(newValue, start + 1);
      return;
    }

    if (CLOSERS.has(e.key) && start === end && text[start] === e.key) {
      e.preventDefault();
      applyChange(text, start + 1);
    }
  }

  return (
    <>
      <textarea
        ref={textareaRef}
        className={className}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        rows={rows}
        aria-label={ariaLabel}
        aria-describedby={[describedBy, hintId].filter(Boolean).join(" ")}
      />
      {/* CQ-10a: screen-reader-only — sighted users already see the Run
          button right below, so this isn't shown visually too. */}
      <span id={hintId} className="sr-only">
        Press Escape, then Tab, to leave the code editor.
      </span>
    </>
  );
}
