// A small, believable Git command interpreter used by the Git & GitHub side
// quest's terminal lessons. It doesn't run real Git — there's no real
// filesystem in a browser tab — but it tracks enough state (staged/modified/
// untracked files, commits, branches, a fake remote) to react to *any*
// command a learner types with realistic output, not just the one the
// lesson is asking for. That's the point: typing `git status` mid-lesson
// should show real git status output, not "wrong answer."

export function freshRepoState(files = {}) {
  return {
    initialized: true,
    branch: "main",
    branches: ["main"],
    // { filename: "untracked" | "modified" | "staged" | "clean" }
    files: { ...files },
    // Files git has committed at least once — lets a staged file be labeled
    // "modified" (already tracked) vs "new file" (previously untracked),
    // exactly like real `git status` does.
    tracked: Object.entries(files)
      .filter(([, s]) => s === "modified" || s === "clean")
      .map(([f]) => f),
    commits: [], // { hash, message }
    remoteUrl: null,
    upstreamSet: false,
    pushedHead: null, // hash of the last pushed commit
    stash: null, // { files } | null
    mergedBranches: [],
  };
}

// Lets a lesson start mid-story (e.g. "you already made a commit") without
// the learner having to redo earlier steps just to reach the interesting part.
export function seedCommits(state, messages) {
  const next = clone(state);
  for (const message of messages) next.commits.push({ hash: hash(), message });
  return next;
}

