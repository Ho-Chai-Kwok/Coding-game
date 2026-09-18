// The ranked question bank: a dedicated pool of knowledge-check questions
// for Ranked Mode's quiz-based modes (Predict the Output, Showdown, Chaos
// Round), separate from the Learning Mode curriculum so ranked play tests
// real understanding instead of overlapping with lessons a player may
// have memorized. Organized into 7 difficulty levels that line up with
// the 7 ranked tiers in rank.js (1 = Bronze, 7 = Grandmaster) — matches
// are served questions from the tier the player is currently ranked in.
//
// Shape matches the existing quiz content elsewhere in the app so it can
// flow straight into QuizChallenge/TutorialCard: { topic, tutorial?,
// example?, question, options, correctIndex, explanation }. tutorial is
// left out for most items on purpose — ranked is meant to feel like a
// quick knowledge check, not a mini-lesson.

const LEVEL_1_BRONZE = [
  {
    topic: "Output",
    question: "Which line correctly prints text in JavaScript?",
    options: ['print("Hi")', 'console.log("Hi")', 'echo "Hi"', 'System.out("Hi")'],
    correctIndex: 1,
    explanation: "console.log() is JavaScript's built-in function for printing to the console.",
  },
  {
    topic: "Variables",
    question: "Which keyword declares a variable that can be reassigned later?",
    options: ["const", "let", "final", "static"],
    correctIndex: 1,
    explanation: "let declares a variable whose value can change; const cannot be reassigned.",
  },
  {
    topic: "Data Types",
    question: "What data type is the value true?",
    options: ["String", "Number", "Boolean", "Array"],
    correctIndex: 2,
    explanation: "true and false are Boolean values.",
  },
  {
    topic: "Math Operators",
    question: "What does 7 % 2 evaluate to?",
    options: ["3.5", "0", "1", "14"],
    correctIndex: 2,
    explanation: "% is the modulo operator — it returns the remainder, and 7 divided by 2 leaves a remainder of 1.",
  },
  {
    topic: "Strings",
    question: 'What does "Code" + "Quest" produce?',
    options: ["Code Quest", "CodeQuest", "Error", "10"],
    correctIndex: 1,
    explanation: "+ joins strings directly with no space unless you add one yourself.",
  },
  {
    topic: "Comparisons",
    question: "What does 5 > 3 evaluate to?",
    options: ["5", "3", "true", "false"],
    correctIndex: 2,
    explanation: "Comparison operators like > always produce a Boolean result.",
  },
  {
    topic: "Conditionals",
    question: "Which keyword runs code only when a condition is true?",
    options: ["for", "if", "function", "return"],
    correctIndex: 1,
    explanation: "if checks a condition and only runs its block when that condition is true.",
  },
  {
    topic: "Loops",
    question: "How many times does this loop run?\nfor (let i = 0; i < 4; i++) { }",
    options: ["3", "4", "5", "Infinite"],
    correctIndex: 1,
    explanation: "i starts at 0 and runs while i < 4, covering i = 0,1,2,3 — 4 times.",
  },
  {
    topic: "Arrays",
    question: "What is the index of the first item in an array?",
    options: ["1", "0", "-1", "It depends"],
    correctIndex: 1,
    explanation: "Arrays are zero-indexed — the first item is always at index 0.",
  },
  {
    topic: "Booleans",
    question: "Which of these values is 'falsy' in JavaScript?",
    options: ["1", '"hello"', "0", "[]"],
    correctIndex: 2,
    explanation: "0 is one of JavaScript's falsy values, along with '', null, undefined, and NaN.",
  },
];

