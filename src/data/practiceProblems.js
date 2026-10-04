// Practice Problems: a curated reference to classic, well-known algorithm
// problems used across many coding platforms and interview-prep books —
// NOT a copy of any single site's problem text. Every summary below is
// written fresh in our own words, and each problem links OUT to the real
// LeetCode page for the actual, full problem statement/examples/
// constraints, rather than reproducing that copyrighted content here.
//
// The real value this app adds: `requiredWorldIds` cross-references each
// problem to the actual Code Quest worlds (see data/levels.js) that teach
// its prerequisite skills, so a learner who gets stuck has a real, named
// place to go back and review — not just a list of problem names.
//
// Scope note: this covers the realistic ceiling of "well-known, generic,
// cross-platform classic" algorithm problems (the same set that shows up
// across NeetCode 150 / Blind 75 / Grind 75 / countless CS courses) —
// roughly 150 problems. Past that, "LeetCode problems" stop being generic
// industry-standard exercises and become LeetCode's own specific,
// proprietary problem designs, which aren't safe to list at volume here.

export const PRACTICE_TOPICS = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D Dynamic Programming",
  "2-D Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
  "Design",
];

// One general strategy tip per topic — how to RECOGNIZE and APPROACH this
// whole category of problem, not a walkthrough or solution to any single
// one (that would spoil the point of practicing). Written fresh in our
// own words, describing well-known, decades-old algorithmic patterns
// that belong to no one — same spirit as the per-problem summaries above.
export const TOPIC_HINTS = {
  "Arrays & Hashing": "A hash map turns \"have I seen this before?\" into an instant lookup. Reach for one whenever you're checking existence, counting things, or pairing values up.",
  "Two Pointers": "Works great on sorted data or anything you're comparing from both ends inward. Move whichever pointer is furthest from a valid answer, not just the same one every time.",
  "Sliding Window": "For \"best contiguous stretch\" problems: grow the window by moving its right edge, and shrink from the left only once your condition breaks. Avoid restarting from scratch each time.",
  "Stack": "Reach for a stack whenever the most recently seen unmatched thing matters most — matching brackets, undo history, and \"next greater/smaller element\" problems all share this shape.",
  "Binary Search": "Not just for finding a value in a sorted list — it works any time you can turn \"is this candidate answer big enough?\" into a yes/no question that flips exactly once as the candidate grows.",
  "Linked List": "Draw it out on paper first. A fast/slow pointer pair finds cycles and midpoints; a dummy head node quietly avoids a lot of annoying edge cases at the front of the list.",
  "Trees": "Most tree problems are recursion wearing a disguise. Solve it for one node assuming its children already know their own answer, then trust the recursion to handle the rest.",
  "Tries": "Think of it as a tree where every edge is a single character. Reach for one whenever the real question is about shared prefixes, not just whole-word lookups.",
  "Heap / Priority Queue": "Reach for a heap whenever you keep needing \"the biggest/smallest so far\" without ever needing the whole collection fully sorted.",
  "Backtracking": "Build a partial answer one choice at a time, and the moment it can't possibly work out, undo that last choice and try the next option. It's recursion with an undo button.",
  "Graphs": "Decide first: BFS for shortest paths and level-by-level questions, DFS for exploring everything reachable. Either way, track visited nodes or you'll loop forever.",
  "Advanced Graphs": "Once edges have weights, plain BFS stops giving the shortest path — that's the signal to reach for a priority-queue-based approach instead.",
  "1-D Dynamic Programming": "Ask: what's the smallest version of this problem, and how does today's answer build on yesterday's? Write that relationship down in words before writing any code.",
  "2-D Dynamic Programming": "When the answer depends on two changing things at once — two strings' positions, or a grid's row and column — a 2D table usually clicks, filled in one consistent direction.",
  "Greedy": "A greedy choice only works when the locally-best option is always safe long-term. Try to prove that to yourself with an example first, or you'll get a wrong answer that still runs without error.",
  "Intervals": "Sort by start time (sometimes end time) before doing anything else — almost every interval problem gets dramatically simpler once the list is in order.",
  "Math & Geometry": "Walk through a small example by hand before coding. Matrix and geometry bugs are almost always an off-by-one in how rows, columns, or directions are indexed.",
  "Bit Manipulation": "Most bit tricks combine just four ideas: XOR cancels matching pairs, AND checks or clears bits, OR sets them, and shifting is a fast multiply or divide by two.",
  "Design": "Get the underlying data structure choice right first — a hash map for instant lookup, a linked list for instant reordering. The rest of a design problem is usually just wiring those pieces together correctly.",
};