function hash() {
  return Array.from({ length: 7 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

function clone(state) {
  return JSON.parse(JSON.stringify(state));
}

function filesByStatus(state, status) {
  return Object.entries(state.files)
    .filter(([, s]) => s === status)
    .map(([f]) => f);
}

function statusOutput(state) {
  const staged = filesByStatus(state, "staged");
  const modified = filesByStatus(state, "modified");
  const untracked = filesByStatus(state, "untracked");
  if (!staged.length && !modified.length && !untracked.length) {
    return `On branch ${state.branch}\nnothing to commit, working tree clean`;
  }
  const parts = [`On branch ${state.branch}`];
  if (staged.length) {
    parts.push(
      `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n` +
        staged.map((f) => `\t${state.tracked.includes(f) ? "modified" : "new file"}:   ${f}`).join("\n"),
    );
  }
  if (modified.length) {
    parts.push(
      `Changes not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n` +
        modified.map((f) => `\tmodified:   ${f}`).join("\n"),
    );
  }
  if (untracked.length) {
    parts.push(
      `Untracked files:\n  (use "git add <file>..." to include in what will be committed)\n` +
        untracked.map((f) => `\t${f}`).join("\n"),
    );
  }
  return parts.join("\n\n");
}

function parse(cmdRaw) {
  const tokens = cmdRaw.trim().match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
  return tokens.map((t) => t.replace(/^"|"$/g, ""));
}

// Returns { output, state, error } — error is true for a real git error so
// the terminal can style it differently, but it's still shown, never blocked.
export function runGitCommand(cmdRaw, prevState, repoName = "my-project") {
  const cmd = cmdRaw.trim();
  const tokens = parse(cmd);
  const state = clone(prevState);

  if (!tokens.length) return { output: "", state, error: false };

  if (tokens[0] === "git" && !tokens[1]) {
    return { output: "usage: git <command> [<args>]", state, error: true };
  }

  if (tokens[0] !== "git") {
    return { output: `zsh: command not found: ${tokens[0]}`, state, error: true };
  }

  const [, sub, ...args] = tokens;

  switch (sub) {
    case "init":
      return { output: `Initialized empty Git repository in ~/${repoName}/.git/`, state, error: false };

    case "clone": {
      const url = args[0] ?? "https://github.com/you/repo.git";
      const name = url.split("/").pop().replace(/\.git$/, "");
      return {
        output:
          `Cloning into '${name}'...\n` +
          `remote: Enumerating objects: 24, done.\n` +
          `remote: Counting objects: 100% (24/24), done.\n` +
          `remote: Compressing objects: 100% (18/18), done.\n` +
          `Receiving objects: 100% (24/24), 8.21 KiB | 8.21 MiB/s, done.\n` +
          `Resolving deltas: 100% (6/6), done.`,
        state,
        error: false,
      };
    }

    case "status":
      return { output: statusOutput(state), state, error: false };

    case "add": {
      const target = args[0];
      if (!target) return { output: "Nothing specified, nothing added.", state, error: true };
      const names =
        target === "."
          ? Object.keys(state.files).filter((f) => state.files[f] !== "staged" && state.files[f] !== "clean")
          : [target];
      for (const f of names) {
        if (!(f in state.files)) {
          return { output: `fatal: pathspec '${f}' did not match any files`, state, error: true };
        }
        state.files[f] = "staged";
      }
      return { output: "", state, error: false };
    }

    case "commit": {
      const staged = filesByStatus(state, "staged");
      const mIndex = args.indexOf("-m");
      const message = mIndex >= 0 ? args[mIndex + 1] : null;
      if (!message) {
        return { output: "error: switch `m' requires a value\nTry: git commit -m \"your message\"", state, error: true };
      }
      if (!staged.length) {
        const hasUnstaged = filesByStatus(state, "modified").length || filesByStatus(state, "untracked").length;
        return {
          output: hasUnstaged
            ? `On branch ${state.branch}\nno changes added to commit (use "git add" and/or "git commit -a")`
            : `On branch ${state.branch}\nnothing to commit, working tree clean`,
          state,
          error: true,
        };
      }
      const h = hash();
      state.commits.push({ hash: h, message, branch: state.branch });
      for (const f of staged) {
        state.files[f] = "clean";
        if (!state.tracked.includes(f)) state.tracked.push(f);
      }
      return {
        output: `[${state.branch} ${h}] ${message}\n ${staged.length} file${staged.length > 1 ? "s" : ""} changed`,
        state,
        error: false,
      };
    }

    case "log": {
      if (!state.commits.length) {
        return { output: `fatal: your current branch '${state.branch}' does not have any commits yet`, state, error: true };
      }
      const ordered = [...state.commits].reverse();
      if (args.includes("--oneline")) {
        return { output: ordered.map((c) => `${c.hash.slice(0, 7)} ${c.message}`).join("\n"), state, error: false };
      }
      return {
        output: ordered
          .map(
            (c, i) =>
              `commit ${c.hash}${i === 0 ? ` (HEAD -> ${state.branch})` : ""}\n` +
              `Author: You <you@example.com>\nDate:   Mon Sep 23 12:00:00 2026 +0000\n\n    ${c.message}`,
          )
          .join("\n\n"),
        state,
        error: false,
      };
    }

    case "branch": {
      if (!args.length) {
        return {
          output: state.branches.map((b) => (b === state.branch ? `* ${b}` : `  ${b}`)).join("\n"),
          state,
          error: false,
        };
      }
      const name = args[0];
      if (state.branches.includes(name)) {
        return { output: `fatal: a branch named '${name}' already exists`, state, error: true };
      }
      state.branches.push(name);
      return { output: "", state, error: false };
    }

    case "checkout":
    case "switch": {
      const flagIndex = args.findIndex((a) => a === "-b" || a === "-c");
      const creating = flagIndex !== -1;
      const name = creating ? args[flagIndex + 1] : args[0];
      if (!name) return { output: "error: missing branch name", state, error: true };
      if (creating) {
        if (state.branches.includes(name)) {
          return { output: `fatal: a branch named '${name}' already exists`, state, error: true };
        }
        state.branches.push(name);
        state.branch = name;
        return { output: `Switched to a new branch '${name}'`, state, error: false };
      }
      if (!state.branches.includes(name)) {
        return {
          output:
            sub === "checkout"
              ? `error: pathspec '${name}' did not match any file(s) known to git`
              : `fatal: invalid reference: ${name}`,
          state,
          error: true,
        };
      }
      state.branch = name;
      return { output: `Switched to branch '${name}'`, state, error: false };
    }

    case "merge": {
      const name = args[0];
      if (!name) return { output: "fatal: no branch specified", state, error: true };
      if (!state.branches.includes(name)) {
        return { output: `merge: ${name} - not something we can merge`, state, error: true };
      }
      if (name === state.branch || state.mergedBranches.includes(name)) {
        return { output: "Already up to date.", state, error: false };
      }
      state.mergedBranches.push(name);
      const h = hash();
      return {
        output: `Updating ${hash().slice(0, 7)}..${h.slice(0, 7)}\nFast-forward\n 1 file changed, 3 insertions(+)`,
        state,
        error: false,
      };
    }

    case "remote": {
      if (args[0] === "-v") {
        return {
          output: state.remoteUrl
            ? `origin  ${state.remoteUrl} (fetch)\norigin  ${state.remoteUrl} (push)`
            : "",
          state,
          error: false,
        };
      }
      if (args[0] === "add") {
        const url = args[2];
        if (!url) return { output: "usage: git remote add <name> <url>", state, error: true };
        state.remoteUrl = url;
        return { output: "", state, error: false };
      }
      return { output: `git remote: unknown option '${args[0] ?? ""}'`, state, error: true };
    }

    case "push": {
      if (!state.remoteUrl) {
        return {
          output:
            "fatal: No configured push destination.\nEither specify the URL from the command-line or configure a remote repository\nusing\n\n    git remote add <name> <url>\n\nand then push using the remote name",
          state,
          error: true,
        };
      }
      const settingUpstream = args.includes("-u") || args.includes("--set-upstream");
      if (!state.upstreamSet && !settingUpstream) {
        return {
          output:
            `fatal: The current branch ${state.branch} has no upstream branch.\n` +
            `To push the current branch and set the remote as upstream, use\n\n` +
            `    git push --set-upstream origin ${state.branch}`,
          state,
          error: true,
        };
      }
      if (!state.commits.length) {
        return { output: "Everything up-to-date", state, error: false };
      }
      const alreadyPushed = state.pushedHead === state.commits.at(-1).hash;
      if (alreadyPushed) {
        return { output: "Everything up-to-date", state, error: false };
      }
      const firstPush = !state.upstreamSet;
      state.upstreamSet = true;
      state.pushedHead = state.commits.at(-1).hash;
      const base = firstPush ? "[new branch]     " : `${hash().slice(0, 7)}..${state.pushedHead.slice(0, 7)}`;
      // Only shown when a lesson opts in (content.ciEnabled) — a plain Git
      // & GitHub lesson's push never prints this, since real `git push`
      // itself knows nothing about CI; a connected CI service just happens
      // to be watching for new commits and reacting to them.
      const ciLines = state.ciEnabled
        ? `\nremote: Triggering CI pipeline...\n` +
          (state.ciOutcome === "fail"
            ? `remote: ✓ build passed (11s)\nremote: ✗ test failed (18s) — 1 test failed\nremote: Deployment blocked until tests pass.`
            : `remote: ✓ build passed (11s)\nremote: ✓ test passed (34s)\nremote: ✓ deployed to production`)
        : "";
      return {
        output:
          `Enumerating objects: 5, done.\n` +
          `Counting objects: 100% (5/5), done.\n` +
          `Writing objects: 100% (5/5), 512 bytes | 512.00 KiB/s, done.\n` +
          `To ${state.remoteUrl}\n` +
          ` ${base} ${state.branch} -> ${state.branch}` +
          (firstPush ? `\nBranch '${state.branch}' set up to track remote branch '${state.branch}' from 'origin'.` : "") +
          ciLines,
        state,
        error: false,
      };
    }

    case "pull":
    case "fetch":
      if (!state.remoteUrl) {
        return { output: "fatal: No remote repository specified.", state, error: true };
      }
      return { output: sub === "pull" ? "Already up to date." : `From ${state.remoteUrl}\n * branch            ${state.branch}     -> FETCH_HEAD`, state, error: false };

    case "diff": {
      const modified = filesByStatus(state, "modified");
      if (!modified.length) return { output: "", state, error: false };
      const f = modified[0];
      return {
        output: `diff --git a/${f} b/${f}\nindex e69de29..8f94b3c 100644\n--- a/${f}\n+++ b/${f}\n@@ -1 +1,2 @@\n+<h1>Hello!</h1>`,
        state,
        error: false,
      };
    }

    case "stash": {
      if (args[0] === "pop") {
        if (!state.stash) return { output: "No stash entries found.", state, error: true };
        for (const f of Object.keys(state.stash.files)) state.files[f] = state.stash.files[f];
        state.stash = null;
        return { output: `On branch ${state.branch}\nChanges not staged for commit:\n\tmodified:   ${Object.keys(state.files)[0]}`, state, error: false };
      }
      const modified = filesByStatus(state, "modified");
      if (!modified.length) return { output: "No local changes to save", state, error: true };
      state.stash = { files: Object.fromEntries(modified.map((f) => [f, state.files[f]])) };
      for (const f of modified) state.files[f] = "clean";
      return { output: `Saved working directory and index state WIP on ${state.branch}: ${hash()} snapshot`, state, error: false };
    }

    default:
      return { output: `git: '${sub}' is not a git command. See 'git --help'.`, state, error: true };
  }
}

// Builds a lesson's starting state from its `content` fields (initialFiles,
// initialCommits, extraBranches, startBranch, presetRemoteUrl,
// presetUpstreamSet). Used by TerminalChallenge so every tool exposes the
// same (run, initialState) shape.
export function gitInitialState(content) {
  let s = freshRepoState(content.initialFiles ?? {});
  if (content.initialCommits?.length) s = seedCommits(s, content.initialCommits);
  if (content.extraBranches?.length) s.branches.push(...content.extraBranches);
  if (content.startBranch) s.branch = content.startBranch;
  if (content.presetRemoteUrl) s.remoteUrl = content.presetRemoteUrl;
  if (content.presetUpstreamSet) {
    s.upstreamSet = true;
    s.pushedHead = s.commits.at(-1)?.hash ?? null;
  }
  if (content.ciEnabled) s.ciEnabled = true;
  if (content.ciOutcome) s.ciOutcome = content.ciOutcome;
  return s;
}