const LEVEL_2_SILVER = [
  {
    topic: "Loops",
    question: "What's the main difference between a for loop and a while loop?",
    options: [
      "for loops can't use conditions",
      "for loops bundle initialization, condition, and increment together",
      "while loops always run infinitely",
      "There is no difference",
    ],
    correctIndex: 1,
    explanation: "A for loop's three parts (start, condition, step) all live in one line, unlike a while loop.",
  },
  {
    topic: "Equality",
    question: 'What does 5 == "5" evaluate to in JavaScript?',
    options: ["false", "true", "undefined", "Error"],
    correctIndex: 1,
    explanation: "== compares after converting types, so the number 5 and string \"5\" are considered equal.",
  },
  {
    topic: "Equality",
    question: 'What does 5 === "5" evaluate to?',
    options: ["true", "false", "5", "NaN"],
    correctIndex: 1,
    explanation: "=== checks both value AND type, and a number is never strictly equal to a string.",
  },
  {
    topic: "Functions",
    question: "What does a function return if it has no return statement?",
    options: ["null", "0", "undefined", "An error"],
    correctIndex: 2,
    explanation: "A function without an explicit return implicitly returns undefined.",
  },
  {
    topic: "Strings",
    question: 'What does "Hello".length return?',
    options: ["4", "5", "6", "Error"],
    correctIndex: 1,
    explanation: '"Hello" has 5 characters.',
  },
  {
    topic: "Arrays",
    question: "What does [1, 2, 3][5] return?",
    options: ["3", "undefined", "Error", "null"],
    correctIndex: 1,
    explanation: "Accessing an index beyond the array's length returns undefined, not an error.",
  },
  {
    topic: "Objects",
    question: 'How do you access the "name" property of an object called person?',
    options: ["person->name", "person.name", "person::name", "person(name)"],
    correctIndex: 1,
    explanation: "Dot notation (object.property) is the standard way to access object properties.",
  },
  {
    topic: "Operators",
    question: "What does the ++ operator do?",
    options: ["Adds two numbers", "Increases a variable by 1", "Doubles a variable", "Compares two values"],
    correctIndex: 1,
    explanation: "++ is shorthand for increasing a number by exactly 1.",
  },
  {
    topic: "Template Literals",
    question: "What does `Score: ${score}` produce if score is 10?",
    options: ["Score: ${score}", "Score: score", "Score: 10", "Error"],
    correctIndex: 2,
    explanation: "Template literals (backticks) let you embed variables directly using ${...}.",
  },
  {
    topic: "Errors",
    question: "What kind of error usually results from calling a function that doesn't exist?",
    options: ["SyntaxError", "TypeError / ReferenceError", "RangeError", "No error is thrown"],
    correctIndex: 1,
    explanation: "Calling something that isn't defined as a function typically throws a TypeError or ReferenceError.",
  },
];

const LEVEL_3_GOLD = [
  {
    topic: "Array Methods",
    question: "What does [1, 2, 3].map(n => n * 2) return?",
    options: ["[1, 2, 3]", "[2, 4, 6]", "6", "undefined"],
    correctIndex: 1,
    explanation: "map() transforms every item and returns a new array of the results.",
  },
  {
    topic: "Array Methods",
    question: "What does [1, 2, 3, 4].filter(n => n % 2 === 0) return?",
    options: ["[1, 3]", "[2, 4]", "[1, 2, 3, 4]", "2"],
    correctIndex: 1,
    explanation: "filter() keeps only the items where the test function returns true — the even numbers.",
  },
  {
    topic: "Destructuring",
    question: 'What does const { name } = { name: "Alex", age: 10 } do?',
    options: ["Creates a new empty object", "Extracts the name property into its own variable", "Deletes the age property", "Throws an error"],
    correctIndex: 1,
    explanation: "Destructuring pulls named properties out of an object into standalone variables.",
  },
  {
    topic: "Default Parameters",
    question: 'function greet(name = "friend") { console.log(name); } — what prints if you call greet()?',
    options: ["undefined", "null", "friend", "Error"],
    correctIndex: 2,
    explanation: "When no argument is passed, the default value \"friend\" is used instead.",
  },
  {
    topic: "Spread Operator",
    question: "What does [...[1, 2], ...[3, 4]] produce?",
    options: ["[[1, 2], [3, 4]]", "[1, 2, 3, 4]", "[1, 2]", "Error"],
    correctIndex: 1,
    explanation: "The spread operator unpacks each array's items into the new array.",
  },
  {
    topic: "Scope",
    question: "Where is a variable declared with let inside an if block accessible?",
    options: ["Everywhere in the file", "Only inside that block", "Only inside functions", "Nowhere"],
    correctIndex: 1,
    explanation: "let is block-scoped — it only exists within the { } it was declared in.",
  },
  {
    topic: "Ternary Operator",
    question: 'What does age >= 18 ? "Adult" : "Minor" evaluate to if age is 15?',
    options: ["Adult", "Minor", "true", "15"],
    correctIndex: 1,
    explanation: "15 is not >= 18, so the ternary picks the second (false) branch: \"Minor\".",
  },
  {
    topic: "Switch Statements",
    question: "What happens if you forget a break in a switch case?",
    options: ["Nothing, it works the same", "Execution falls through into the next case", "The program crashes", "The switch is skipped entirely"],
    correctIndex: 1,
    explanation: "Without break, execution continues running the next case's code too.",
  },
  {
    topic: "Recursion",
    question: "What must every recursive function have to avoid infinite recursion?",
    options: ["A loop", "A base case that stops the recursion", "A return type of number", "A global variable"],
    correctIndex: 1,
    explanation: "A base case gives the recursion a condition to stop calling itself.",
  },
  {
    topic: "Objects",
    question: "What does Object.keys({ a: 1, b: 2 }) return?",
    options: ["[1, 2]", '["a", "b"]', "{ a: 1, b: 2 }", "2"],
    correctIndex: 1,
    explanation: "Object.keys() returns an array of just the object's property names.",
  },
];

