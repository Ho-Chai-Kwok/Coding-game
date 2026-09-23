// A small AWS CLI simulator focused on S3 (the most concretely "do
// something and see it" service): buckets really exist once made, files
// really appear once uploaded, and disappear once removed.

export function awsInitialState(content) {
  return { buckets: structuredClone(content.buckets ?? {}) }; // { bucketName: [objectKeys] }
}

function clone(state) {
  return { buckets: structuredClone(state.buckets) };
}

function parse(cmdRaw) {
  return (cmdRaw.trim().match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map((t) => t.replace(/^"|"$/g, ""));
}

function parseS3Uri(uri) {
  const m = /^s3:\/\/([^/]+)\/?(.*)$/.exec(uri ?? "");
  return m ? { bucket: m[1], key: m[2] } : null;
}

export function runAwsCommand(cmdRaw, prevState) {
  const cmd = cmdRaw.trim();
  const state = clone(prevState);
  const tokens = parse(cmd);
  if (!tokens.length) return { output: "", state, error: false };

  if (tokens[0] !== "aws") {
    return { output: `zsh: command not found: ${tokens[0]}`, state, error: true };
  }
  if (tokens[1] === "--version") {
    return { output: "aws-cli/2.15.0 Python/3.11.6 Darwin/23.0.0 exe/x86_64", state, error: false };
  }
  if (tokens[1] === "configure") {
    return {
      output: "AWS Access Key ID [None]: ****************ABCD\nAWS Secret Access Key [None]: ****************wxyz\nDefault region name [None]: us-east-1\nDefault output format [None]: json",
      state,
      error: false,
    };
  }

  if (tokens[1] !== "s3") {
    return { output: `\nusage: aws [options] <command> <subcommand> [parameters]\naws: error: argument command: Invalid choice, valid choices are: s3 | ec2 | ...`, state, error: true };
  }

  const [, , sub, ...args] = tokens;

  switch (sub) {
    case "mb": {
      const uri = parseS3Uri(args[0]);
      if (!uri) return { output: "usage: aws s3 mb s3://<bucket>", state, error: true };
      if (state.buckets[uri.bucket]) return { output: `make_bucket failed: ${args[0]} An error occurred (BucketAlreadyOwnedByYou)`, state, error: true };
      state.buckets[uri.bucket] = [];
      return { output: `make_bucket: ${uri.bucket}`, state, error: false };
    }

    case "ls": {
      const target = args.find((a) => !a.startsWith("-"));
      if (!target) {
        const names = Object.keys(state.buckets);
        if (!names.length) return { output: "", state, error: false };
        return { output: names.map((b) => `2026-01-01 00:00:00 ${b}`).join("\n"), state, error: false };
      }
      const uri = parseS3Uri(target);
      if (!uri || !(uri.bucket in state.buckets)) return { output: `An error occurred (NoSuchBucket) when calling the ListObjectsV2 operation: The specified bucket does not exist`, state, error: true };
      const objects = state.buckets[uri.bucket].filter((k) => k.startsWith(uri.key));
      if (!objects.length) return { output: "", state, error: false };
      return { output: objects.map((k) => `2026-01-01 00:00:00       1024 ${k}`).join("\n"), state, error: false };
    }

    case "cp": {
      const [source, dest] = args;
      if (!source || !dest) return { output: "usage: aws s3 cp <source> <dest>", state, error: true };
      const uri = parseS3Uri(dest);
      if (!uri) return { output: "Unknown options: destination must be an s3:// URI", state, error: true };
      if (!(uri.bucket in state.buckets)) return { output: `upload failed: ${source} to ${dest} An error occurred (NoSuchBucket) when calling the PutObject operation: The specified bucket does not exist`, state, error: true };
      const key = uri.key || source.split("/").pop();
      if (!state.buckets[uri.bucket].includes(key)) state.buckets[uri.bucket].push(key);
      return { output: `upload: ${source.startsWith("./") ? source : "./" + source} to s3://${uri.bucket}/${key}`, state, error: false };
    }

    case "rm": {
      const uri = parseS3Uri(args[0]);
      if (!uri) return { output: "usage: aws s3 rm s3://<bucket>/<key>", state, error: true };
      if (!(uri.bucket in state.buckets) || !state.buckets[uri.bucket].includes(uri.key)) {
        return { output: `delete failed: ${args[0]} An error occurred (404) when calling the DeleteObject operation`, state, error: true };
      }
      state.buckets[uri.bucket] = state.buckets[uri.bucket].filter((k) => k !== uri.key);
      return { output: `delete: s3://${uri.bucket}/${uri.key}`, state, error: false };
    }

    case "rb": {
      const uri = parseS3Uri(args[0]);
      if (!uri || !(uri.bucket in state.buckets)) return { output: `remove_bucket failed: ${args[0]} An error occurred (NoSuchBucket)`, state, error: true };
      if (state.buckets[uri.bucket].length) return { output: `remove_bucket failed: ${args[0]} An error occurred (BucketNotEmpty)`, state, error: true };
      delete state.buckets[uri.bucket];
      return { output: `remove_bucket: ${uri.bucket}`, state, error: false };
    }

    default:
      return { output: `\nusage: aws s3 [options] <command> [parameters]\naws: error: Invalid choice: '${sub}'`, state, error: true };
  }
}
