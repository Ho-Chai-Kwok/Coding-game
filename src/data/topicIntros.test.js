import { describe, it, expect } from "vitest";
import { TOPIC_INTROS, introForLanguage } from "./topicIntros.js";

const LANGS = ["javascript", "python", "c", "cpp", "java"];

describe("topic intros", () => {
  it("every beat has text in every language", () => {
    for (const [name, intro] of Object.entries(TOPIC_INTROS)) {
      for (const lang of LANGS) {
        const r = introForLanguage(intro, lang);
        expect(typeof r.topic, `${name} topic (${lang})`).toBe("string");
        for (const b of r.beats) expect(b.caption, `${name} (${lang})`).toBeTruthy();
      }
    }
  });

  it("a Python player never sees JavaScript syntax", () => {
    for (const intro of Object.values(TOPIC_INTROS)) {
      const r = introForLanguage(intro, "python");
      const text = [r.topic, ...r.beats.map((b) => b.caption)].join("\n");
      expect(text).not.toMatch(/console\.log|\blet \w|function \w+\(|\+\+|;\s*$/m);
    }
  });

  it("unknown languages fall back to JavaScript", () => {
    const r = introForLanguage(TOPIC_INTROS["Say Hello"], "rust");
    expect(r.topic).toBe("console.log()");
  });
});
