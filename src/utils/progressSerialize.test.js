import { describe, expect, test } from "vitest";
import { packWorlds, unpackWorlds, packSideQuests, unpackSideQuests } from "./progressSerialize";
import { worlds } from "../data/levels";
import { sidequests } from "../data/sidequests";

// CQ-19: covers the save-file format every returning player depends on.
// A bug here either loses progress or corrupts a save silently.

describe("packWorlds / unpackWorlds", () => {
  test("a fresh board (no play yet) packs to an empty diff", () => {
    const fresh = structuredClone(worlds);
    expect(packWorlds(fresh)).toEqual({});
  });

  test("unpacking an empty diff reproduces the fresh baseline exactly", () => {
    expect(unpackWorlds({})).toEqual(worlds);
  });

  test("completing one level round-trips: pack -> unpack gives the same board back", () => {
    const current = structuredClone(worlds);
    const firstLevel = current[0].levels[0];
    firstLevel.status = "completed";

    const packed = packWorlds(current);
    expect(packed[firstLevel.id]).toBe("completed");
    // Nothing else should be in the diff — only what actually changed.
    expect(Object.keys(packed)).toEqual([firstLevel.id]);

    const restored = unpackWorlds(packed);
    expect(restored[0].levels[0].status).toBe("completed");
    // Everything untouched should still match the fresh baseline.
    restored[0].levels[0].status = worlds[0].levels[0].status;
    expect(restored).toEqual(worlds);
  });

  test("unpacking an old-style full-array save still works (back-compat)", () => {
    const savedAsArray = structuredClone(worlds);
    savedAsArray[2].status = "completed";
    const restored = unpackWorlds(savedAsArray);
    expect(restored[2].status).toBe("completed");
  });

  test("unpacking null/undefined returns a fresh board, not a crash", () => {
    expect(unpackWorlds(null)).toEqual(worlds);
    expect(unpackWorlds(undefined)).toEqual(worlds);
  });

  test("a saved id that no longer exists in the curriculum is ignored, not thrown", () => {
    expect(() => unpackWorlds({ "no-such-level-id": "completed" })).not.toThrow();
  });
});

describe("packSideQuests / unpackSideQuests", () => {
  test("a fresh board packs to an empty diff and round-trips", () => {
    const fresh = structuredClone(sidequests);
    expect(packSideQuests(fresh)).toEqual({});
    expect(unpackSideQuests({})).toEqual(sidequests);
  });

  test("completing one lesson round-trips", () => {
    const current = structuredClone(sidequests);
    const firstLesson = current[0].lessons[0];
    firstLesson.status = "completed";
    const packed = packSideQuests(current);
    expect(packed[firstLesson.id]).toBe("completed");
    const restored = unpackSideQuests(packed);
    expect(restored[0].lessons[0].status).toBe("completed");
  });
});
