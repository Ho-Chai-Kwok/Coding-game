// Sandboxed JS execution shared by CodeChallenge and the ranked modes that
// run learner-typed code (Code Race, Code Golf).
export function runJsCode(code) {
  const logs = [];
  const fakeConsole = {
    log: (...args) => logs.push(args.map(String).join(" ")),
  };

  try {
    const fn = new Function("console", code);
    fn(fakeConsole);
    return { logs, error: null };
  } catch (err) {
    return { logs, error: err.message };
  }
}
