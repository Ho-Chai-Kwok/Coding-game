// A small npm/Node.js CLI simulator: tracks package.json and installed
// dependencies so install/run/start behave consistently across a lesson.

export function npmInitialState(content) {
  return {
    hasPackageJson: Boolean(content.hasPackageJson),
    dependencies: { ...(content.dependencies ?? {}) },
    scripts: { ...(content.scripts ?? { test: "jest", start: "node index.js" }) },
  };
}

function clone(state) {
  return { hasPackageJson: state.hasPackageJson, dependencies: { ...state.dependencies }, scripts: { ...state.scripts } };
}

function parse(cmdRaw) {
  return (cmdRaw.trim().match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((t) => t.replace(/^"|"$/g, ""));
}

export function runNpmCommand(cmdRaw, prevState) {
  const cmd = cmdRaw.trim();
  const state = clone(prevState);
  const tokens = parse(cmd);
  if (!tokens.length) return { output: "", state, error: false };

  const bin = tokens[0];
  if (bin === "node") {
    const file = tokens[1];
    if (!file) return { output: "node: no script specified", state, error: true };
    return { output: `Hello from ${file}!`, state, error: false };
  }
  if (bin !== "npm") {
    return { output: `zsh: command not found: ${bin}`, state, error: true };
  }

  const [, sub, ...args] = tokens;

  switch (sub) {
    case "init":
      state.hasPackageJson = true;
      return {
        output: args.includes("-y")
          ? `Wrote to package.json:\n\n{\n  "name": "my-project",\n  "version": "1.0.0",\n  "main": "index.js"\n}`
          : `This utility will walk you through creating a package.json file...\n(hint: use npm init -y to skip the questions)`,
        state,
        error: false,
      };

    case "install":
    case "i": {
      if (!state.hasPackageJson) {
        return { output: "npm error code ENOENT\nnpm error no such file or directory, open 'package.json'\nnpm error This is related to npm not being able to find a file.", state, error: true };
      }
      const pkgs = args.filter((a) => !a.startsWith("-"));
      if (!pkgs.length) {
        const count = Object.keys(state.dependencies).length;
        return { output: count ? `up to date, audited ${count} packages in 1s\n\nfound 0 vulnerabilities` : "up to date, audited 1 package in 0s", state, error: false };
      }
      for (const pkg of pkgs) state.dependencies[pkg] = "^" + ["1", "2", "3"][Math.floor(Math.random() * 3)] + ".0.0";
      return {
        output: `\nadded ${pkgs.length} package${pkgs.length > 1 ? "s" : ""} in ${(Math.random() * 2 + 0.5).toFixed(1)}s\n\nfound 0 vulnerabilities`,
        state,
        error: false,
      };
    }

    case "uninstall": {
      const pkg = args[0];
      if (!pkg) return { output: "npm error missing package name", state, error: true };
      delete state.dependencies[pkg];
      return { output: `removed 1 package in 0.3s`, state, error: false };
    }

    case "list":
    case "ls": {
      const deps = Object.entries(state.dependencies);
      if (!deps.length) return { output: "my-project@1.0.0\n└── (empty)", state, error: false };
      return { output: "my-project@1.0.0\n" + deps.map(([n, v], i) => `${i === deps.length - 1 ? "└──" : "├──"} ${n}@${v}`).join("\n"), state, error: false };
    }

    case "run": {
      const script = args[0];
      if (!script) {
        return { output: "Lifecycle scripts included in my-project:\n" + Object.entries(state.scripts).map(([n, c]) => `  ${n}\n    ${c}`).join("\n"), state, error: false };
      }
      if (!state.scripts[script]) {
        return { output: `npm error Missing script: "${script}"`, state, error: true };
      }
      if (script === "test") {
        return { output: "PASS  ./index.test.js\n  ✓ works as expected (3 ms)\n\nTest Suites: 1 passed, 1 total\nTests:       1 passed, 1 total", state, error: false };
      }
      if (script === "start") {
        return { output: "> my-project@1.0.0 start\n> node index.js\n\nServer running at http://localhost:3000/", state, error: false };
      }
      return { output: `> my-project@1.0.0 ${script}\n> ${state.scripts[script]}`, state, error: false };
    }

    case "start":
      return { output: "> my-project@1.0.0 start\n> node index.js\n\nServer running at http://localhost:3000/", state, error: false };

    case "test":
      return { output: "PASS  ./index.test.js\n  ✓ works as expected (3 ms)\n\nTest Suites: 1 passed, 1 total\nTests:       1 passed, 1 total", state, error: false };

    default:
      return { output: `npm error Unknown command: "${sub}"`, state, error: true };
  }
}
