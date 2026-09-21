// Every language a learner can pick. `compiled` languages can't run inside the
// browser, so their code is sent to an online compiler (see utils/remoteRun.js).
export const LANGUAGES = [
  { id: "javascript", name: "JavaScript", icon: "💛", descKey: "jsDesc", compiled: false },
  { id: "python", name: "Python", icon: "🐍", descKey: "pyDesc", compiled: false },
  { id: "c", name: "C", icon: "🔧", descKey: "cDesc", compiled: true },
  { id: "cpp", name: "C++", icon: "⚙️", descKey: "cppDesc", compiled: true },
  { id: "java", name: "Java", icon: "☕", descKey: "javaDesc", compiled: true },
];

export function getLanguage(id) {
  return LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
}

export function isCompiledLanguage(id) {
  return LANGUAGES.some((l) => l.id === id && l.compiled);
}

// Languages that run instantly in the browser — used by timed Ranked modes,
// where waiting several seconds on an online compiler would be unfair.
export function toInstantLanguage(id) {
  return isCompiledLanguage(id) ? "javascript" : id;
}
