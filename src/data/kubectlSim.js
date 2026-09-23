// A small kubectl CLI simulator: tracks pods and deployments well enough
// for get/describe/scale/delete/logs to reflect what's actually been done.

export function kubectlInitialState(content) {
  return {
    pods: (content.pods ?? []).map((p) => ({ ...p })),
    deployments: (content.deployments ?? []).map((d) => ({ ...d })),
  };
}

function clone(state) {
  return { pods: state.pods.map((p) => ({ ...p })), deployments: state.deployments.map((d) => ({ ...d })) };
}

function parse(cmdRaw) {
  return (cmdRaw.trim().match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((t) => t.replace(/^"|"$/g, ""));
}

function podsTable(pods) {
  if (!pods.length) return "No resources found in default namespace.";
  return "NAME                     READY   STATUS    RESTARTS   AGE\n" + pods.map((p) => `${p.name.padEnd(24)} 1/1     ${p.status.padEnd(9)} 0          2m`).join("\n");
}

function deploymentsTable(deployments) {
  if (!deployments.length) return "No resources found in default namespace.";
  return "NAME                READY   UP-TO-DATE   AVAILABLE   AGE\n" + deployments.map((d) => `${d.name.padEnd(19)} ${d.replicas}/${d.replicas}     ${d.replicas}            ${d.replicas}           5m`).join("\n");
}

export function runKubectlCommand(cmdRaw, prevState) {
  const cmd = cmdRaw.trim();
  const state = clone(prevState);
  const tokens = parse(cmd);
  if (!tokens.length) return { output: "", state, error: false };

  if (tokens[0] !== "kubectl") {
    return { output: `zsh: command not found: ${tokens[0]}`, state, error: true };
  }
  const [, sub, ...args] = tokens;

  switch (sub) {
    case "get": {
      const resource = args[0];
      if (resource === "pods" || resource === "pod" || resource === "po") return { output: podsTable(state.pods), state, error: false };
      if (resource === "deployments" || resource === "deployment" || resource === "deploy") return { output: deploymentsTable(state.deployments), state, error: false };
      return { output: `error: the server doesn't have a resource type "${resource}"`, state, error: true };
    }

    case "describe": {
      const [resource, name] = args;
      if (resource === "pod" || resource === "po") {
        const pod = state.pods.find((p) => p.name === name);
        if (!pod) return { output: `Error from server (NotFound): pods "${name}" not found`, state, error: true };
        return {
          output: `Name:         ${pod.name}\nNamespace:    default\nStatus:       ${pod.status}\nIP:           10.244.0.${Math.floor(Math.random() * 200 + 10)}\nContainers:\n  app:\n    Image:   ${pod.image ?? "app:latest"}\n    State:   Running`,
          state,
          error: false,
        };
      }
      return { output: `error: the server doesn't have a resource type "${resource}"`, state, error: true };
    }

    case "apply": {
      const fileIdx = args.indexOf("-f");
      const file = fileIdx >= 0 ? args[fileIdx + 1] : null;
      if (!file) return { output: "error: must specify -f filename", state, error: true };
      // Real kubectl reads the resource name from inside the YAML file,
      // which this simulator doesn't parse — so it's derived from the
      // filename instead (worker-deployment.yaml -> worker), which is
      // predictable enough for a lesson to build on in a later step.
      const name = file.replace(/\.ya?ml$/, "").replace(/-?deployment$/, "") || "app";
      if (!state.deployments.some((d) => d.name === name)) {
        state.deployments.push({ name, replicas: 1, image: `${name}:latest` });
        state.pods.push({ name: `${name}-${Math.random().toString(36).slice(2, 7)}`, status: "Running", image: `${name}:latest` });
      }
      return { output: `deployment.apps/${name} created`, state, error: false };
    }

    case "scale": {
      const nameIdx = args.indexOf("deployment");
      const name = nameIdx >= 0 ? args[nameIdx + 1] : args[0];
      const replicasArg = args.find((a) => a.startsWith("--replicas="));
      const replicas = replicasArg ? Number(replicasArg.split("=")[1]) : null;
      const dep = state.deployments.find((d) => d.name === name);
      if (!dep) return { output: `Error from server (NotFound): deployments.apps "${name}" not found`, state, error: true };
      if (replicas === null) return { output: "error: --replicas is required", state, error: true };
      const diff = replicas - dep.replicas;
      dep.replicas = replicas;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) state.pods.push({ name: `${name}-${Math.random().toString(36).slice(2, 7)}`, status: "Running", image: dep.image });
      } else if (diff < 0) {
        const podsOfDep = state.pods.filter((p) => p.name.startsWith(name));
        for (let i = 0; i < -diff && podsOfDep.length; i++) {
          const victim = podsOfDep.pop();
          state.pods = state.pods.filter((p) => p !== victim);
        }
      }
      return { output: `deployment.apps/${name} scaled`, state, error: false };
    }

    case "delete": {
      const [resource, name] = args;
      if (resource === "pod" || resource === "po") {
        if (!state.pods.some((p) => p.name === name)) return { output: `Error from server (NotFound): pods "${name}" not found`, state, error: true };
        state.pods = state.pods.filter((p) => p.name !== name);
        return { output: `pod "${name}" deleted`, state, error: false };
      }
      if (resource === "deployment" || resource === "deploy") {
        if (!state.deployments.some((d) => d.name === name)) return { output: `Error from server (NotFound): deployments.apps "${name}" not found`, state, error: true };
        state.deployments = state.deployments.filter((d) => d.name !== name);
        state.pods = state.pods.filter((p) => !p.name.startsWith(name));
        return { output: `deployment.apps "${name}" deleted`, state, error: false };
      }
      return { output: `error: the server doesn't have a resource type "${resource}"`, state, error: true };
    }

    case "logs": {
      const name = args[0];
      const pod = state.pods.find((p) => p.name === name);
      if (!pod) return { output: `Error from server (NotFound): pods "${name}" not found`, state, error: true };
      return { output: "Server started on port 8080\nReady to accept traffic", state, error: false };
    }

    default:
      return { output: `error: unknown command "${sub}" for "kubectl"`, state, error: true };
  }
}
