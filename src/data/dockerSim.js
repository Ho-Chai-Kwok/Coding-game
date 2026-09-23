// A small Docker CLI simulator: tracks pulled images and containers well
// enough to make `docker ps`, `docker images`, etc. reflect what you've
// actually done, with realistic multi-line output for pull/build/run.

export function dockerInitialState(content) {
  return {
    images: [...(content.images ?? [])], // ["node:20", ...]
    containers: [...(content.containers ?? [])], // { id, name, image, status }
  };
}

function clone(state) {
  return { images: [...state.images], containers: state.containers.map((c) => ({ ...c })) };
}

function shortId() {
  return Array.from({ length: 12 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

function parse(cmdRaw) {
  return (cmdRaw.trim().match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((t) => t.replace(/^"|"$/g, ""));
}

function findContainer(state, ref) {
  return state.containers.find((c) => c.id.startsWith(ref) || c.name === ref);
}

export function runDockerCommand(cmdRaw, prevState) {
  const cmd = cmdRaw.trim();
  const state = clone(prevState);
  const tokens = parse(cmd);
  if (!tokens.length) return { output: "", state, error: false };

  if (tokens[0] !== "docker") {
    return { output: `zsh: command not found: ${tokens[0]}`, state, error: true };
  }
  const [, sub, ...args] = tokens;

  switch (sub) {
    case "--version":
      return { output: "Docker version 25.0.3, build 4debf41", state, error: false };

    case "pull": {
      const image = args[0];
      if (!image) return { output: "docker: 'docker pull' requires 1 argument", state, error: true };
      if (!state.images.includes(image)) state.images.push(image);
      return {
        output:
          `${image.split(":")[1] ?? "latest"}: Pulling from library/${image.split(":")[0]}\n` +
          `a2abf6c4d29d: Pull complete\n` +
          `c7c6e01a91c6: Pull complete\n` +
          `Digest: sha256:${shortId()}${shortId()}\n` +
          `Status: Downloaded newer image for ${image}`,
        state,
        error: false,
      };
    }

    case "images":
      if (!state.images.length) return { output: "REPOSITORY   TAG       IMAGE ID       CREATED       SIZE", state, error: false };
      return {
        output:
          "REPOSITORY   TAG       IMAGE ID       CREATED        SIZE\n" +
          state.images
            .map((img) => {
              const [repo, tag = "latest"] = img.split(":");
              return `${repo.padEnd(12)} ${tag.padEnd(9)} ${shortId().slice(0, 12)}   2 days ago     142MB`;
            })
            .join("\n"),
        state,
        error: false,
      };

    case "run": {
      // Walk positionally rather than filtering by value — a container can
      // legitimately share its name with its image (e.g. `--name api api`),
      // which value-based filtering would wrongly treat as ambiguous.
      let detached = false;
      let name = null;
      const rest = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === "-d") detached = true;
        else if (args[i] === "--name") name = args[++i];
        else rest.push(args[i]);
      }
      const image = rest[0];
      if (!image) return { output: "docker: requires at least 1 argument.", state, error: true };
      if (!state.images.includes(image)) {
        return {
          output: `Unable to find image '${image}' locally\ndocker: Error response from daemon: pull access denied, repository does not exist or may require 'docker login'`,
          state,
          error: true,
        };
      }
      const id = shortId();
      state.containers.push({ id, name: name ?? image.split(":")[0] + "-" + id.slice(0, 4), image, status: "running" });
      return { output: detached ? id : `Running ${image}... (press Ctrl+C to stop)`, state, error: false };
    }

    case "ps": {
      const all = args.includes("-a");
      const rows = state.containers.filter((c) => all || c.status === "running");
      const header = "CONTAINER ID   IMAGE          STATUS          NAMES";
      if (!rows.length) return { output: header, state, error: false };
      return {
        output:
          header +
          "\n" +
          rows
            .map(
              (c) =>
                `${c.id.slice(0, 12)}   ${c.image.padEnd(14)} ${(c.status === "running" ? "Up 2 minutes" : "Exited (0)").padEnd(15)} ${c.name}`,
            )
            .join("\n"),
        state,
        error: false,
      };
    }

    case "stop": {
      const ref = args[0];
      const c = findContainer(state, ref ?? "");
      if (!c) return { output: `Error: No such container: ${ref}`, state, error: true };
      c.status = "exited";
      return { output: c.name, state, error: false };
    }

    case "rm": {
      const ref = args[0];
      const c = findContainer(state, ref ?? "");
      if (!c) return { output: `Error: No such container: ${ref}`, state, error: true };
      if (c.status === "running") {
        return { output: `Error response from daemon: You cannot remove a running container ${c.id}. Stop the container before attempting removal or force remove`, state, error: true };
      }
      state.containers = state.containers.filter((x) => x !== c);
      return { output: c.name, state, error: false };
    }

    case "build": {
      const tagIdx = args.indexOf("-t");
      const tag = tagIdx >= 0 ? args[tagIdx + 1] : "app:latest";
      state.images.push(tag);
      return {
        output:
          `[+] Building 4.2s (10/10) FINISHED\n` +
          ` => [internal] load build definition from Dockerfile          0.0s\n` +
          ` => [internal] load .dockerignore                             0.0s\n` +
          ` => [1/5] FROM node:20                                        0.8s\n` +
          ` => [2/5] WORKDIR /app                                        0.1s\n` +
          ` => [3/5] COPY package.json .                                 0.1s\n` +
          ` => [4/5] RUN npm install                                     2.4s\n` +
          ` => [5/5] COPY . .                                            0.2s\n` +
          ` => exporting to image                                        0.4s\n` +
          ` => naming to docker.io/library/${tag}`,
        state,
        error: false,
      };
    }

    case "logs": {
      const c = findContainer(state, args[0] ?? "");
      if (!c) return { output: `Error: No such container: ${args[0]}`, state, error: true };
      return { output: `Server listening on port 3000\nConnected to database\nReady to accept connections`, state, error: false };
    }

    default:
      return { output: `docker: '${sub}' is not a docker command.\nSee 'docker --help'`, state, error: true };
  }
}