const LEVEL_4_PLATINUM = [
  {
    topic: "Closures",
    question: "What is a closure?",
    options: [
      "A function that closes the browser",
      "A function that remembers variables from its outer scope even after that scope has finished",
      "A way to close a file",
      "A type of loop",
    ],
    correctIndex: 1,
    explanation: "Closures let an inner function keep access to its outer function's variables.",
  },
  {
    topic: "Higher-Order Functions",
    question: "What makes a function 'higher-order'?",
    options: ["It runs faster than other functions", "It takes another function as an argument or returns one", "It only works with numbers", "It has more than 5 lines"],
    correctIndex: 1,
    explanation: "map, filter, and reduce are all higher-order functions because they accept callback functions.",
  },
  {
    topic: "Array Methods",
    question: "What does [3, 1, 2].sort() return by default?",
    options: ["[1, 2, 3]", "[3, 2, 1]", "[3, 1, 2]", "It throws an error"],
    correctIndex: 0,
    explanation: "sort() without a comparator sorts elements as strings, which for these single digits gives [1, 2, 3].",
  },
  {
    topic: "Object Methods",
    question: "What does Object.entries({ a: 1 }) return?",
    options: ['["a", 1]', '[["a", 1]]', "{ a: 1 }", "1"],
    correctIndex: 1,
    explanation: "entries() returns an array of [key, value] pairs.",
  },
  {
    topic: "'this' Keyword",
    question: "Inside a regular object method, what does 'this' usually refer to?",
    options: ["The global window object, always", "The object the method was called on", "The function itself", "undefined, always"],
    correctIndex: 1,
    explanation: "In a normal method call, 'this' refers to the object before the dot.",
  },
  {
    topic: "Classes",
    question: "What keyword creates a new instance of a class?",
    options: ["make", "new", "create", "instance"],
    correctIndex: 1,
    explanation: "new calls a class's constructor and returns a fresh instance.",
  },
  {
    topic: "Inheritance",
    question: "What does 'extends' do in a class definition?",
    options: ["Deletes a class", "Makes one class inherit properties/methods from another", "Runs a class twice", "Exports a class to another file"],
    correctIndex: 1,
    explanation: "extends sets up a subclass that inherits from a parent class.",
  },
  {
    topic: "JSON",
    question: "What does JSON.stringify({ a: 1 }) return?",
    options: ["{ a: 1 }", '\'{"a":1}\'', "[a, 1]", "undefined"],
    correctIndex: 1,
    explanation: "JSON.stringify() converts a JS object into its JSON text representation.",
  },
  {
    topic: "Error Handling",
    question: "In a try/catch/finally block, when does the finally block run?",
    options: ["Only if no error occurs", "Only if an error occurs", "Never automatically", "Always, whether or not an error occurred"],
    correctIndex: 3,
    explanation: "finally always runs, making it a good place for cleanup code.",
  },
  {
    topic: "Array Methods",
    question: "What does [1, 2, 3].reduce((sum, n) => sum + n, 0) return?",
    options: ["6", "[1, 2, 3]", "0", "Error"],
    correctIndex: 0,
    explanation: "reduce() accumulates a single value — here it sums 0+1+2+3 = 6.",
  },
];