export const PRACTICE_PROBLEMS = [
  // --- Arrays & Hashing ---
  { id: "two-sum", title: "Two Sum", difficulty: "Easy", topic: "Arrays & Hashing", summary: "Given a list of numbers and a target, find the two numbers that add up to it.", leetcodeSlug: "two-sum", requiredWorldIds: [10, 34] },
  { id: "contains-duplicate", title: "Contains Duplicate", difficulty: "Easy", topic: "Arrays & Hashing", summary: "Check whether any value in a list appears more than once.", leetcodeSlug: "contains-duplicate", requiredWorldIds: [10, 34] },
  { id: "valid-anagram", title: "Valid Anagram", difficulty: "Easy", topic: "Arrays & Hashing", summary: "Check whether two words are made of exactly the same letters, just rearranged.", leetcodeSlug: "valid-anagram", requiredWorldIds: [5, 34] },
  { id: "group-anagrams", title: "Group Anagrams", difficulty: "Medium", topic: "Arrays & Hashing", summary: "Given a list of words, group together the ones that are anagrams of each other.", leetcodeSlug: "group-anagrams", requiredWorldIds: [5, 34] },
  { id: "product-of-array-except-self", title: "Product of Array Except Self", difficulty: "Medium", topic: "Arrays & Hashing", summary: "Build a new array where each slot holds the product of every other number except itself — without using division.", leetcodeSlug: "product-of-array-except-self", requiredWorldIds: [10] },
  { id: "maximum-subarray", title: "Maximum Subarray", difficulty: "Medium", topic: "Arrays & Hashing", summary: "Find the contiguous run of numbers in a list that adds up to the largest possible sum.", leetcodeSlug: "maximum-subarray", requiredWorldIds: [10, 36] },
  { id: "top-k-frequent-elements", title: "Top K Frequent Elements", difficulty: "Medium", topic: "Arrays & Hashing", summary: "Find the k values that appear most often in a list.", leetcodeSlug: "top-k-frequent-elements", requiredWorldIds: [10, 34] },
  { id: "encode-and-decode-strings", title: "Encode and Decode Strings", difficulty: "Medium", topic: "Arrays & Hashing", summary: "Design a way to join a list of strings into one string and split it back apart exactly as it was.", leetcodeSlug: "encode-and-decode-strings", requiredWorldIds: [5, 10] },
  { id: "longest-consecutive-sequence", title: "Longest Consecutive Sequence", difficulty: "Medium", topic: "Arrays & Hashing", summary: "Find the length of the longest run of consecutive integers hidden inside an unsorted list.", leetcodeSlug: "longest-consecutive-sequence", requiredWorldIds: [10, 34] },
  { id: "majority-element", title: "Majority Element", difficulty: "Easy", topic: "Arrays & Hashing", summary: "Find the value that appears in more than half of a list.", leetcodeSlug: "majority-element", requiredWorldIds: [10] },
  { id: "rotate-array", title: "Rotate Array", difficulty: "Medium", topic: "Arrays & Hashing", summary: "Shift every element in an array to the right by a given number of steps, wrapping around the end.", leetcodeSlug: "rotate-array", requiredWorldIds: [10] },
  { id: "missing-number", title: "Missing Number", difficulty: "Easy", topic: "Arrays & Hashing", summary: "Given n distinct numbers from 0 to n, find the one that's missing.", leetcodeSlug: "missing-number", requiredWorldIds: [10] },
  { id: "find-all-numbers-disappeared-in-an-array", title: "Find All Numbers Disappeared in an Array", difficulty: "Easy", topic: "Arrays & Hashing", summary: "Given a list of numbers from 1 to n with some missing, find every number that never appears.", leetcodeSlug: "find-all-numbers-disappeared-in-an-array", requiredWorldIds: [10] },
  { id: "intersection-of-two-arrays", title: "Intersection of Two Arrays", difficulty: "Easy", topic: "Arrays & Hashing", summary: "Find every value that appears in both of two given lists.", leetcodeSlug: "intersection-of-two-arrays", requiredWorldIds: [10, 34] },
  { id: "subarray-sum-equals-k", title: "Subarray Sum Equals K", difficulty: "Medium", topic: "Arrays & Hashing", summary: "Count how many contiguous stretches of a list add up to a target sum.", leetcodeSlug: "subarray-sum-equals-k", requiredWorldIds: [10, 34] },

  // --- Two Pointers ---
  { id: "valid-palindrome", title: "Valid Palindrome", difficulty: "Easy", topic: "Two Pointers", summary: "Check whether a string reads the same forwards and backwards, ignoring case and non-letter characters.", leetcodeSlug: "valid-palindrome", requiredWorldIds: [5, 77] },
  { id: "two-sum-ii", title: "Two Sum II (Sorted Input)", difficulty: "Medium", topic: "Two Pointers", summary: "Like Two Sum, but the list is already sorted — can you solve it without a hash map this time?", leetcodeSlug: "two-sum-ii-input-array-is-sorted", requiredWorldIds: [10, 77] },
  { id: "3sum", title: "3Sum", difficulty: "Medium", topic: "Two Pointers", summary: "Find every unique trio of numbers in a list that adds up to zero.", leetcodeSlug: "3sum", requiredWorldIds: [10, 77] },
  { id: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topic: "Two Pointers", summary: "Given a list of daily prices, find the biggest profit possible from one buy followed by one later sell.", leetcodeSlug: "best-time-to-buy-and-sell-stock", requiredWorldIds: [10, 77] },
  { id: "container-with-most-water", title: "Container With Most Water", difficulty: "Medium", topic: "Two Pointers", summary: "Given a set of vertical lines, find the two that trap the most water between them.", leetcodeSlug: "container-with-most-water", requiredWorldIds: [10, 77] },
  { id: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", topic: "Two Pointers", summary: "Given a skyline of bar heights, figure out how much rainwater would get trapped between them.", leetcodeSlug: "trapping-rain-water", requiredWorldIds: [10, 77] },
  { id: "sort-colors", title: "Sort Colors", difficulty: "Medium", topic: "Two Pointers", summary: "Sort a list containing only three distinct values in a single pass, without a general-purpose sort.", leetcodeSlug: "sort-colors", requiredWorldIds: [10, 77] },
  { id: "move-zeroes", title: "Move Zeroes", difficulty: "Easy", topic: "Two Pointers", summary: "Push every zero in a list to the end while keeping the other numbers in their original order.", leetcodeSlug: "move-zeroes", requiredWorldIds: [10, 77] },
  { id: "remove-duplicates-from-sorted-array", title: "Remove Duplicates from Sorted Array", difficulty: "Easy", topic: "Two Pointers", summary: "Remove duplicate values from a sorted array in place, without using extra space.", leetcodeSlug: "remove-duplicates-from-sorted-array", requiredWorldIds: [10, 77] },
  { id: "merge-sorted-array", title: "Merge Sorted Array", difficulty: "Easy", topic: "Two Pointers", summary: "Merge two sorted arrays into one, working directly inside the first array's extra space.", leetcodeSlug: "merge-sorted-array", requiredWorldIds: [10, 77] },

  // --- Sliding Window ---
  { id: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topic: "Sliding Window", summary: "Find the longest stretch of a string where no character repeats.", leetcodeSlug: "longest-substring-without-repeating-characters", requiredWorldIds: [5, 78] },
  { id: "longest-repeating-character-replacement", title: "Longest Repeating Character Replacement", difficulty: "Medium", topic: "Sliding Window", summary: "Find the longest run of a single repeated character you can make by changing at most k other characters.", leetcodeSlug: "longest-repeating-character-replacement", requiredWorldIds: [5, 78] },
  { id: "permutation-in-string", title: "Permutation in String", difficulty: "Medium", topic: "Sliding Window", summary: "Check whether one string contains any rearrangement of another string as a contiguous chunk.", leetcodeSlug: "permutation-in-string", requiredWorldIds: [5, 78] },
  { id: "minimum-window-substring", title: "Minimum Window Substring", difficulty: "Hard", topic: "Sliding Window", summary: "Find the shortest stretch of one string that contains every character of another, including repeats.", leetcodeSlug: "minimum-window-substring", requiredWorldIds: [5, 78] },
  { id: "sliding-window-maximum", title: "Sliding Window Maximum", difficulty: "Hard", topic: "Sliding Window", summary: "Find the maximum value inside every fixed-size window as it slides across a list.", leetcodeSlug: "sliding-window-maximum", requiredWorldIds: [10, 78] },

  // --- Stack ---
  { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", topic: "Stack", summary: "Check whether a string of brackets is properly opened and closed in the right order.", leetcodeSlug: "valid-parentheses", requiredWorldIds: [30] },
  { id: "min-stack", title: "Min Stack", difficulty: "Medium", topic: "Stack", summary: "Design a stack that can report its minimum value at any time, instantly.", leetcodeSlug: "min-stack", requiredWorldIds: [30] },
  { id: "evaluate-reverse-polish-notation", title: "Evaluate Reverse Polish Notation", difficulty: "Medium", topic: "Stack", summary: "Compute the result of a math expression written in postfix (operator-after-operands) notation.", leetcodeSlug: "evaluate-reverse-polish-notation", requiredWorldIds: [30] },
  { id: "generate-parentheses", title: "Generate Parentheses", difficulty: "Medium", topic: "Stack", summary: "Generate every valid way to arrange n pairs of matching parentheses.", leetcodeSlug: "generate-parentheses", requiredWorldIds: [30, 79] },
  { id: "daily-temperatures", title: "Daily Temperatures", difficulty: "Medium", topic: "Stack", summary: "For each day's temperature, find how many days you'd have to wait for a warmer one.", leetcodeSlug: "daily-temperatures", requiredWorldIds: [30] },
  { id: "car-fleet", title: "Car Fleet", difficulty: "Medium", topic: "Stack", summary: "Given cars' positions and speeds heading to the same destination, count how many groups they'll arrive in.", leetcodeSlug: "car-fleet", requiredWorldIds: [30] },
  { id: "largest-rectangle-in-histogram", title: "Largest Rectangle in Histogram", difficulty: "Hard", topic: "Stack", summary: "Find the area of the largest rectangle that fits under a histogram's bars.", leetcodeSlug: "largest-rectangle-in-histogram", requiredWorldIds: [30] },
  { id: "implement-queue-using-stacks", title: "Implement Queue using Stacks", difficulty: "Easy", topic: "Stack", summary: "Build a first-in-first-out queue using only two stacks.", leetcodeSlug: "implement-queue-using-stacks", requiredWorldIds: [30, 31] },
  { id: "implement-stack-using-queues", title: "Implement Stack using Queues", difficulty: "Easy", topic: "Stack", summary: "Build a last-in-first-out stack using only queues.", leetcodeSlug: "implement-stack-using-queues", requiredWorldIds: [30, 31] },
  { id: "asteroid-collision", title: "Asteroid Collision", difficulty: "Medium", topic: "Stack", summary: "Simulate asteroids moving toward each other and colliding, keeping only the ones that survive.", leetcodeSlug: "asteroid-collision", requiredWorldIds: [30] },

  // --- Binary Search ---
  { id: "binary-search", title: "Binary Search", difficulty: "Easy", topic: "Binary Search", summary: "Find a target value in a sorted list as fast as possible by repeatedly cutting the search space in half.", leetcodeSlug: "binary-search", requiredWorldIds: [28] },
  { id: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", difficulty: "Medium", topic: "Binary Search", summary: "Binary search on a sorted list that's been rotated at some unknown point.", leetcodeSlug: "search-in-rotated-sorted-array", requiredWorldIds: [28] },
  { id: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", topic: "Binary Search", summary: "Find the smallest value in a sorted array that's been rotated at some unknown point.", leetcodeSlug: "find-minimum-in-rotated-sorted-array", requiredWorldIds: [28] },
  { id: "search-a-2d-matrix", title: "Search a 2D Matrix", difficulty: "Medium", topic: "Binary Search", summary: "Search for a target value in a matrix where each row and column is sorted.", leetcodeSlug: "search-a-2d-matrix", requiredWorldIds: [28] },
  { id: "koko-eating-bananas", title: "Koko Eating Bananas", difficulty: "Medium", topic: "Binary Search", summary: "Find the slowest eating speed that still finishes every pile of bananas within a time limit.", leetcodeSlug: "koko-eating-bananas", requiredWorldIds: [28] },
  { id: "median-of-two-sorted-arrays", title: "Median of Two Sorted Arrays", difficulty: "Hard", topic: "Binary Search", summary: "Find the median of two sorted arrays combined, faster than merging them first.", leetcodeSlug: "median-of-two-sorted-arrays", requiredWorldIds: [28] },
  { id: "find-peak-element", title: "Find Peak Element", difficulty: "Medium", topic: "Binary Search", summary: "Find any value in a list that's bigger than both of its neighbors.", leetcodeSlug: "find-peak-element", requiredWorldIds: [28] },
  { id: "first-bad-version", title: "First Bad Version", difficulty: "Easy", topic: "Binary Search", summary: "Find the first \"bad\" version in a sequence using as few version checks as possible.", leetcodeSlug: "first-bad-version", requiredWorldIds: [28] },

  // --- Linked List ---
  { id: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Easy", topic: "Linked List", summary: "Reverse the direction of a singly linked list's pointers.", leetcodeSlug: "reverse-linked-list", requiredWorldIds: [32] },
  { id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", difficulty: "Easy", topic: "Linked List", summary: "Combine two already-sorted linked lists into one sorted list.", leetcodeSlug: "merge-two-sorted-lists", requiredWorldIds: [32] },
  { id: "linked-list-cycle", title: "Linked List Cycle", difficulty: "Easy", topic: "Linked List", summary: "Detect whether a linked list loops back on itself instead of ending.", leetcodeSlug: "linked-list-cycle", requiredWorldIds: [32, 77] },
  { id: "reorder-list", title: "Reorder List", difficulty: "Medium", topic: "Linked List", summary: "Reorder a linked list by interleaving it from both ends toward the middle.", leetcodeSlug: "reorder-list", requiredWorldIds: [32] },
  { id: "remove-nth-node-from-end-of-list", title: "Remove Nth Node From End of List", difficulty: "Medium", topic: "Linked List", summary: "Remove the nth node counting from the end of a linked list, in a single pass.", leetcodeSlug: "remove-nth-node-from-end-of-list", requiredWorldIds: [32, 77] },
  { id: "copy-list-with-random-pointer", title: "Copy List with Random Pointer", difficulty: "Medium", topic: "Linked List", summary: "Deep-copy a linked list where each node also has a pointer to any other random node in the list.", leetcodeSlug: "copy-list-with-random-pointer", requiredWorldIds: [32, 34] },
  { id: "add-two-numbers", title: "Add Two Numbers", difficulty: "Medium", topic: "Linked List", summary: "Add two numbers represented as linked lists of digits, one digit per node.", leetcodeSlug: "add-two-numbers", requiredWorldIds: [32] },
  { id: "palindrome-linked-list", title: "Palindrome Linked List", difficulty: "Easy", topic: "Linked List", summary: "Check whether a linked list reads the same forwards and backwards.", leetcodeSlug: "palindrome-linked-list", requiredWorldIds: [32, 77] },
  { id: "merge-k-sorted-lists", title: "Merge K Sorted Lists", difficulty: "Hard", topic: "Linked List", summary: "Merge many sorted linked lists into a single sorted list.", leetcodeSlug: "merge-k-sorted-lists", requiredWorldIds: [32, 33] },
  { id: "reverse-nodes-in-k-group", title: "Reverse Nodes in k-Group", difficulty: "Hard", topic: "Linked List", summary: "Reverse a linked list in chunks of k nodes at a time.", leetcodeSlug: "reverse-nodes-in-k-group", requiredWorldIds: [32] },
  { id: "middle-of-the-linked-list", title: "Middle of the Linked List", difficulty: "Easy", topic: "Linked List", summary: "Find the middle node of a linked list in a single pass.", leetcodeSlug: "middle-of-the-linked-list", requiredWorldIds: [32, 77] },

  // --- Trees ---
  { id: "invert-binary-tree", title: "Invert Binary Tree", difficulty: "Easy", topic: "Trees", summary: "Flip a binary tree into its mirror image.", leetcodeSlug: "invert-binary-tree", requiredWorldIds: [33, 23] },
  { id: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", difficulty: "Easy", topic: "Trees", summary: "Find how many levels deep a binary tree goes.", leetcodeSlug: "maximum-depth-of-binary-tree", requiredWorldIds: [33, 23] },
  { id: "same-tree", title: "Same Tree", difficulty: "Easy", topic: "Trees", summary: "Check whether two binary trees are structurally identical with the same values.", leetcodeSlug: "same-tree", requiredWorldIds: [33, 23] },
  { id: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", difficulty: "Medium", topic: "Trees", summary: "Visit a binary tree level by level, left to right.", leetcodeSlug: "binary-tree-level-order-traversal", requiredWorldIds: [33, 81] },
  { id: "subtree-of-another-tree", title: "Subtree of Another Tree", difficulty: "Easy", topic: "Trees", summary: "Check whether one binary tree appears somewhere inside another as an exact subtree.", leetcodeSlug: "subtree-of-another-tree", requiredWorldIds: [33, 23] },
  { id: "balanced-binary-tree", title: "Balanced Binary Tree", difficulty: "Easy", topic: "Trees", summary: "Check whether a binary tree's left and right subtrees never differ in height by more than one, at every node.", leetcodeSlug: "balanced-binary-tree", requiredWorldIds: [33, 23] },
  { id: "diameter-of-binary-tree", title: "Diameter of Binary Tree", difficulty: "Easy", topic: "Trees", summary: "Find the length of the longest path between any two nodes in a binary tree.", leetcodeSlug: "diameter-of-binary-tree", requiredWorldIds: [33, 23] },
  { id: "lowest-common-ancestor-of-a-binary-search-tree", title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Medium", topic: "Trees", summary: "Find the deepest node that's an ancestor of two given nodes in a binary search tree.", leetcodeSlug: "lowest-common-ancestor-of-a-binary-search-tree", requiredWorldIds: [33, 23] },
  { id: "lowest-common-ancestor-of-a-binary-tree", title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", topic: "Trees", summary: "Find the deepest node that's an ancestor of two given nodes in a general binary tree.", leetcodeSlug: "lowest-common-ancestor-of-a-binary-tree", requiredWorldIds: [33, 23] },
  { id: "binary-tree-right-side-view", title: "Binary Tree Right Side View", difficulty: "Medium", topic: "Trees", summary: "List the values you'd see looking at a binary tree from the right side, top to bottom.", leetcodeSlug: "binary-tree-right-side-view", requiredWorldIds: [33, 81] },
  { id: "count-good-nodes-in-binary-tree", title: "Count Good Nodes in Binary Tree", difficulty: "Medium", topic: "Trees", summary: "Count how many nodes in a binary tree are greater than or equal to every node on the path from the root.", leetcodeSlug: "count-good-nodes-in-binary-tree", requiredWorldIds: [33, 23] },
  { id: "validate-binary-search-tree", title: "Validate Binary Search Tree", difficulty: "Medium", topic: "Trees", summary: "Check whether a binary tree actually satisfies the binary search tree ordering rule everywhere, not just locally.", leetcodeSlug: "validate-binary-search-tree", requiredWorldIds: [33, 23] },
  { id: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", difficulty: "Medium", topic: "Trees", summary: "Find the kth smallest value stored in a binary search tree.", leetcodeSlug: "kth-smallest-element-in-a-bst", requiredWorldIds: [33, 23] },
  { id: "construct-binary-tree-from-preorder-and-inorder-traversal", title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", topic: "Trees", summary: "Rebuild the exact original binary tree from its preorder and inorder traversal lists.", leetcodeSlug: "construct-binary-tree-from-preorder-and-inorder-traversal", requiredWorldIds: [33, 23] },
  { id: "binary-tree-maximum-path-sum", title: "Binary Tree Maximum Path Sum", difficulty: "Hard", topic: "Trees", summary: "Find the path through a binary tree, node to node, with the largest possible sum of values.", leetcodeSlug: "binary-tree-maximum-path-sum", requiredWorldIds: [33, 23] },
  { id: "serialize-and-deserialize-binary-tree", title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", topic: "Trees", summary: "Design a way to turn a binary tree into a string and rebuild the exact same tree from that string.", leetcodeSlug: "serialize-and-deserialize-binary-tree", requiredWorldIds: [33] },
  { id: "symmetric-tree", title: "Symmetric Tree", difficulty: "Easy", topic: "Trees", summary: "Check whether a binary tree is a mirror image of itself.", leetcodeSlug: "symmetric-tree", requiredWorldIds: [33, 23] },
  { id: "path-sum", title: "Path Sum", difficulty: "Easy", topic: "Trees", summary: "Check whether any root-to-leaf path in a binary tree adds up to a target sum.", leetcodeSlug: "path-sum", requiredWorldIds: [33, 23] },
  { id: "flatten-binary-tree-to-linked-list", title: "Flatten Binary Tree to Linked List", difficulty: "Medium", topic: "Trees", summary: "Flatten a binary tree into a single right-leaning linked list, in place.", leetcodeSlug: "flatten-binary-tree-to-linked-list", requiredWorldIds: [33, 32] },
  { id: "convert-sorted-array-to-binary-search-tree", title: "Convert Sorted Array to Binary Search Tree", difficulty: "Easy", topic: "Trees", summary: "Build a height-balanced binary search tree from a sorted array.", leetcodeSlug: "convert-sorted-array-to-binary-search-tree", requiredWorldIds: [33, 23] },

  // --- Tries ---
  { id: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", difficulty: "Medium", topic: "Tries", summary: "Build a tree-like structure for fast word and prefix lookups.", leetcodeSlug: "implement-trie-prefix-tree", requiredWorldIds: [33, 12] },
  { id: "design-add-and-search-words-data-structure", title: "Design Add and Search Words Data Structure", difficulty: "Medium", topic: "Tries", summary: "Build a word dictionary that also supports wildcard searches.", leetcodeSlug: "design-add-and-search-words-data-structure", requiredWorldIds: [33, 12] },
  { id: "word-search-ii", title: "Word Search II", difficulty: "Hard", topic: "Tries", summary: "Given a grid of letters and a list of words, find every word that can be traced out on the grid.", leetcodeSlug: "word-search-ii", requiredWorldIds: [33, 82] },

  // --- Heap / Priority Queue ---
  { id: "kth-largest-element-in-an-array", title: "Kth Largest Element in an Array", difficulty: "Medium", topic: "Heap / Priority Queue", summary: "Find the kth largest value in an unsorted list.", leetcodeSlug: "kth-largest-element-in-an-array", requiredWorldIds: [33, 27] },
  { id: "last-stone-weight", title: "Last Stone Weight", difficulty: "Easy", topic: "Heap / Priority Queue", summary: "Repeatedly smash together the two heaviest stones until at most one is left, and find its weight.", leetcodeSlug: "last-stone-weight", requiredWorldIds: [33, 27] },
  { id: "k-closest-points-to-origin", title: "K Closest Points to Origin", difficulty: "Medium", topic: "Heap / Priority Queue", summary: "Find the k points closest to the origin on a 2D plane.", leetcodeSlug: "k-closest-points-to-origin", requiredWorldIds: [33, 27] },
  { id: "find-median-from-data-stream", title: "Find Median from Data Stream", difficulty: "Hard", topic: "Heap / Priority Queue", summary: "Design a structure that can report the running median of numbers as they stream in one at a time.", leetcodeSlug: "find-median-from-data-stream", requiredWorldIds: [33, 27] },
  { id: "task-scheduler", title: "Task Scheduler", difficulty: "Medium", topic: "Heap / Priority Queue", summary: "Given tasks and a required cooldown between repeats, find the minimum time to finish them all.", leetcodeSlug: "task-scheduler", requiredWorldIds: [33, 27] },

  // --- Backtracking ---
  { id: "subsets", title: "Subsets", difficulty: "Medium", topic: "Backtracking", summary: "List every possible subset of a set of numbers.", leetcodeSlug: "subsets", requiredWorldIds: [79, 23] },
  { id: "combination-sum", title: "Combination Sum", difficulty: "Medium", topic: "Backtracking", summary: "Find every combination of numbers from a list that adds up to a target, reusing numbers if needed.", leetcodeSlug: "combination-sum", requiredWorldIds: [79, 23] },
  { id: "permutations", title: "Permutations", difficulty: "Medium", topic: "Backtracking", summary: "List every possible ordering of a set of numbers.", leetcodeSlug: "permutations", requiredWorldIds: [79, 23] },
  { id: "subsets-ii", title: "Subsets II", difficulty: "Medium", topic: "Backtracking", summary: "List every possible subset of a list that may contain duplicate numbers, without repeating any subset.", leetcodeSlug: "subsets-ii", requiredWorldIds: [79, 23] },
  { id: "combination-sum-ii", title: "Combination Sum II", difficulty: "Medium", topic: "Backtracking", summary: "Find every combination from a list that adds up to a target, using each number at most once.", leetcodeSlug: "combination-sum-ii", requiredWorldIds: [79, 23] },
  { id: "word-search", title: "Word Search", difficulty: "Medium", topic: "Backtracking", summary: "Check whether a word can be traced out through adjacent letters on a grid.", leetcodeSlug: "word-search", requiredWorldIds: [79, 35] },
  { id: "palindrome-partitioning", title: "Palindrome Partitioning", difficulty: "Medium", topic: "Backtracking", summary: "Split a string into every possible way where each piece is itself a palindrome.", leetcodeSlug: "palindrome-partitioning", requiredWorldIds: [79, 5] },
  { id: "letter-combinations-of-a-phone-number", title: "Letter Combinations of a Phone Number", difficulty: "Medium", topic: "Backtracking", summary: "List every possible letter combination a phone-keypad number could represent.", leetcodeSlug: "letter-combinations-of-a-phone-number", requiredWorldIds: [79] },
  { id: "n-queens", title: "N-Queens", difficulty: "Hard", topic: "Backtracking", summary: "Place n queens on an n×n chessboard so that no two attack each other.", leetcodeSlug: "n-queens", requiredWorldIds: [79, 23] },

  // --- Graphs ---
  { id: "number-of-islands", title: "Number of Islands", difficulty: "Medium", topic: "Graphs", summary: "Given a grid of land and water, count how many separate islands there are.", leetcodeSlug: "number-of-islands", requiredWorldIds: [35, 82] },
  { id: "clone-graph", title: "Clone Graph", difficulty: "Medium", topic: "Graphs", summary: "Make a deep copy of a connected graph, matching every node and edge.", leetcodeSlug: "clone-graph", requiredWorldIds: [35, 81, 82] },
  { id: "max-area-of-island", title: "Max Area of Island", difficulty: "Medium", topic: "Graphs", summary: "Find the size of the largest connected island in a grid of land and water.", leetcodeSlug: "max-area-of-island", requiredWorldIds: [35, 82] },
  { id: "pacific-atlantic-water-flow", title: "Pacific Atlantic Water Flow", difficulty: "Medium", topic: "Graphs", summary: "Find every cell in a grid from which water can flow downhill to both of two opposite ocean edges.", leetcodeSlug: "pacific-atlantic-water-flow", requiredWorldIds: [35, 82] },
  { id: "surrounded-regions", title: "Surrounded Regions", difficulty: "Medium", topic: "Graphs", summary: "Flip every region of a grid that's fully surrounded on all sides, leaving edge-connected regions alone.", leetcodeSlug: "surrounded-regions", requiredWorldIds: [35, 82] },
  { id: "rotting-oranges", title: "Rotting Oranges", difficulty: "Medium", topic: "Graphs", summary: "Simulate rot spreading between adjacent oranges each minute, and find how long until none are left fresh.", leetcodeSlug: "rotting-oranges", requiredWorldIds: [35, 81] },
  { id: "course-schedule", title: "Course Schedule", difficulty: "Medium", topic: "Graphs", summary: "Given course prerequisites, determine whether it's actually possible to finish every course.", leetcodeSlug: "course-schedule", requiredWorldIds: [35, 82] },
  { id: "course-schedule-ii", title: "Course Schedule II", difficulty: "Medium", topic: "Graphs", summary: "Given course prerequisites, find a valid order to take every course, if one exists.", leetcodeSlug: "course-schedule-ii", requiredWorldIds: [35, 82] },
  { id: "redundant-connection", title: "Redundant Connection", difficulty: "Medium", topic: "Graphs", summary: "Given a graph that became a cycle by adding one extra edge, find that edge.", leetcodeSlug: "redundant-connection", requiredWorldIds: [35] },
  { id: "number-of-connected-components-in-an-undirected-graph", title: "Number of Connected Components in an Undirected Graph", difficulty: "Medium", topic: "Graphs", summary: "Count how many separate connected groups exist in a graph.", leetcodeSlug: "number-of-connected-components-in-an-undirected-graph", requiredWorldIds: [35, 82] },
  { id: "graph-valid-tree", title: "Graph Valid Tree", difficulty: "Medium", topic: "Graphs", summary: "Check whether a given set of edges forms a valid tree.", leetcodeSlug: "graph-valid-tree", requiredWorldIds: [35, 82] },
  { id: "word-ladder", title: "Word Ladder", difficulty: "Hard", topic: "Graphs", summary: "Find the shortest chain of single-letter-changing steps that transforms one word into another, through only real words.", leetcodeSlug: "word-ladder", requiredWorldIds: [35, 81] },

  // --- Advanced Graphs ---
  { id: "min-cost-to-connect-all-points", title: "Min Cost to Connect All Points", difficulty: "Medium", topic: "Advanced Graphs", summary: "Find the cheapest way to connect a set of points so every point is reachable from every other.", leetcodeSlug: "min-cost-to-connect-all-points", requiredWorldIds: [35, 80] },
  { id: "network-delay-time", title: "Network Delay Time", difficulty: "Medium", topic: "Advanced Graphs", summary: "Find how long it takes for a signal to reach every node in a weighted network from a starting node.", leetcodeSlug: "network-delay-time", requiredWorldIds: [35, 81] },
  { id: "alien-dictionary", title: "Alien Dictionary", difficulty: "Hard", topic: "Advanced Graphs", summary: "Given a list of words sorted by an unknown alien alphabet's rules, work out the order of that alphabet.", leetcodeSlug: "alien-dictionary", requiredWorldIds: [35, 82] },

  // --- 1-D Dynamic Programming ---
  { id: "climbing-stairs", title: "Climbing Stairs", difficulty: "Easy", topic: "1-D Dynamic Programming", summary: "Count how many distinct ways you can climb a staircase, taking 1 or 2 steps at a time.", leetcodeSlug: "climbing-stairs", requiredWorldIds: [36, 23] },
  { id: "coin-change", title: "Coin Change", difficulty: "Medium", topic: "1-D Dynamic Programming", summary: "Find the fewest coins needed to make a given amount from a set of coin values.", leetcodeSlug: "coin-change", requiredWorldIds: [36] },
  { id: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", difficulty: "Medium", topic: "1-D Dynamic Programming", summary: "Find the length of the longest run of numbers in a list that keeps increasing, even if they're not next to each other.", leetcodeSlug: "longest-increasing-subsequence", requiredWorldIds: [36] },
  { id: "house-robber", title: "House Robber", difficulty: "Medium", topic: "1-D Dynamic Programming", summary: "Find the most money you can rob from a row of houses without robbing two houses next to each other.", leetcodeSlug: "house-robber", requiredWorldIds: [36, 23] },
  { id: "house-robber-ii", title: "House Robber II", difficulty: "Medium", topic: "1-D Dynamic Programming", summary: "Solve House Robber again, but the houses are arranged in a circle.", leetcodeSlug: "house-robber-ii", requiredWorldIds: [36, 23] },
  { id: "word-break", title: "Word Break", difficulty: "Medium", topic: "1-D Dynamic Programming", summary: "Check whether a string can be split into a sequence of words from a given dictionary.", leetcodeSlug: "word-break", requiredWorldIds: [36, 5] },
  { id: "combination-sum-iv", title: "Combination Sum IV", difficulty: "Medium", topic: "1-D Dynamic Programming", summary: "Count how many ordered combinations from a list add up to a target, reusing numbers freely.", leetcodeSlug: "combination-sum-iv", requiredWorldIds: [36] },
  { id: "decode-ways", title: "Decode Ways", difficulty: "Medium", topic: "1-D Dynamic Programming", summary: "Count how many ways a string of digits could be decoded back into letters, A-Z.", leetcodeSlug: "decode-ways", requiredWorldIds: [36, 5] },
  { id: "maximum-product-subarray", title: "Maximum Product Subarray", difficulty: "Medium", topic: "1-D Dynamic Programming", summary: "Find the contiguous run of numbers in a list with the largest possible product.", leetcodeSlug: "maximum-product-subarray", requiredWorldIds: [36, 10] },
  { id: "partition-equal-subset-sum", title: "Partition Equal Subset Sum", difficulty: "Medium", topic: "1-D Dynamic Programming", summary: "Check whether a list of numbers can be split into two groups with equal sums.", leetcodeSlug: "partition-equal-subset-sum", requiredWorldIds: [36, 10] },

  // --- 2-D Dynamic Programming ---
  { id: "unique-paths", title: "Unique Paths", difficulty: "Medium", topic: "2-D Dynamic Programming", summary: "Count how many distinct paths there are from one corner of a grid to the other, moving only right or down.", leetcodeSlug: "unique-paths", requiredWorldIds: [36, 10] },
  { id: "longest-common-subsequence", title: "Longest Common Subsequence", difficulty: "Medium", topic: "2-D Dynamic Programming", summary: "Find the length of the longest sequence of characters, not necessarily adjacent, that two strings share in order.", leetcodeSlug: "longest-common-subsequence", requiredWorldIds: [36, 5] },
  { id: "best-time-to-buy-and-sell-stock-with-cooldown", title: "Best Time to Buy and Sell Stock with Cooldown", difficulty: "Medium", topic: "2-D Dynamic Programming", summary: "Maximize stock trading profit when every sell must be followed by a one-day cooldown before buying again.", leetcodeSlug: "best-time-to-buy-and-sell-stock-with-cooldown", requiredWorldIds: [36, 77] },
  { id: "coin-change-ii", title: "Coin Change II", difficulty: "Medium", topic: "2-D Dynamic Programming", summary: "Count how many different combinations of coins add up to a target amount.", leetcodeSlug: "coin-change-ii", requiredWorldIds: [36] },
  { id: "target-sum", title: "Target Sum", difficulty: "Medium", topic: "2-D Dynamic Programming", summary: "Count how many ways you can place + and − signs in front of a list of numbers to reach a target total.", leetcodeSlug: "target-sum", requiredWorldIds: [36, 79] },
  { id: "longest-increasing-path-in-a-matrix", title: "Longest Increasing Path in a Matrix", difficulty: "Hard", topic: "2-D Dynamic Programming", summary: "Find the longest path of strictly increasing values you can trace through a grid, moving in any direction.", leetcodeSlug: "longest-increasing-path-in-a-matrix", requiredWorldIds: [36, 82] },
  { id: "edit-distance", title: "Edit Distance", difficulty: "Hard", topic: "2-D Dynamic Programming", summary: "Find the fewest single-character edits needed to turn one word into another.", leetcodeSlug: "edit-distance", requiredWorldIds: [36, 5] },
  { id: "regular-expression-matching", title: "Regular Expression Matching", difficulty: "Hard", topic: "2-D Dynamic Programming", summary: "Check whether a string fully matches a simplified pattern that supports '.' and '*' wildcards.", leetcodeSlug: "regular-expression-matching", requiredWorldIds: [36, 37] },

  // --- Greedy ---
  { id: "jump-game", title: "Jump Game", difficulty: "Medium", topic: "Greedy", summary: "Given how far you can jump from each position, figure out if you can reach the very last one.", leetcodeSlug: "jump-game", requiredWorldIds: [80, 10] },
  { id: "jump-game-ii", title: "Jump Game II", difficulty: "Medium", topic: "Greedy", summary: "Find the minimum number of jumps needed to reach the end of a list, given how far you can jump from each position.", leetcodeSlug: "jump-game-ii", requiredWorldIds: [80, 10] },
  { id: "gas-station", title: "Gas Station", difficulty: "Medium", topic: "Greedy", summary: "Given gas amounts and travel costs around a circular route, find the starting station that lets you complete the whole loop.", leetcodeSlug: "gas-station", requiredWorldIds: [80, 10] },
  { id: "partition-labels", title: "Partition Labels", difficulty: "Medium", topic: "Greedy", summary: "Split a string into as many pieces as possible so that each letter appears in only one piece.", leetcodeSlug: "partition-labels", requiredWorldIds: [80, 5] },
  { id: "valid-parenthesis-string", title: "Valid Parenthesis String", difficulty: "Medium", topic: "Greedy", summary: "Check whether a string of parentheses, with wildcard characters that can be either bracket or nothing, can be made valid.", leetcodeSlug: "valid-parenthesis-string", requiredWorldIds: [80, 30] },

  // --- Intervals ---
  { id: "insert-interval", title: "Insert Interval", difficulty: "Medium", topic: "Intervals", summary: "Insert a new interval into a sorted list of non-overlapping intervals, merging where needed.", leetcodeSlug: "insert-interval", requiredWorldIds: [27, 10] },
  { id: "merge-intervals", title: "Merge Intervals", difficulty: "Medium", topic: "Intervals", summary: "Merge every pair of overlapping intervals in a list into one.", leetcodeSlug: "merge-intervals", requiredWorldIds: [27, 10] },
  { id: "non-overlapping-intervals", title: "Non-overlapping Intervals", difficulty: "Medium", topic: "Intervals", summary: "Find the minimum number of intervals to remove so none of the rest overlap.", leetcodeSlug: "non-overlapping-intervals", requiredWorldIds: [27, 80] },
  { id: "meeting-rooms", title: "Meeting Rooms", difficulty: "Easy", topic: "Intervals", summary: "Given a list of meeting times, check whether one person could attend every single one.", leetcodeSlug: "meeting-rooms", requiredWorldIds: [27, 10] },
  { id: "meeting-rooms-ii", title: "Meeting Rooms II", difficulty: "Medium", topic: "Intervals", summary: "Given a list of meeting times, find the minimum number of rooms needed so nothing overlaps.", leetcodeSlug: "meeting-rooms-ii", requiredWorldIds: [27, 33] },

  // --- Math & Geometry ---
  { id: "rotate-image", title: "Rotate Image", difficulty: "Medium", topic: "Math & Geometry", summary: "Rotate a square grid of numbers 90 degrees, in place.", leetcodeSlug: "rotate-image", requiredWorldIds: [10, 4] },
  { id: "spiral-matrix", title: "Spiral Matrix", difficulty: "Medium", topic: "Math & Geometry", summary: "Read out every value in a grid in spiral order, from the outside in.", leetcodeSlug: "spiral-matrix", requiredWorldIds: [10] },
  { id: "set-matrix-zeroes", title: "Set Matrix Zeroes", difficulty: "Medium", topic: "Math & Geometry", summary: "If any cell in a grid is zero, zero out its entire row and column, in place.", leetcodeSlug: "set-matrix-zeroes", requiredWorldIds: [10] },
  { id: "happy-number", title: "Happy Number", difficulty: "Easy", topic: "Math & Geometry", summary: "Check whether repeatedly replacing a number with the sum of the squares of its digits eventually reaches 1.", leetcodeSlug: "happy-number", requiredWorldIds: [4] },
  { id: "plus-one", title: "Plus One", difficulty: "Easy", topic: "Math & Geometry", summary: "Add one to a large number represented as an array of its digits.", leetcodeSlug: "plus-one", requiredWorldIds: [10, 4] },
  { id: "powx-n", title: "Pow(x, n)", difficulty: "Medium", topic: "Math & Geometry", summary: "Compute x raised to the power n efficiently, faster than multiplying n times.", leetcodeSlug: "powx-n", requiredWorldIds: [4, 23] },
  { id: "multiply-strings", title: "Multiply Strings", difficulty: "Medium", topic: "Math & Geometry", summary: "Multiply two numbers given as strings, without converting them to a built-in number type.", leetcodeSlug: "multiply-strings", requiredWorldIds: [4, 5] },

  // --- Bit Manipulation ---
  { id: "single-number", title: "Single Number", difficulty: "Easy", topic: "Bit Manipulation", summary: "Find the one number in a list that doesn't have a duplicate, where every other number appears exactly twice.", leetcodeSlug: "single-number", requiredWorldIds: [76] },
  { id: "number-of-1-bits", title: "Number of 1 Bits", difficulty: "Easy", topic: "Bit Manipulation", summary: "Count how many 1s are in a number's binary representation.", leetcodeSlug: "number-of-1-bits", requiredWorldIds: [76] },
  { id: "counting-bits", title: "Counting Bits", difficulty: "Easy", topic: "Bit Manipulation", summary: "For every number from 0 to n, count how many 1s are in its binary representation.", leetcodeSlug: "counting-bits", requiredWorldIds: [76] },
  { id: "reverse-bits", title: "Reverse Bits", difficulty: "Easy", topic: "Bit Manipulation", summary: "Reverse the bits of a 32-bit unsigned integer.", leetcodeSlug: "reverse-bits", requiredWorldIds: [76] },
  { id: "sum-of-two-integers", title: "Sum of Two Integers", difficulty: "Medium", topic: "Bit Manipulation", summary: "Add two integers without using the + or − operators.", leetcodeSlug: "sum-of-two-integers", requiredWorldIds: [76] },

  // --- Design ---
  { id: "lru-cache", title: "LRU Cache", difficulty: "Medium", topic: "Design", summary: "Design a fixed-size cache that evicts the least-recently-used item when it's full.", leetcodeSlug: "lru-cache", requiredWorldIds: [32, 34, 20] },
  { id: "insert-delete-getrandom-o1", title: "Insert Delete GetRandom O(1)", difficulty: "Medium", topic: "Design", summary: "Design a data structure that supports insert, delete, and returning a random element, all in constant time.", leetcodeSlug: "insert-delete-getrandom-o1", requiredWorldIds: [10, 34, 20] },
];

export function leetcodeUrl(slug) {
  return `https://leetcode.com/problems/${slug}/`;
}
