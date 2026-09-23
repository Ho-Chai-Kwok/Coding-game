// A small but genuinely real in-browser MongoDB-alike: insertOne/find/
// updateOne/deleteOne actually parse the document/filter the learner typed
// (no eval — a safe regex-based "loose JSON" parser) and operate on a real
// in-memory document store, including real $gt/$lt/$set matching. This
// isn't canned output — querying with the wrong filter really does return
// nothing, exactly like a real database would.

function objectId() {
  return Array.from({ length: 24 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

export function mongoInitialState(content) {
  const collections = structuredClone(content.collections ?? {});
  // Real MongoDB assigns _id the moment a document is created, so preset
  // "this collection already has some data" documents get one too — the
  // same as anything inserted later in the lesson.
  for (const docs of Object.values(collections)) {
    for (const doc of docs) if (!doc._id) doc._id = objectId();
  }
  return { collections };
}

function clone(state) {
  return { collections: structuredClone(state.collections) };
}

// Converts loose, Mongo-shell-style object literal text (unquoted keys,
// single quotes) into strict JSON, then parses it. Deliberately never
// evaluates the text as code — only ever produces plain data.
function parseLoose(text) {
  const fixed = text
    .replace(/([{,]\s*)([$A-Za-z_][A-Za-z0-9_$]*)\s*:/g, '$1"$2":')
    .replace(/'((?:[^'\\]|\\.)*)'/g, (_, inner) => JSON.stringify(inner));
  return JSON.parse(fixed);
}

// Splits "arg1, arg2" at the top-level comma only, respecting nested
// braces/brackets/strings, so updateOne's two object arguments split
// correctly even though each one also contains commas internally.
function splitArgs(text) {
  const args = [];
  let depth = 0;
  let current = "";
  let inString = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      current += ch;
      if (ch === inString && text[i - 1] !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") inString = ch;
    if (ch === "{" || ch === "[") depth++;
    if (ch === "}" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      args.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

function matchesFilter(doc, filter) {
  return Object.entries(filter).every(([key, cond]) => {
    if (cond && typeof cond === "object" && !Array.isArray(cond)) {
      return Object.entries(cond).every(([op, val]) => {
        switch (op) {
          case "$gt":
            return doc[key] > val;
          case "$gte":
            return doc[key] >= val;
          case "$lt":
            return doc[key] < val;
          case "$lte":
            return doc[key] <= val;
          case "$ne":
            return doc[key] !== val;
          default:
            return false;
        }
      });
    }
    return doc[key] === cond;
  });
}

// A pre-formatted fragment (like ObjectId('...')) that should be printed
// as-is, not re-quoted as a plain string by formatValue.
class RawToken {
  constructor(text) {
    this.text = text;
  }
}

function formatValue(v) {
  if (v instanceof RawToken) return v.text;
  if (typeof v === "string") return `'${v}'`;
  if (v && typeof v === "object" && !Array.isArray(v)) return formatDoc(v);
  if (Array.isArray(v)) return `[ ${v.map(formatValue).join(", ")} ]`;
  return String(v);
}
function formatDoc(doc) {
  return "{ " + Object.entries(doc).map(([k, v]) => `${k}: ${formatValue(v)}`).join(", ") + " }";
}

const CALL_RE = /^db\.(\w+)\.(\w+)\((.*)\)$/s;

export function runMongoCommand(cmdRaw, prevState) {
  const cmd = cmdRaw.trim();
  const state = clone(prevState);

  if (cmd === "show dbs") {
    return { output: "admin    40.00 KiB\nconfig   72.00 KiB\nlocal    72.00 KiB\ncodequest 8.19 KiB", state, error: false };
  }
  if (/^use\s+\w+$/.test(cmd)) {
    return { output: `switched to db ${cmd.split(/\s+/)[1]}`, state, error: false };
  }

  const call = cmd.match(CALL_RE);
  if (!call) {
    return { output: `Uncaught SyntaxError: ${cmd.split(" ")[0]} is not defined`, state, error: true };
  }
  const [, collectionName, method, argsText] = call;
  if (!state.collections[collectionName]) state.collections[collectionName] = [];
  const collection = state.collections[collectionName];

  let args;
  try {
    args = splitArgs(argsText).map((a) => (a ? parseLoose(a) : undefined));
  } catch {
    return { output: "SyntaxError: Unexpected token in JSON", state, error: true };
  }

  switch (method) {
    case "insertOne": {
      const doc = args[0];
      if (!doc) return { output: "TypeError: Cannot read properties of undefined", state, error: true };
      const _id = objectId();
      collection.push({ _id, ...doc });
      return { output: `{\n  acknowledged: true,\n  insertedId: ObjectId('${_id}')\n}`, state, error: false };
    }

    case "find": {
      const filter = args[0] ?? {};
      const results = collection.filter((d) => matchesFilter(d, filter));
      if (!results.length) return { output: "", state, error: false };
      return {
        output: results.map((d) => formatDoc({ ...d, _id: new RawToken(`ObjectId('${d._id}')`) })).join("\n"),
        state,
        error: false,
      };
    }

    case "countDocuments": {
      const filter = args[0] ?? {};
      return { output: String(collection.filter((d) => matchesFilter(d, filter)).length), state, error: false };
    }

    case "updateOne": {
      const [filter, update] = args;
      if (!filter || !update) return { output: "TypeError: update requires a filter and an update document", state, error: true };
      const doc = collection.find((d) => matchesFilter(d, filter));
      if (!doc) return { output: "{ acknowledged: true, matchedCount: 0, modifiedCount: 0 }", state, error: false };
      if (update.$set) Object.assign(doc, update.$set);
      return { output: "{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }", state, error: false };
    }

    case "deleteOne": {
      const filter = args[0] ?? {};
      const index = collection.findIndex((d) => matchesFilter(d, filter));
      if (index === -1) return { output: "{ acknowledged: true, deletedCount: 0 }", state, error: false };
      collection.splice(index, 1);
      return { output: "{ acknowledged: true, deletedCount: 1 }", state, error: false };
    }

    default:
      return { output: `TypeError: db.${collectionName}.${method} is not a function`, state, error: true };
  }
}