const LEVEL_5_DIAMOND = [
  {
    topic: "Async JS",
    question: "What does a Promise represent?",
    options: ["A guaranteed error", "A value that may be available now, later, or never", "A type of loop", "A synchronous function"],
    correctIndex: 1,
    explanation: "A Promise represents the eventual result of an asynchronous operation.",
  },
  {
    topic: "Async JS",
    question: "What does the 'await' keyword do inside an async function?",
    options: ["Skips the next line", "Pauses execution until the Promise resolves", "Stops the function forever", "Converts a value to a string"],
    correctIndex: 1,
    explanation: "await pauses the async function until the awaited Promise settles.",
  },
  {
    topic: "Event Loop",
    question: "Which usually runs first: synchronous code, or a Promise's .then() callback?",
    options: ["The .then() callback", "The synchronous code", "They always run at exactly the same time", "Neither runs"],
    correctIndex: 1,
    explanation: "Synchronous code always finishes first; Promise callbacks are queued as microtasks.",
  },
  {
    topic: "Recursion",
    question: "What is the base case of a recursive factorial function?",
    options: ["factorial(0) or factorial(1) returning 1", "There is no base case needed", "factorial(Infinity)", "factorial(-1)"],
    correctIndex: 0,
    explanation: "Factorial recursion stops at 0 or 1, where the answer is defined to be 1.",
  },
  {
    topic: "Big-O",
    question: "What is the time complexity of accessing an array element by index?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"],
    correctIndex: 2,
    explanation: "Array index access is constant time — it doesn't depend on the array's size.",
  },
  {
    topic: "Big-O",
    question: "What is the time complexity of looping through every item in an array of size n?",
    options: ["O(1)", "O(n)", "O(n^2)", "O(log n)"],
    correctIndex: 1,
    explanation: "Visiting every item once scales linearly with the array's size.",
  },
  {
    topic: "Data Structures",
    question: "In a stack data structure, which item is removed first?",
    options: ["The first one added (FIFO)", "The last one added (LIFO)", "A random one", "The smallest one"],
    correctIndex: 1,
    explanation: "Stacks are Last-In-First-Out — like a stack of plates.",
  },
  {
    topic: "Data Structures",
    question: "In a queue data structure, which item is removed first?",
    options: ["The last one added (LIFO)", "The first one added (FIFO)", "A random one", "The largest one"],
    correctIndex: 1,
    explanation: "Queues are First-In-First-Out — like a checkout line.",
  },
  {
    topic: "Hash Maps",
    question: "What is the main advantage of a hash map (like a JS object or Map)?",
    options: ["It keeps items sorted automatically", "Very fast average-case lookup by key, close to O(1)", "It uses the least memory of any structure", "It can only store numbers"],
    correctIndex: 1,
    explanation: "Hash maps trade some memory for extremely fast key-based lookups.",
  },
  {
    topic: "Searching",
    question: "What is required for binary search to work correctly on an array?",
    options: ["The array must be sorted", "The array must contain only numbers", "The array must be empty", "Nothing special is required"],
    correctIndex: 0,
    explanation: "Binary search relies on being able to eliminate half the remaining items each step, which only works on sorted data.",
  },
];

