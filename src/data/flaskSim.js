// A small Flask/pip CLI simulator: tracks installed packages so `flask
// run` and `python app.py` correctly fail (realistically) until flask has
// actually been "installed" in this session — the same ordering lesson
// npmSim.js teaches for npm install before npm start.

export function flaskInitialState(content) {
  return { installed: [...(content.installed ?? [])] };
}

function clone(state) {
  return { installed: [...state.installed] };
}

function parse(cmdRaw) {
  return (cmdRaw.trim().match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((t) => t.replace(/^"|"$/g, ""));
}

export function runFlaskCommand(cmdRaw, prevState) {
  const cmd = cmdRaw.trim();
  const state = clone(prevState);
  const tokens = parse(cmd);
  if (!tokens.length) return { output: "", state, error: false };
  const [bin, ...rest] = tokens;

  if (bin === "pip" || bin === "pip3") {
    if (rest[0] === "install") {
      const pkgs = rest.slice(1).filter((a) => !a.startsWith("-"));
      if (!pkgs.length) return { output: "ERROR: You must give at least one requirement to install", state, error: true };
      for (const p of pkgs) if (!state.installed.includes(p)) state.installed.push(p);
      return {
        output: pkgs
          .map((p) => `Collecting ${p}\n  Downloading ${p}-3.0.0-py3-none-any.whl (101 kB)\nInstalling collected packages: ${p}\nSuccessfully installed ${p}-3.0.0`)
          .join("\n"),
        state,
        error: false,
      };
    }
    return { output: `ERROR: unknown command "${rest[0] ?? ""}"`, state, error: true };
  }

  if (bin === "flask") {
    if (rest[0] === "run") {
      if (!state.installed.includes("flask")) {
        return { output: "zsh: command not found: flask\n(hint: pip install flask first)", state, error: true };
      }
      return {
        output: " * Serving Flask app 'app'\n * Debug mode: on\n * Running on http://127.0.0.1:5000\nPress CTRL+C to quit",
        state,
        error: false,
      };
    }
    return { output: `Error: No such command '${rest[0] ?? ""}'.`, state, error: true };
  }

  if (bin === "python" || bin === "python3") {
    const file = rest[0];
    if (!file) return { output: "python: no script specified", state, error: true };
    if (!state.installed.includes("flask")) {
      return {
        output: `Traceback (most recent call last):\n  File "${file}", line 1, in <module>\n    from flask import Flask\nModuleNotFoundError: No module named 'flask'`,
        state,
        error: true,
      };
    }
    return { output: " * Serving Flask app 'app'\n * Running on http://127.0.0.1:5000", state, error: false };
  }

  return { output: `zsh: command not found: ${bin}`, state, error: true };
}
