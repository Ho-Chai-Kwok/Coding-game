import { worlds } from "../data/levels";
import { sidequests } from "../data/sidequests";

// Saves only the unlock/completion status of each world/level/lesson that
// differs from a fresh start, never the lesson content itself. That keeps
// saves tiny and means new or edited lessons reach existing players.

function statusMap(list, childKey) {
  const map = {};
  for (const item of list) {
    map[item.id] = item.status;
    for (const child of item[childKey]) map[child.id] = child.status;
  }
  return map;
}

function pack(current, baseline, childKey) {
  const base = statusMap(baseline, childKey);
  const now = statusMap(current, childKey);
  const changed = {};
  for (const id in now) {
    if (now[id] !== base[id]) changed[id] = now[id];
  }
  return changed;
}

function unpack(saved, baseline, childKey) {
  const fresh = structuredClone(baseline);
  // Older saves stored the entire curriculum as an array.
  const changed = Array.isArray(saved) ? statusMap(saved, childKey) : saved;
  if (!changed) return fresh;
  for (const item of fresh) {
    if (changed[item.id]) item.status = changed[item.id];
    for (const child of item[childKey]) {
      if (changed[child.id]) child.status = changed[child.id];
    }
  }
  return fresh;
}

export const packWorlds = (current) => pack(current, worlds, "levels");
export const unpackWorlds = (saved) => unpack(saved, worlds, "levels");
export const packSideQuests = (current) => pack(current, sidequests, "lessons");
export const unpackSideQuests = (saved) => unpack(saved, sidequests, "lessons");