const LEVEL_6_MASTER = [
  {
    topic: "Big-O",
    question: "Which of these growth rates is the SLOWEST (best) as input size increases?",
    options: ["O(n^2)", "O(n log n)", "O(log n)", "O(n)"],
    correctIndex: 2,
    explanation: "O(log n) grows extremely slowly compared to the others as n increases.",
  },
  {
    topic: "Memoization",
    question: "What does memoization do in a recursive function like Fibonacci?",
    options: [
      "Makes the function run in a separate thread",
      "Caches previous results to avoid recomputing the same subproblem",
      "Deletes old results to save memory",
      "Converts recursion into a loop automatically",
    ],
    correctIndex: 1,
    explanation: "Memoization stores results of expensive calls so repeated subproblems are instant lookups.",
  },
  {
    topic: "Dynamic Programming",
    question: "Dynamic programming is most useful for problems with which property?",
    options: ["No repeated subproblems", "Overlapping subproblems and optimal substructure", "Only sorting problems", "Only graph problems"],
    correctIndex: 1,
    explanation: "DP shines when a problem breaks into smaller subproblems that repeat and combine into an optimal answer.",
  },
  {
    topic: "Trees",
    question: "In a binary search tree, where are values smaller than a node typically stored?",
    options: ["In the right subtree", "In the left subtree", "At the root only", "Trees don't order values"],
    correctIndex: 1,
    explanation: "By convention, smaller values go left and larger values go right in a BST.",
  },
  {
    topic: "Graphs",
    question: "What does BFS (Breadth-First Search) explore first?",
    options: ["The deepest node first", "All neighbors at the current depth before going deeper", "A random node", "Only leaf nodes"],
    correctIndex: 1,
    explanation: "BFS spreads outward level by level, unlike DFS which dives deep first.",
  },
  {
    topic: "Performance",
    question: "What problem does 'debouncing' a function solve?",
    options: [
      "Making a function run more often",
      "Preventing a function from firing too many times in rapid succession (like on every keystroke)",
      "Making code run in parallel",
      "Reducing a function's memory usage",
    ],
    correctIndex: 1,
    explanation: "Debouncing delays execution until activity has paused, avoiding excessive calls.",
  },
  {
    topic: "Memory",
    question: "What is the key difference between stack memory and heap memory?",
    options: [
      "They are exactly the same",
      "Stack stores fixed-size, short-lived data like function calls; heap stores dynamically allocated data",
      "Heap is always faster than stack",
      "Stack memory never gets freed",
    ],
    correctIndex: 1,
    explanation: "The call stack handles function execution; the heap handles longer-lived, dynamically-sized data.",
  },
  {
    topic: "Functional Programming",
    question: "What makes a function 'pure'?",
    options: ["It only uses one line of code", "Given the same input, it always returns the same output and has no side effects", "It never returns a value", "It must be recursive"],
    correctIndex: 1,
    explanation: "Pure functions are predictable and don't modify anything outside themselves.",
  },
  {
    topic: "Immutability",
    question: "Why do many modern codebases prefer immutable data (not modifying objects/arrays directly)?",
    options: [
      "It uses less code",
      "It makes changes easier to track and avoids unexpected side effects elsewhere",
      "It's required by all programming languages",
      "It always makes programs run faster with zero exceptions",
    ],
    correctIndex: 1,
    explanation: "Immutability makes it much easier to reason about how and where data changes.",
  },
  {
    topic: "Design Patterns",
    question: "What problem does the Singleton pattern solve?",
    options: ["Creating many instances of a class quickly", "Ensuring a class has only one instance, accessible globally", "Making classes inherit from multiple parents", "Sorting objects automatically"],
    correctIndex: 1,
    explanation: "A Singleton guarantees exactly one shared instance exists throughout the app.",
  },
];

