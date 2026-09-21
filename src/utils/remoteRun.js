// Runs C, C++ and Java on Wandbox (https://wandbox.org), a free public online
// compiler, because these languages can't run inside a browser tab. The
// learner's code is sent to that service — the Privacy Policy says so.

const API_URL = "https://wandbox.org/api/compile.json";
const TIMEOUT_MS = 30000;

const COMPILERS = {
  c: { compiler: "gcc-13.2.0-c", options: "", raw: "-lm" },
  cpp: { compiler: "gcc-13.2.0", options: "c++17", raw: "" },
  java: { compiler: "openjdk-jdk-22+36", options: "", raw: "" },
};

const BUSY = "The online compiler is busy right now — please try again in a moment.";
const OFFLINE = "Couldn't reach the online compiler — check your connection and try again.";

// "prog.c:5:12: error: expected ';'" -> "Line 5: expected ';'"
function friendlyCompileError(text) {
  const lines = text.split("\n");
  for (const line of lines) {
    const m = line.match(/prog\.\w+:(\d+):(?:\d+:)?\s*(?:fatal )?error:\s*(.*)/);
    if (m) return `Line ${m[1]}: ${m[2]}`;
  }
  return lines.find((l) => l.trim()) ?? "The program didn't compile.";
}

async function post(body) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (res.status === 429) return { busy: true };
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { data: await res.json() };
    } catch (err) {
      if (attempt === 2) return { failed: err.name === "AbortError" ? "busy" : "offline" };
    } finally {
      clearTimeout(timer);
    }
  }
  return { failed: "offline" };
}

export async function runCompiledCode(language, code) {
  const config = COMPILERS[language];
  // The compiler saves Java as prog.java, so a public class would be rejected.
  const source = language === "java" ? code.replace(/\bpublic\s+class\b/g, "class") : code;

  const result = await post({
    compiler: config.compiler,
    code: source,
    options: config.options,
    "compiler-option-raw": config.raw,
  });

  if (result.busy || result.failed === "busy") return { logs: [], error: BUSY };
  if (result.failed) return { logs: [], error: OFFLINE };

  const { status, compiler_error, program_output, program_error, signal } = result.data;
  const logs = (program_output ?? "").replace(/\r/g, "").replace(/\n$/, "").split("\n");
  const output = program_output ? logs : [];

  if (status !== "0") {
    if (compiler_error) return { logs: [], error: friendlyCompileError(compiler_error) };
    const message = (program_error || "").trim().split("\n").filter(Boolean).pop();
    return { logs: output, error: message || signal || "The program stopped with an error." };
  }
  return { logs: output, error: null };
}
