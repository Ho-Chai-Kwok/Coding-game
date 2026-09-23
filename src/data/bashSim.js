// A small Linux/bash shell simulator: a flat virtual filesystem (files map
// to their text content, directories are marked separately) plus enough
// commands to make file exploration feel real. grep genuinely runs a real
// regular expression against file content — not canned text.

export function freshBashState(content = {}) {
  return {
    cwd: content.cwd ?? "~/project",
    files: { ...(content.files ?? {}) }, // path -> text content
    dirs: new Set(content.dirs ?? []),
  };
}

export function bashInitialState(content) {
  return freshBashState(content);
}

function clone(state) {
  return { cwd: state.cwd, files: { ...state.files }, dirs: new Set(state.dirs) };
}

function parse(cmdRaw) {
  return (cmdRaw.trim().match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((t) => t.replace(/^"|"$/g, ""));
}

function listEntries(state) {
  const names = new Set();
  for (const f of Object.keys(state.files)) names.add(f);
  for (const d of state.dirs) names.add(d);
  return [...names].sort();
}

export function runBashCommand(cmdRaw, prevState) {
  const cmd = cmdRaw.trim();
  const state = clone(prevState);
  const tokens = parse(cmd);
  if (!tokens.length) return { output: "", state, error: false };

  const [bin, ...args] = tokens;

  switch (bin) {
    case "pwd":
      return { output: state.cwd, state, error: false };

    case "whoami":
      return { output: "learner", state, error: false };

    case "ls": {
      const long = args.includes("-l") || args.includes("-la") || args.includes("-al");
      const entries = listEntries(state);
      if (!entries.length) return { output: "", state, error: false };
      if (long) {
        return {
          output: entries
            .map((e) => {
              const isDir = state.dirs.has(e);
              return `${isDir ? "drwxr-xr-x" : "-rw-r--r--"}  1 learner  staff  ${isDir ? 96 : (state.files[e]?.length ?? 0)}  Sep 23 12:00  ${e}`;
            })
            .join("\n"),
          state,
          error: false,
        };
      }
      return { output: entries.join("  "), state, error: false };
    }

    case "cd":
      state.cwd = !args[0] || args[0] === "~" ? "~" : args[0] === ".." ? state.cwd.split("/").slice(0, -1).join("/") || "~" : `${state.cwd}/${args[0]}`.replace("~/..", "~");
      return { output: "", state, error: false };

    case "mkdir": {
      const name = args.filter((a) => a !== "-p")[0];
      if (!name) return { output: "mkdir: missing operand", state, error: true };
      state.dirs.add(name);
      return { output: "", state, error: false };
    }

    case "touch": {
      const name = args[0];
      if (!name) return { output: "touch: missing file operand", state, error: true };
      if (!(name in state.files)) state.files[name] = "";
      return { output: "", state, error: false };
    }

    case "cat": {
      const name = args[0];
      if (!name) return { output: "usage: cat <file>", state, error: true };
      if (!(name in state.files)) {
        return { output: `cat: ${name}: No such file or directory`, state, error: true };
      }
      return { output: state.files[name], state, error: false };
    }

    case "echo": {
      const gtIndex = args.findIndex((a) => a === ">" || a === ">>");
      if (gtIndex === -1) return { output: args.join(" "), state, error: false };
      const text = args.slice(0, gtIndex).join(" ");
      const target = args[gtIndex + 1];
      if (!target) return { output: "bash: syntax error near unexpected token `newline'", state, error: true };
      const append = args[gtIndex] === ">>";
      state.files[target] = append ? `${state.files[target] ?? ""}${state.files[target] ? "\n" : ""}${text}` : text;
      return { output: "", state, error: false };
    }

    case "rm": {
      const flags = args.filter((a) => a.startsWith("-"));
      const name = args.find((a) => !a.startsWith("-"));
      if (!name) return { output: "rm: missing operand", state, error: true };
      if (state.dirs.has(name)) {
        if (!flags.includes("-r") && !flags.includes("-rf")) {
          return { output: `rm: ${name}: is a directory`, state, error: true };
        }
        state.dirs.delete(name);
        return { output: "", state, error: false };
      }
      if (!(name in state.files)) {
        return { output: `rm: ${name}: No such file or directory`, state, error: true };
      }
      delete state.files[name];
      return { output: "", state, error: false };
    }

    case "cp": {
      const [src, dest] = args;
      if (!src || !dest) return { output: "usage: cp <source> <dest>", state, error: true };
      if (!(src in state.files)) return { output: `cp: ${src}: No such file or directory`, state, error: true };
      state.files[dest] = state.files[src];
      return { output: "", state, error: false };
    }

    case "mv": {
      const [src, dest] = args;
      if (!src || !dest) return { output: "usage: mv <source> <dest>", state, error: true };
      if (!(src in state.files)) return { output: `mv: ${src}: No such file or directory`, state, error: true };
      state.files[dest] = state.files[src];
      delete state.files[src];
      return { output: "", state, error: false };
    }

    case "grep": {
      const flags = args.filter((a) => a.startsWith("-"));
      const rest = args.filter((a) => !a.startsWith("-"));
      const [pattern, file] = rest;
      if (!pattern || !file) return { output: "usage: grep <pattern> <file>", state, error: true };
      if (!(file in state.files)) return { output: `grep: ${file}: No such file or directory`, state, error: true };
      let re;
      try {
        re = new RegExp(pattern, flags.includes("-i") ? "i" : "");
      } catch {
        return { output: `grep: invalid pattern: ${pattern}`, state, error: true };
      }
      const matches = (state.files[file] || "").split("\n").filter((line) => re.test(line));
      return { output: matches.join("\n"), state, error: false };
    }

    case "wc": {
      const file = args.find((a) => !a.startsWith("-"));
      if (!file) return { output: "usage: wc <file>", state, error: true };
      if (!(file in state.files)) return { output: `wc: ${file}: No such file or directory`, state, error: true };
      const text = state.files[file] || "";
      const lines = text ? text.split("\n").length : 0;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      return { output: `${String(lines).padStart(7)} ${String(words).padStart(7)} ${String(text.length).padStart(7)} ${file}`, state, error: false };
    }

    case "chmod":
      return { output: "", state, error: false };

    case "clear":
      return { output: "", state, error: false, clear: true };

    default:
      return { output: `zsh: command not found: ${bin}`, state, error: true };
  }
}