const LEVEL_7_GRANDMASTER = [
  {
    topic: "JS Quirks",
    question: "What does typeof NaN return?",
    options: ['"NaN"', '"undefined"', '"number"', '"object"'],
    correctIndex: 2,
    explanation: "NaN stands for 'Not a Number', but ironically its type IS 'number' in JavaScript.",
  },
  {
    topic: "JS Quirks",
    question: "What does [] + [] evaluate to in JavaScript?",
    options: ["[]", "0", '"" (an empty string)', "Error"],
    correctIndex: 2,
    explanation: "Arrays are converted to strings with +, and two empty strings joined together give an empty string.",
  },
  {
    topic: "Hoisting",
    question: "What happens if you reference a 'var' variable before its declaration line runs?",
    options: [
      "A ReferenceError is thrown immediately",
      "It's undefined instead of an error, because var declarations are hoisted",
      "It automatically equals 0",
      "The program fails to compile",
    ],
    correctIndex: 1,
    explanation: "var declarations (but not their assignments) are hoisted to the top of their scope.",
  },
  {
    topic: "Event Loop",
    question: "Which runs first: a setTimeout(fn, 0) callback, or a Promise.resolve().then(fn) callback?",
    options: ["The setTimeout callback", "The Promise callback", "They always tie exactly", "Neither ever runs"],
    correctIndex: 1,
    explanation: "Promise callbacks are microtasks, which always run before macrotasks like setTimeout, even with a 0ms delay.",
  },
  {
    topic: "Complexity",
    question: "What is the time complexity of a lookup in a well-balanced binary search tree?",
    options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"],
    correctIndex: 2,
    explanation: "A balanced BST halves the search space at each step, giving logarithmic lookup time.",
  },
  {
    topic: "Data Structures",
    question: "What makes a heap especially useful for implementing a priority queue?",
    options: ["It keeps every element fully sorted", "It can quickly retrieve the minimum (or maximum) element, in O(log n) or better", "It uses no memory at all", "It only stores strings"],
    correctIndex: 1,
    explanation: "Heaps are optimized specifically for fast access to the highest/lowest-priority item.",
  },
  {
    topic: "Data Structures",
    question: "What is a Trie especially efficient at?",
    options: ["Sorting numbers", "Prefix-based string searches, like autocomplete", "Storing images", "Random access by index"],
    correctIndex: 1,
    explanation: "Tries organize strings by shared prefixes, making prefix lookups very fast.",
  },
  {
    topic: "System Design",
    question: "What is the main purpose of a cache in a web application?",
    options: ["To permanently store all data", "To store frequently-used data temporarily so future requests are faster", "To slow down repeated requests on purpose", "To replace the database entirely"],
    correctIndex: 1,
    explanation: "Caches trade a bit of freshness for a big speed boost on repeated requests.",
  },
  {
    topic: "System Design",
    question: "What problem does a load balancer solve?",
    options: ["It makes a single server run faster internally", "It distributes incoming traffic across multiple servers to avoid overloading one", "It encrypts data automatically", "It stores backups of a database"],
    correctIndex: 1,
    explanation: "Load balancers spread requests across servers so no single one gets overwhelmed.",
  },
  {
    topic: "Concurrency",
    question: "Why is JavaScript described as 'single-threaded' even though it handles async operations?",
    options: [
      "It can't actually do anything asynchronous",
      "It runs one line of JS at a time, but offloads things like timers or network calls to the runtime, which queue callbacks back onto that one thread",
      "It secretly runs on 2 threads at all times",
      "Async code runs on a separate CPU core simultaneously",
    ],
    correctIndex: 1,
    explanation: "The async work happens outside the JS thread; only the callback handling comes back onto it.",
  },
];

export const RANKED_QUESTION_LEVELS = [
  LEVEL_1_BRONZE,
  LEVEL_2_SILVER,
  LEVEL_3_GOLD,
  LEVEL_4_PLATINUM,
  LEVEL_5_DIAMOND,
  LEVEL_6_MASTER,
  LEVEL_7_GRANDMASTER,
];

export const DIFFICULTY_LABELS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"];

// A blended pool centered on the player's difficulty level (1-7), pulling
// in the tier below and above too — keeps a single tier's 10 questions
// from feeling repetitive and gives Showdown enough rounds to draw from
// without ever needing to reuse a question in one match.
export function getQuestionPool(level) {
  const clamped = Math.max(1, Math.min(RANKED_QUESTION_LEVELS.length, Math.round(level)));
  const indexes = [clamped - 2, clamped - 1, clamped].filter((i) => i >= 0 && i < RANKED_QUESTION_LEVELS.length);
  return indexes.flatMap((i) => RANKED_QUESTION_LEVELS[i]);
}
