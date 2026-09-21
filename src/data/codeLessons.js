// Hand-written C, C++ and Java versions of the runnable code lessons in
// worlds 1-12 (the JavaScript lessons live in levels.js, Python overrides sit
// beside them). Each entry is a complete program with the learner's part
// wrapped in «…». The starter code is the program with those parts blanked,
// the hint is what was inside them, and the same program (markers removed)
// is what gets checked against the expected output. Any field can be
// overridden per language when the JavaScript lesson doesn't translate
// directly: `i` (instructions), `out` (expected output), `starter`.
//
// Lives in its own chunk: only loaded once a learner picks one of these.

const r = String.raw;

const indent = (s, n) =>
  s
    .split("\n")
    .map((l) => (l ? " ".repeat(n) + l : l))
    .join("\n");

const C = ({ inc = "", top = "", main }) =>
  `#include <stdio.h>\n${inc}${top ? `\n${top}\n` : ""}\nint main(void) {\n${indent(main, 4)}\n    return 0;\n}\n`;

const CPP = ({ inc = "", top = "", main }) =>
  `#include <iostream>\n${inc}using namespace std;\n${top ? `\n${top}\n` : ""}\nint main() {\n${indent(main, 4)}\n    return 0;\n}\n`;

const JAVA = ({ imp = "", pre = "", top = "", main }) =>
  `${imp}${imp ? "\n" : ""}${pre ? `${pre}\n\n` : ""}class Main {\n${top ? `${indent(top, 4)}\n\n` : ""}    public static void main(String[] args) {\n${indent(main, 8)}\n    }\n}\n`;

// L(tutorial, example, code, overrides)
const L = (t, ex, code, extra = {}) => ({ t, ex, code, ...extra });

export const COMPILED_LESSONS = {
  // ───────── World 1: Say Hello ─────────
  "1-1": {
    c: L(
      "printf() prints a message to the screen. Put your message in quotes inside the parentheses. The \\n at the end moves to a new line.",
      r`printf("Hi there!\n");
// prints: Hi there!`,
      C({ main: r`// Use printf to print a message.
«printf("Hello, World!\n");»` }),
      { i: "Every programmer's first program prints a greeting. Use printf() to print exactly: Hello, World!" },
    ),
    cpp: L(
      "cout sends a message to the screen. Use << to feed it your message in quotes, and endl to finish the line.",
      r`cout << "Hi there!" << endl;
// prints: Hi there!`,
      CPP({ main: r`// Use cout to print a message.
«cout << "Hello, World!" << endl;»` }),
      { i: "Every programmer's first program prints a greeting. Use cout to print exactly: Hello, World!" },
    ),
    java: L(
      "System.out.println() prints a message to the screen and moves to the next line. Put your message in quotes inside the parentheses.",
      r`System.out.println("Hi there!");
// prints: Hi there!`,
      JAVA({ main: r`// Use System.out.println to print a message.
«System.out.println("Hello, World!");»` }),
      { i: "Every programmer's first program prints a greeting. Use System.out.println() to print exactly: Hello, World!" },
    ),
  },
  "1-2": {
    c: L(
      "Numbers don't need quotes. To print one with printf, put %d in the message where the number goes, then give the number after a comma.",
      r`printf("%d\n", 7);
// prints: 7`,
      C({ main: r`// Print the number 2024
«printf("%d\n", 2024);»` }),
    ),
    cpp: L(
      "Numbers don't need quotes — only text does. Just feed the number to cout with <<.",
      r`cout << 7 << endl;
// prints: 7`,
      CPP({ main: r`// Print the number 2024
«cout << 2024 << endl;»` }),
    ),
    java: L(
      "Numbers don't need quotes — only text does. Just put the number inside System.out.println().",
      r`System.out.println(7);
// prints: 7`,
      JAVA({ main: r`// Print the number 2024
«System.out.println(2024);»` }),
    ),
  },
  "1-3": {
    c: L(
      "Each printf() call with a \\n at the end prints on its own line. Call it more than once to print several lines.",
      r`printf("First\n");
printf("Second\n");`,
      C({ main: r`// Print Ready, then Set, on separate lines
«printf("Ready\n");
printf("Set\n");»` }),
    ),
    cpp: L(
      "Each cout ending in endl prints on its own line. Use it more than once to print several lines.",
      r`cout << "First" << endl;
cout << "Second" << endl;`,
      CPP({ main: r`// Print Ready, then Set, on separate lines
«cout << "Ready" << endl;
cout << "Set" << endl;»` }),
    ),
    java: L(
      "Each System.out.println() prints on its own new line. Call it more than once to print several lines.",
      r`System.out.println("First");
System.out.println("Second");`,
      JAVA({ main: r`// Print Ready, then Set, on separate lines
«System.out.println("Ready");
System.out.println("Set");»` }),
    ),
  },
  "1-4": {
    c: L(
      "printf can mix text and numbers: %s is a slot for text and %d is a slot for a whole number. Fill the slots in order after the message.",
      r`printf("%s %d\n", "Score:", 10);
// prints: Score: 10`,
      C({ main: r`// Print: Level 1
«printf("%s %d\n", "Level", 1);»` }),
      { i: 'Print exactly: Level 1 (fill a %s slot with "Level" and a %d slot with 1).' },
    ),
    cpp: L(
      "You can chain several things into cout with <<, one after another — text, spaces and numbers all mix freely.",
      r`cout << "Score:" << " " << 10 << endl;
// prints: Score: 10`,
      CPP({ main: r`// Print: Level 1
«cout << "Level" << " " << 1 << endl;»` }),
      { i: 'Print exactly: Level 1 (chain "Level", a space, and the number 1 with <<).' },
    ),
    java: L(
      "The + sign can join text and numbers together into one message before printing it.",
      r`System.out.println("Score:" + " " + 10);
// prints: Score: 10`,
      JAVA({ main: r`// Print: Level 1
«System.out.println("Level" + " " + 1);»` }),
      { i: 'Print exactly: Level 1 (join "Level", a space, and the number 1 with +).' },
    ),
  },
  "1-5": {
    c: L(
      "Let's combine what you've learned: use printf() several times to build a bigger message out of several lines.",
      r`printf("===\n");
printf("HI\n");
printf("===\n");`,
      C({ main: r`// Print the three lines
«printf("*****\n");
printf("HELLO\n");
printf("*****\n");»` }),
    ),
    cpp: L(
      "Let's combine what you've learned: use cout several times to build a bigger message out of several lines.",
      r`cout << "===" << endl;
cout << "HI" << endl;
cout << "===" << endl;`,
      CPP({ main: r`// Print the three lines
«cout << "*****" << endl;
cout << "HELLO" << endl;
cout << "*****" << endl;»` }),
    ),
    java: L(
      "Let's combine what you've learned: use System.out.println() several times to build a bigger message out of several lines.",
      r`System.out.println("===");
System.out.println("HI");
System.out.println("===");`,
      JAVA({ main: r`// Print the three lines
«System.out.println("*****");
System.out.println("HELLO");
System.out.println("*****");»` }),
    ),
  },

  // ───────── World 2: Comments ─────────
  "2-3": {
    c: L(
      "To turn a comment back into real code, just remove the // in front of it.",
      r`// printf("Ready!\n");
// remove // to make this run`,
      C({ main: r`«printf("Ready!\n");»` }),
      { starter: C({ main: r`// printf("Ready!\n");` }) },
    ),
    cpp: L(
      "To turn a comment back into real code, just remove the // in front of it.",
      r`// cout << "Ready!" << endl;
// remove // to make this run`,
      CPP({ main: r`«cout << "Ready!" << endl;»` }),
      { starter: CPP({ main: r`// cout << "Ready!" << endl;` }) },
    ),
    java: L(
      "To turn a comment back into real code, just remove the // in front of it.",
      r`// System.out.println("Ready!");
// remove // to make this run`,
      JAVA({ main: r`«System.out.println("Ready!");»` }),
      { starter: JAVA({ main: r`// System.out.println("Ready!");` }) },
    ),
  },

  // ───────── World 3: Variables ─────────
  "3-1": {
    c: L(
      "A variable is a labeled box that stores a value. In C you also say what kind of value it holds: int means a whole number. Write the type, the name, then = and the value.",
      r`int age = 7;
printf("%d\n", age);
// prints: 7`,
      C({ main: r`// Declare an int called score set to 10,
// then print it with printf.
«int score = 10;
printf("%d\n", score);»` }),
    ),
    cpp: L(
      "A variable is a labeled box that stores a value. In C++ you also say what kind of value it holds: int means a whole number. Write the type, the name, then = and the value.",
      r`int age = 7;
cout << age << endl;
// prints: 7`,
      CPP({ main: r`// Declare an int called score set to 10,
// then print it with cout.
«int score = 10;
cout << score << endl;»` }),
    ),
    java: L(
      "A variable is a labeled box that stores a value. In Java you also say what kind of value it holds: int means a whole number. Write the type, the name, then = and the value.",
      r`int age = 7;
System.out.println(age);
// prints: 7`,
      JAVA({ main: r`// Declare an int called score set to 10,
// then print it.
«int score = 10;
System.out.println(score);»` }),
    ),
  },
  "3-2": {
    c: L(
      "Variables can hold text too. In C, text is stored as char name[] = \"...\" and printed with the %s slot.",
      r`char name[] = "Ada";
printf("%s\n", name);
// prints: Ada`,
      C({ main: r`// Declare petName and print it
«char petName[] = "Rex";
printf("%s\n", petName);»` }),
    ),
    cpp: L(
      "Variables can hold text too. In C++ the type for text is string (and you write it in quotes).",
      r`string name = "Ada";
cout << name << endl;
// prints: Ada`,
      CPP({ inc: "#include <string>\n", main: r`// Declare petName and print it
«string petName = "Rex";
cout << petName << endl;»` }),
    ),
    java: L(
      "Variables can hold text too. In Java the type for text is String (with a capital S), and you write the text in quotes.",
      r`String name = "Ada";
System.out.println(name);
// prints: Ada`,
      JAVA({ main: r`// Declare petName and print it
«String petName = "Rex";
System.out.println(petName);»` }),
    ),
  },
  "3-3": {
    c: L(
      "A variable can be given a new value later, just by using = again — don't write the type a second time.",
      r`int x = 1;
x = 2;
printf("%d\n", x); // 2`,
      C({ main: r`int points = 5;

// Change points to 10, then print it
«points = 10;
printf("%d\n", points);»` }),
    ),
    cpp: L(
      "A variable can be given a new value later, just by using = again — don't write the type a second time.",
      r`int x = 1;
x = 2;
cout << x << endl; // 2`,
      CPP({ main: r`int points = 5;

// Change points to 10, then print it
«points = 10;
cout << points << endl;»` }),
    ),
    java: L(
      "A variable can be given a new value later, just by using = again — don't write the type a second time.",
      r`int x = 1;
x = 2;
System.out.println(x); // 2`,
      JAVA({ main: r`int points = 5;

// Change points to 10, then print it
«points = 10;
System.out.println(points);»` }),
    ),
  },
  "3-4": {
    c: L(
      "You can use variables together in expressions, like adding two number variables with +.",
      r`int a = 2;
int b = 3;
printf("%d\n", a + b); // 5`,
      C({ main: r`int apples = 3;
int oranges = 4;

// Print the total
«printf("%d\n", apples + oranges);»` }),
    ),
    cpp: L(
      "You can use variables together in expressions, like adding two number variables with +.",
      r`int a = 2;
int b = 3;
cout << a + b << endl; // 5`,
      CPP({ main: r`int apples = 3;
int oranges = 4;

// Print the total
«cout << apples + oranges << endl;»` }),
    ),
    java: L(
      "You can use variables together in expressions, like adding two number variables with +.",
      r`int a = 2;
int b = 3;
System.out.println(a + b); // 5`,
      JAVA({ main: r`int apples = 3;
int oranges = 4;

// Print the total
«System.out.println(apples + oranges);»` }),
    ),
  },
  "3-6": {
    c: L(
      "Let's combine everything: declare a few variables and drop them into a sentence using printf slots (%s for text, %d for whole numbers).",
      r`char word[] = "cat";
printf("%s!\n", word); // cat!`,
      C({ main: r`// Declare name and age, then print the sentence
char name[] = "Milo";
int age = 8;

«printf("%s is %d years old\n", name, age);»` }),
    ),
    cpp: L(
      "Let's combine everything: declare a few variables and chain them into a sentence with <<.",
      r`string word = "cat";
cout << word << "!" << endl; // cat!`,
      CPP({ inc: "#include <string>\n", main: r`// Declare name and age, then print the sentence
string name = "Milo";
int age = 8;

«cout << name << " is " << age << " years old" << endl;»` }),
    ),
    java: L(
      "Let's combine everything: declare a few variables and join them into a sentence with +.",
      r`String word = "cat";
System.out.println(word + "!"); // cat!`,
      JAVA({ main: r`// Declare name and age, then print the sentence
String name = "Milo";
int age = 8;

«System.out.println(name + " is " + age + " years old");»` }),
    ),
  },

  // ───────── World 4: Numbers & Math ─────────
  "4-1": {
    c: L(
      "C does math with +, -, *, and /. Put the calculation right in the printf, and use %d to print a whole-number result.",
      r`printf("%d\n", 3 + 4);
// prints: 7`,
      C({ main: r`// Print 12 - 5
«printf("%d\n", 12 - 5);»` }),
    ),
    cpp: L(
      "C++ does math with +, -, *, and / right inside a cout.",
      r`cout << 3 + 4 << endl;
// prints: 7`,
      CPP({ main: r`// Print 12 - 5
«cout << 12 - 5 << endl;»` }),
    ),
    java: L(
      "Java does math with +, -, *, and / right inside System.out.println().",
      r`System.out.println(3 + 4);
// prints: 7`,
      JAVA({ main: r`// Print 12 - 5
«System.out.println(12 - 5);»` }),
    ),
  },
  "4-2": {
    c: L(
      "Use * for multiplication and / for division. (Dividing two whole numbers gives a whole number.)",
      r`printf("%d\n", 6 * 2);
// prints: 12`,
      C({ main: r`// Print 6 * 7
«printf("%d\n", 6 * 7);»` }),
    ),
    cpp: L(
      "Use * for multiplication and / for division. (Dividing two whole numbers gives a whole number.)",
      r`cout << 6 * 2 << endl;
// prints: 12`,
      CPP({ main: r`// Print 6 * 7
«cout << 6 * 7 << endl;»` }),
    ),
    java: L(
      "Use * for multiplication and / for division. (Dividing two whole numbers gives a whole number.)",
      r`System.out.println(6 * 2);
// prints: 12`,
      JAVA({ main: r`// Print 6 * 7
«System.out.println(6 * 7);»` }),
    ),
  },
  "4-3": {
    c: L(
      "Multiplication happens before addition, unless you use parentheses to change the order — just like in math class.",
      r`printf("%d\n", 2 + 3 * 4);
// prints: 14 (not 20)`,
      C({ main: r`// Print (2 + 3) * 4
«printf("%d\n", (2 + 3) * 4);»` }),
    ),
    cpp: L(
      "Multiplication happens before addition, unless you use parentheses to change the order — just like in math class.",
      r`cout << 2 + 3 * 4 << endl;
// prints: 14 (not 20)`,
      CPP({ main: r`// Print (2 + 3) * 4
«cout << (2 + 3) * 4 << endl;»` }),
    ),
    java: L(
      "Multiplication happens before addition, unless you use parentheses to change the order — just like in math class.",
      r`System.out.println(2 + 3 * 4);
// prints: 14 (not 20)`,
      JAVA({ main: r`// Print (2 + 3) * 4
«System.out.println((2 + 3) * 4);»` }),
    ),
  },
  "4-4": {
    c: L(
      "% gives you the remainder left over after dividing. (Inside printf's arguments it works as normal math.)",
      r`printf("%d\n", 7 % 2);
// prints: 1 (7 divided by 2 leaves 1 left over)`,
      C({ main: r`// Print 10 % 3
«printf("%d\n", 10 % 3);»` }),
    ),
    cpp: L(
      "% gives you the remainder left over after dividing.",
      r`cout << 7 % 2 << endl;
// prints: 1 (7 divided by 2 leaves 1 left over)`,
      CPP({ main: r`// Print 10 % 3
«cout << 10 % 3 << endl;»` }),
    ),
    java: L(
      "% gives you the remainder left over after dividing.",
      r`System.out.println(7 % 2);
// prints: 1 (7 divided by 2 leaves 1 left over)`,
      JAVA({ main: r`// Print 10 % 3
«System.out.println(10 % 3);»` }),
    ),
  },
  "4-5": {
    c: L(
      "round() (from math.h) rounds a decimal to the nearest whole number. Print it with %.0f, which means \"a decimal with 0 digits after the point\".",
      r`printf("%.0f\n", round(4.7));
// prints: 5`,
      C({ inc: "#include <math.h>\n", main: r`// Print 3.2 rounded to the nearest whole number
«printf("%.0f\n", round(3.2));»` }),
      { i: "Print 3.2 rounded to the nearest whole number using round()." },
    ),
    cpp: L(
      "round() (from <cmath>) rounds a decimal to the nearest whole number.",
      r`cout << round(4.7) << endl;
// prints: 5`,
      CPP({ inc: "#include <cmath>\n", main: r`// Print 3.2 rounded to the nearest whole number
«cout << round(3.2) << endl;»` }),
      { i: "Print 3.2 rounded to the nearest whole number using round()." },
    ),
    java: L(
      "Math.round() rounds a decimal to the nearest whole number.",
      r`System.out.println(Math.round(4.7));
// prints: 5`,
      JAVA({ main: r`// Print Math.round(3.2)
«System.out.println(Math.round(3.2));»` }),
    ),
  },

  // ───────── World 5: Strings ─────────
  "5-1": {
    c: L(
      "Text values are called strings and must be wrapped in double quotes.",
      r`printf("cat\n");
// prints: cat`,
      C({ main: r`// Print: banana
«printf("banana\n");»` }),
    ),
    cpp: L(
      "Text values are called strings and must be wrapped in double quotes.",
      r`cout << "cat" << endl;
// prints: cat`,
      CPP({ main: r`// Print: banana
«cout << "banana" << endl;»` }),
    ),
    java: L(
      "Text values are called strings and must be wrapped in double quotes.",
      r`System.out.println("cat");
// prints: cat`,
      JAVA({ main: r`// Print: banana
«System.out.println("banana");»` }),
    ),
  },
  "5-2": {
    c: L(
      "printf can join text for you: every %s slot is filled with one string, in order.",
      r`printf("%s %s\n", "Hello", "World");
// prints: Hello World`,
      C({ main: r`char first[] = "Ada";
char last[] = "Lovelace";

// Print the full name below
«printf("%s %s\n", first, last);»` }),
    ),
    cpp: L(
      "You can join (concatenate) strings together using the + operator.",
      r`string a = "Hello";
cout << a + " " + "World" << endl;
// prints: Hello World`,
      CPP({ inc: "#include <string>\n", main: r`string first = "Ada";
string last = "Lovelace";

// Print the full name below
«cout << first + " " + last << endl;»` }),
    ),
    java: L(
      "You can join (concatenate) strings together using the + operator.",
      r`System.out.println("Hello" + " " + "World");
// prints: Hello World`,
      JAVA({ main: r`String first = "Ada";
String last = "Lovelace";

// Print the full name below
«System.out.println(first + " " + last);»` }),
    ),
  },
  "5-3": {
    c: L(
      "strlen() (from string.h) tells you how many characters are in a string. Cast it with (int) so %d can print it.",
      r`printf("%d\n", (int)strlen("cat"));
// prints: 3`,
      C({ inc: "#include <string.h>\n", main: r`char word[] = "banana";

// Print the length of word
«printf("%d\n", (int)strlen(word));»` }),
    ),
    cpp: L(
      ".length() tells you how many characters are in a string.",
      r`string s = "cat";
cout << s.length() << endl;
// prints: 3`,
      CPP({ inc: "#include <string>\n", main: r`string word = "banana";

// Print the length of word
«cout << word.length() << endl;»` }),
    ),
    java: L(
      ".length() tells you how many characters are in a string.",
      r`String s = "cat";
System.out.println(s.length());
// prints: 3`,
      JAVA({ main: r`String word = "banana";

// Print the length of word
«System.out.println(word.length());»` }),
    ),
  },
  "5-4": {
    c: L(
      "printf's message is really a template: a %s slot gets filled with a string, so you can drop a variable right into a sentence.",
      r`char name[] = "Sam";
printf("Hi %s\n", name);
// prints: Hi Sam`,
      C({ main: r`// Print: Hello, Luna!
char name[] = "Luna";

«printf("Hello, %s!\n", name);»` }),
      { i: "Given name below, print exactly: Hello, Luna! using a %s slot in printf." },
    ),
    cpp: L(
      "You can weave a variable into a sentence by chaining text and the variable together with <<.",
      r`string name = "Sam";
cout << "Hi " << name << endl;
// prints: Hi Sam`,
      CPP({ inc: "#include <string>\n", main: r`// Print: Hello, Luna!
string name = "Luna";

«cout << "Hello, " << name << "!" << endl;»` }),
      { i: "Given name below, print exactly: Hello, Luna! by chaining text and name with <<." },
    ),
    java: L(
      "You can weave a variable into a sentence by joining text and the variable with +.",
      r`String name = "Sam";
System.out.println("Hi " + name);
// prints: Hi Sam`,
      JAVA({ main: r`// Print: Hello, Luna!
String name = "Luna";

«System.out.println("Hello, " + name + "!");»` }),
      { i: "Given name below, print exactly: Hello, Luna! by joining text and name with +." },
    ),
  },
  "5-5": {
    c: L(
      "toupper() (from ctype.h) turns one letter into its uppercase form. To change a whole word, loop over its letters and print each one.",
      r`putchar(toupper('h'));
putchar(toupper('i'));
printf("\n");
// prints: HI`,
      C({ inc: "#include <ctype.h>\n", main: r`// Print word in uppercase
char word[] = "loud";

«for (int i = 0; word[i] != '\0'; i++) {
    putchar(toupper(word[i]));
}
printf("\n");»` }),
      { i: "Given word below, print it in uppercase. (toupper() changes one letter at a time, so use a loop.)" },
    ),
    cpp: L(
      "toupper() (from <cctype>) turns one letter into its uppercase form. To change a whole word, loop over its letters.",
      r`char ch = toupper('h');
cout << ch << endl;
// prints: H`,
      CPP({ inc: "#include <string>\n#include <cctype>\n", main: r`// Print word in uppercase
string word = "loud";

«for (char &ch : word) {
    ch = toupper(ch);
}
cout << word << endl;»` }),
      { i: "Given word below, print it in uppercase. (toupper() changes one letter at a time, so use a loop.)" },
    ),
    java: L(
      "Strings have built-in methods like .toUpperCase() and .toLowerCase().",
      r`System.out.println("hi".toUpperCase());
// prints: HI`,
      JAVA({ main: r`// Print word in uppercase
String word = "loud";

«System.out.println(word.toUpperCase());»` }),
    ),
  },

  // ───────── World 6: Booleans & Comparisons ─────────
  "6-2": {
    c: L(
      "== checks whether two values are equal. C has no true/false printout: it gives back 1 for true and 0 for false.",
      r`printf("%d\n", 5 == 5);
// prints: 1`,
      C({ main: r`// Print whether 7 == 7
«printf("%d\n", 7 == 7);»` }),
      { i: "Print whether 7 is equal to 7, using ==. (C prints 1 for true and 0 for false.)", out: "1" },
    ),
    cpp: L(
      "== checks whether two values are equal and gives back true or false. Add boolalpha to make cout print the words instead of 1 and 0.",
      r`cout << boolalpha << (5 == 5) << endl;
// prints: true`,
      CPP({ main: r`// Print whether 7 == 7
«cout << boolalpha << (7 == 7) << endl;»` }),
      { i: "Print whether 7 is equal to 7, using == (start with boolalpha so it prints true)." },
    ),
    java: L(
      "== checks whether two values are equal, and gives back true or false.",
      r`System.out.println(5 == 5);
// prints: true`,
      JAVA({ main: r`// Print whether 7 == 7
«System.out.println(7 == 7);»` }),
      { i: "Print whether 7 is equal to 7, using ==." },
    ),
  },
  "6-3": {
    c: L(
      "> and < compare two numbers. The answer is 1 (true) or 0 (false).",
      r`printf("%d\n", 2 > 5);
// prints: 0`,
      C({ main: r`// Print whether 10 > 3
«printf("%d\n", 10 > 3);»` }),
      { i: "Print whether 10 is greater than 3. (C prints 1 for true and 0 for false.)", out: "1" },
    ),
    cpp: L(
      "> and < compare two numbers and give back true or false (with boolalpha, cout prints the words).",
      r`cout << boolalpha << (2 > 5) << endl;
// prints: false`,
      CPP({ main: r`// Print whether 10 > 3
«cout << boolalpha << (10 > 3) << endl;»` }),
      { i: "Print whether 10 is greater than 3 (start with boolalpha so it prints true)." },
    ),
    java: L(
      "> and < compare two numbers and give back true or false.",
      r`System.out.println(2 > 5);
// prints: false`,
      JAVA({ main: r`// Print whether 10 > 3
«System.out.println(10 > 3);»` }),
    ),
  },
  "6-5": {
    c: L(
      "You can combine two comparisons with && to check if a value falls in a range. The result is 1 (true) or 0 (false).",
      r`int n = 5;
printf("%d\n", n > 0 && n < 10); // 1`,
      C({ main: r`int age = 15;

// Print whether age is between 10 and 18
«printf("%d\n", age >= 10 && age <= 18);»` }),
      { i: "Given age below, print whether it's between 10 and 18 inclusive, using &&. (C prints 1 for true.)", out: "1" },
    ),
    cpp: L(
      "You can combine two comparisons with && to check if a value falls in a range.",
      r`int n = 5;
cout << boolalpha << (n > 0 && n < 10) << endl; // true`,
      CPP({ main: r`int age = 15;

// Print whether age is between 10 and 18
«cout << boolalpha << (age >= 10 && age <= 18) << endl;»` }),
    ),
    java: L(
      "You can combine two comparisons with && to check if a value falls in a range.",
      r`int n = 5;
System.out.println(n > 0 && n < 10); // true`,
      JAVA({ main: r`int age = 15;

// Print whether age is between 10 and 18
«System.out.println(age >= 10 && age <= 18);»` }),
    ),
  },

  // ───────── World 7: Conditionals ─────────
  "7-1": {
    c: L(
      "if only runs its block when the condition inside the parentheses is true — otherwise nothing happens. (bool comes from stdbool.h.)",
      r`if (true) {
    printf("shown\n");
}`,
      C({ inc: "#include <stdbool.h>\n", main: r`bool isRaining = true;

// Print the message only if isRaining
«if (isRaining) {
    printf("Bring an umbrella\n");
}»` }),
    ),
    cpp: L(
      "if only runs its block when the condition inside the parentheses is true — otherwise nothing happens.",
      r`if (true) {
    cout << "shown" << endl;
}`,
      CPP({ main: r`bool isRaining = true;

// Print the message only if isRaining
«if (isRaining) {
    cout << "Bring an umbrella" << endl;
}»` }),
    ),
    java: L(
      "if only runs its block when the condition inside the parentheses is true — otherwise nothing happens.",
      r`if (true) {
    System.out.println("shown");
}`,
      JAVA({ main: r`boolean isRaining = true;

// Print the message only if isRaining
«if (isRaining) {
    System.out.println("Bring an umbrella");
}»` }),
    ),
  },
  "7-2": {
    c: L(
      "if/else lets your code make decisions. If the condition is true, the if block runs — otherwise the else block runs.",
      r`if (10 > 5) {
    printf("bigger\n");
} else {
    printf("smaller\n");
}`,
      C({ main: r`int age = 20;

// Write your if/else statement below
«if (age >= 18) {
    printf("Adult\n");
} else {
    printf("Minor\n");
}»` }),
    ),
    cpp: L(
      "if/else lets your code make decisions. If the condition is true, the if block runs — otherwise the else block runs.",
      r`if (10 > 5) {
    cout << "bigger" << endl;
} else {
    cout << "smaller" << endl;
}`,
      CPP({ main: r`int age = 20;

// Write your if/else statement below
«if (age >= 18) {
    cout << "Adult" << endl;
} else {
    cout << "Minor" << endl;
}»` }),
    ),
    java: L(
      "if/else lets your code make decisions. If the condition is true, the if block runs — otherwise the else block runs.",
      r`if (10 > 5) {
    System.out.println("bigger");
} else {
    System.out.println("smaller");
}`,
      JAVA({ main: r`int age = 20;

// Write your if/else statement below
«if (age >= 18) {
    System.out.println("Adult");
} else {
    System.out.println("Minor");
}»` }),
    ),
  },
  "7-3": {
    c: L(
      "else if lets you check several conditions in order, one after another, until one matches.",
      r`int n = 5;
if (n > 10) {
    printf("big\n");
} else if (n > 0) {
    printf("small\n");
} else {
    printf("zero or less\n");
}`,
      C({ main: r`int temp = 15;

// Write your if / else if / else chain
«if (temp < 10) {
    printf("Cold\n");
} else if (temp < 25) {
    printf("Warm\n");
} else {
    printf("Hot\n");
}»` }),
    ),
    cpp: L(
      "else if lets you check several conditions in order, one after another, until one matches.",
      r`int n = 5;
if (n > 10) {
    cout << "big" << endl;
} else if (n > 0) {
    cout << "small" << endl;
} else {
    cout << "zero or less" << endl;
}`,
      CPP({ main: r`int temp = 15;

// Write your if / else if / else chain
«if (temp < 10) {
    cout << "Cold" << endl;
} else if (temp < 25) {
    cout << "Warm" << endl;
} else {
    cout << "Hot" << endl;
}»` }),
    ),
    java: L(
      "else if lets you check several conditions in order, one after another, until one matches.",
      r`int n = 5;
if (n > 10) {
    System.out.println("big");
} else if (n > 0) {
    System.out.println("small");
} else {
    System.out.println("zero or less");
}`,
      JAVA({ main: r`int temp = 15;

// Write your if / else if / else chain
«if (temp < 10) {
    System.out.println("Cold");
} else if (temp < 25) {
    System.out.println("Warm");
} else {
    System.out.println("Hot");
}»` }),
    ),
  },
  "7-5": {
    c: L(
      "You can combine % with if to check patterns, like whether a number is even (remainder 0 when divided by 2).",
      r`int n = 4;
if (n % 2 == 0) {
    printf("even\n");
}`,
      C({ main: r`int n = 8;

// Print Even or Odd
«if (n % 2 == 0) {
    printf("Even\n");
} else {
    printf("Odd\n");
}»` }),
    ),
    cpp: L(
      "You can combine % with if to check patterns, like whether a number is even (remainder 0 when divided by 2).",
      r`int n = 4;
if (n % 2 == 0) {
    cout << "even" << endl;
}`,
      CPP({ main: r`int n = 8;

// Print Even or Odd
«if (n % 2 == 0) {
    cout << "Even" << endl;
} else {
    cout << "Odd" << endl;
}»` }),
    ),
    java: L(
      "You can combine % with if to check patterns, like whether a number is even (remainder 0 when divided by 2).",
      r`int n = 4;
if (n % 2 == 0) {
    System.out.println("even");
}`,
      JAVA({ main: r`int n = 8;

// Print Even or Odd
«if (n % 2 == 0) {
    System.out.println("Even");
} else {
    System.out.println("Odd");
}»` }),
    ),
  },
  "7-6": {
    c: L(
      "Let's combine everything: chain several conditions together to solve a classic coding puzzle.",
      r`// If divisible by 3 AND 5, print FizzBuzz first!`,
      C({ main: r`int n = 15;

// Write your FizzBuzz logic
«if (n % 15 == 0) {
    printf("FizzBuzz\n");
} else if (n % 3 == 0) {
    printf("Fizz\n");
} else if (n % 5 == 0) {
    printf("Buzz\n");
} else {
    printf("%d\n", n);
}»` }),
    ),
    cpp: L(
      "Let's combine everything: chain several conditions together to solve a classic coding puzzle.",
      r`// If divisible by 3 AND 5, print FizzBuzz first!`,
      CPP({ main: r`int n = 15;

// Write your FizzBuzz logic
«if (n % 15 == 0) {
    cout << "FizzBuzz" << endl;
} else if (n % 3 == 0) {
    cout << "Fizz" << endl;
} else if (n % 5 == 0) {
    cout << "Buzz" << endl;
} else {
    cout << n << endl;
}»` }),
    ),
    java: L(
      "Let's combine everything: chain several conditions together to solve a classic coding puzzle.",
      r`// If divisible by 3 AND 5, print FizzBuzz first!`,
      JAVA({ main: r`int n = 15;

// Write your FizzBuzz logic
«if (n % 15 == 0) {
    System.out.println("FizzBuzz");
} else if (n % 3 == 0) {
    System.out.println("Fizz");
} else if (n % 5 == 0) {
    System.out.println("Buzz");
} else {
    System.out.println(n);
}»` }),
    ),
  },

  // ───────── World 8: Loops: for ─────────
  "8-1": {
    c: L(
      "A for loop repeats code without you writing it over and over. It has three parts: a start, a condition to keep going, and a step.",
      r`for (int i = 1; i <= 3; i++) {
    printf("%d\n", i);
}
// prints: 1, 2, 3`,
      C({ main: r`// Write a for loop that prints 1 to 5
«for (int i = 1; i <= 5; i++) {
    printf("%d\n", i);
}»` }),
    ),
    cpp: L(
      "A for loop repeats code without you writing it over and over. It has three parts: a start, a condition to keep going, and a step.",
      r`for (int i = 1; i <= 3; i++) {
    cout << i << endl;
}
// prints: 1, 2, 3`,
      CPP({ main: r`// Write a for loop that prints 1 to 5
«for (int i = 1; i <= 5; i++) {
    cout << i << endl;
}»` }),
    ),
    java: L(
      "A for loop repeats code without you writing it over and over. It has three parts: a start, a condition to keep going, and a step.",
      r`for (int i = 1; i <= 3; i++) {
    System.out.println(i);
}
// prints: 1, 2, 3`,
      JAVA({ main: r`// Write a for loop that prints 1 to 5
«for (int i = 1; i <= 5; i++) {
    System.out.println(i);
}»` }),
    ),
  },
  "8-2": {
    c: L(
      "You can change the step (i += 2) to count differently, like only even numbers.",
      r`for (int i = 0; i <= 4; i += 2) {
    printf("%d\n", i);
}
// prints: 0, 2, 4`,
      C({ main: r`// Print 2, 4, 6, 8, 10
«for (int i = 2; i <= 10; i += 2) {
    printf("%d\n", i);
}»` }),
    ),
    cpp: L(
      "You can change the step (i += 2) to count differently, like only even numbers.",
      r`for (int i = 0; i <= 4; i += 2) {
    cout << i << endl;
}
// prints: 0, 2, 4`,
      CPP({ main: r`// Print 2, 4, 6, 8, 10
«for (int i = 2; i <= 10; i += 2) {
    cout << i << endl;
}»` }),
    ),
    java: L(
      "You can change the step (i += 2) to count differently, like only even numbers.",
      r`for (int i = 0; i <= 4; i += 2) {
    System.out.println(i);
}
// prints: 0, 2, 4`,
      JAVA({ main: r`// Print 2, 4, 6, 8, 10
«for (int i = 2; i <= 10; i += 2) {
    System.out.println(i);
}»` }),
    ),
  },
  "8-3": {
    c: L(
      "Loops can count down too, by decreasing i with i-- instead of increasing it.",
      r`for (int i = 3; i >= 1; i--) {
    printf("%d\n", i);
}
// prints: 3, 2, 1`,
      C({ main: r`// Print 5, 4, 3, 2, 1
«for (int i = 5; i >= 1; i--) {
    printf("%d\n", i);
}»` }),
    ),
    cpp: L(
      "Loops can count down too, by decreasing i with i-- instead of increasing it.",
      r`for (int i = 3; i >= 1; i--) {
    cout << i << endl;
}
// prints: 3, 2, 1`,
      CPP({ main: r`// Print 5, 4, 3, 2, 1
«for (int i = 5; i >= 1; i--) {
    cout << i << endl;
}»` }),
    ),
    java: L(
      "Loops can count down too, by decreasing i with i-- instead of increasing it.",
      r`for (int i = 3; i >= 1; i--) {
    System.out.println(i);
}
// prints: 3, 2, 1`,
      JAVA({ main: r`// Print 5, 4, 3, 2, 1
«for (int i = 5; i >= 1; i--) {
    System.out.println(i);
}»` }),
    ),
  },
  "8-4": {
    c: L(
      "You can build up a total inside a loop by using a variable declared outside it, and adding to it each time.",
      r`int total = 0;
for (int i = 1; i <= 3; i++) {
    total += i;
}
// total is 6`,
      C({ main: r`int total = 0;

// Loop from 1 to 5, adding each number to total
«for (int i = 1; i <= 5; i++) {
    total += i;
}»

printf("%d\n", total);` }),
    ),
    cpp: L(
      "You can build up a total inside a loop by using a variable declared outside it, and adding to it each time.",
      r`int total = 0;
for (int i = 1; i <= 3; i++) {
    total += i;
}
// total is 6`,
      CPP({ main: r`int total = 0;

// Loop from 1 to 5, adding each number to total
«for (int i = 1; i <= 5; i++) {
    total += i;
}»

cout << total << endl;` }),
    ),
    java: L(
      "You can build up a total inside a loop by using a variable declared outside it, and adding to it each time.",
      r`int total = 0;
for (int i = 1; i <= 3; i++) {
    total += i;
}
// total is 6`,
      JAVA({ main: r`int total = 0;

// Loop from 1 to 5, adding each number to total
«for (int i = 1; i <= 5; i++) {
    total += i;
}»

System.out.println(total);` }),
    ),
  },
  "8-6": {
    c: L(
      "You can put an if statement inside a loop to only act on certain values.",
      r`for (int i = 1; i <= 4; i++) {
    if (i % 2 == 0) printf("%d\n", i);
}
// 2, 4`,
      C({ main: r`// Print the even numbers from 1 to 10
«for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        printf("%d\n", i);
    }
}»` }),
    ),
    cpp: L(
      "You can put an if statement inside a loop to only act on certain values.",
      r`for (int i = 1; i <= 4; i++) {
    if (i % 2 == 0) cout << i << endl;
}
// 2, 4`,
      CPP({ main: r`// Print the even numbers from 1 to 10
«for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        cout << i << endl;
    }
}»` }),
    ),
    java: L(
      "You can put an if statement inside a loop to only act on certain values.",
      r`for (int i = 1; i <= 4; i++) {
    if (i % 2 == 0) System.out.println(i);
}
// 2, 4`,
      JAVA({ main: r`// Print the even numbers from 1 to 10
«for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        System.out.println(i);
    }
}»` }),
    ),
  },

  // ───────── World 9: Loops: while ─────────
  "9-1": {
    c: L(
      "A while loop repeats as long as its condition stays true. You must update the variable yourself, or it never stops!",
      r`int i = 0;
while (i < 3) {
    printf("%d\n", i);
    i++;
}
// 0, 1, 2`,
      C({ main: r`int i = 1;

// write a while loop here
«while (i <= 5) {
    printf("%d\n", i);
    i++;
}»` }),
    ),
    cpp: L(
      "A while loop repeats as long as its condition stays true. You must update the variable yourself, or it never stops!",
      r`int i = 0;
while (i < 3) {
    cout << i << endl;
    i++;
}
// 0, 1, 2`,
      CPP({ main: r`int i = 1;

// write a while loop here
«while (i <= 5) {
    cout << i << endl;
    i++;
}»` }),
    ),
    java: L(
      "A while loop repeats as long as its condition stays true. You must update the variable yourself, or it never stops!",
      r`int i = 0;
while (i < 3) {
    System.out.println(i);
    i++;
}
// 0, 1, 2`,
      JAVA({ main: r`int i = 1;

// write a while loop here
«while (i <= 5) {
    System.out.println(i);
    i++;
}»` }),
    ),
  },
  "9-2": {
    c: L(
      "Just like for loops, while loops can count down too.",
      r`int i = 3;
while (i >= 1) {
    printf("%d\n", i);
    i--;
}`,
      C({ main: r`int i = 5;

«while (i >= 1) {
    printf("%d\n", i);
    i--;
}»` }),
    ),
    cpp: L(
      "Just like for loops, while loops can count down too.",
      r`int i = 3;
while (i >= 1) {
    cout << i << endl;
    i--;
}`,
      CPP({ main: r`int i = 5;

«while (i >= 1) {
    cout << i << endl;
    i--;
}»` }),
    ),
    java: L(
      "Just like for loops, while loops can count down too.",
      r`int i = 3;
while (i >= 1) {
    System.out.println(i);
    i--;
}`,
      JAVA({ main: r`int i = 5;

«while (i >= 1) {
    System.out.println(i);
    i--;
}»` }),
    ),
  },
  "9-4": {
    c: L(
      "Let's combine while with multiplication to grow a number quickly.",
      r`int n = 1;
while (n < 10) {
    printf("%d\n", n);
    n *= 2;
}`,
      C({ main: r`int n = 1;

«while (n <= 100) {
    printf("%d\n", n);
    n *= 2;
}»` }),
    ),
    cpp: L(
      "Let's combine while with multiplication to grow a number quickly.",
      r`int n = 1;
while (n < 10) {
    cout << n << endl;
    n *= 2;
}`,
      CPP({ main: r`int n = 1;

«while (n <= 100) {
    cout << n << endl;
    n *= 2;
}»` }),
    ),
    java: L(
      "Let's combine while with multiplication to grow a number quickly.",
      r`int n = 1;
while (n < 10) {
    System.out.println(n);
    n *= 2;
}`,
      JAVA({ main: r`int n = 1;

«while (n <= 100) {
    System.out.println(n);
    n *= 2;
}»` }),
    ),
  },

  // ───────── World 10: Arrays ─────────
  "10-2": {
    c: L(
      "Each item in an array has a position (index) starting at 0. Use [] to get an item by its position. A list of texts is an array of char* values.",
      r`char *a[] = {"x", "y"};
printf("%s\n", a[1]);
// prints: y`,
      C({ main: r`char *fruits[] = {"apple", "banana", "cherry"};

// Print the second fruit
«printf("%s\n", fruits[1]);»` }),
    ),
    cpp: L(
      "Each item in an array has a position (index) starting at 0. Use [] to get an item by its position.",
      r`string a[] = {"x", "y"};
cout << a[1] << endl;
// prints: y`,
      CPP({ inc: "#include <string>\n", main: r`string fruits[] = {"apple", "banana", "cherry"};

// Print the second fruit
«cout << fruits[1] << endl;»` }),
    ),
    java: L(
      "Each item in an array has a position (index) starting at 0. Use [] to get an item by its position.",
      r`String[] a = {"x", "y"};
System.out.println(a[1]);
// prints: y`,
      JAVA({ main: r`String[] fruits = {"apple", "banana", "cherry"};

// Print the second fruit
«System.out.println(fruits[1]);»` }),
    ),
  },
  "10-3": {
    c: L(
      "C arrays don't remember their length. sizeof(array) is the total size and sizeof(array[0]) is one item's size, so dividing them counts the items.",
      r`int a[] = {1, 2, 3};
printf("%d\n", (int)(sizeof(a) / sizeof(a[0])));
// prints: 3`,
      C({ main: r`int nums[] = {10, 20, 30, 40};

// Print how many items
«printf("%d\n", (int)(sizeof(nums) / sizeof(nums[0])));»` }),
    ),
    cpp: L(
      "A vector is a list that knows its own size: .size() tells you how many items it holds.",
      r`vector<int> a = {1, 2, 3};
cout << a.size() << endl;
// prints: 3`,
      CPP({ inc: "#include <vector>\n", main: r`vector<int> nums = {10, 20, 30, 40};

// Print how many items
«cout << nums.size() << endl;»` }),
    ),
    java: L(
      ".length tells you how many items are in an array (no parentheses for arrays).",
      r`int[] a = {1, 2, 3};
System.out.println(a.length);
// prints: 3`,
      JAVA({ main: r`int[] nums = {10, 20, 30, 40};

// Print how many items
«System.out.println(nums.length);»` }),
    ),
  },
  "10-4": {
    c: L(
      "C arrays have a fixed size, so you can't push new items on the end — but you can fill an empty slot by assigning to its index.",
      r`int a[3] = {1, 2};
a[2] = 3;
printf("%d\n", a[2]); // 3`,
      C({ main: r`int scores[3] = {10, 20};

// Set the third slot to 30, then print it
«scores[2] = 30;
printf("%d\n", scores[2]);»` }),
      { i: "Given scores below (room for 3 numbers, 2 filled in), set the third slot to 30, then print it.", out: "30" },
    ),
    cpp: L(
      ".push_back() adds a new item onto the end of a vector.",
      r`vector<int> a = {1, 2};
a.push_back(3);
cout << a.size() << endl; // 3`,
      CPP({ inc: "#include <string>\n#include <vector>\n", main: r`vector<string> list = {"a", "b"};

// push "c" then print how many items there are
«list.push_back("c");
cout << list.size() << endl;»` }),
      { i: 'Given list below, push "c" onto it, then print how many items it holds.', out: "3" },
    ),
    java: L(
      "An ArrayList is a list that can grow: .add() puts a new item onto the end.",
      r`ArrayList<Integer> a = new ArrayList<>(List.of(1, 2));
a.add(3);
System.out.println(a); // [1, 2, 3]`,
      JAVA({ imp: "import java.util.*;\n", main: r`ArrayList<String> list = new ArrayList<>(List.of("a", "b"));

// add "c" then print list
«list.add("c");
System.out.println(list);»` }),
      { i: 'Given list below, add "c" to it, then print the whole list.', out: "[a, b, c]" },
    ),
  },
  "10-5": {
    c: L(
      "Combine a for loop with array indexing to visit every item, one by one.",
      r`char *a[] = {"x", "y"};
for (int i = 0; i < 2; i++) {
    printf("%s\n", a[i]);
}`,
      C({ main: r`char *colors[] = {"red", "green", "blue"};

// Print each color
«for (int i = 0; i < 3; i++) {
    printf("%s\n", colors[i]);
}»` }),
    ),
    cpp: L(
      "Combine a for loop with array indexing to visit every item, one by one.",
      r`string a[] = {"x", "y"};
for (int i = 0; i < 2; i++) {
    cout << a[i] << endl;
}`,
      CPP({ inc: "#include <string>\n", main: r`string colors[] = {"red", "green", "blue"};

// Print each color
«for (int i = 0; i < 3; i++) {
    cout << colors[i] << endl;
}»` }),
    ),
    java: L(
      "Combine a for loop with array indexing to visit every item, one by one.",
      r`String[] a = {"x", "y"};
for (int i = 0; i < a.length; i++) {
    System.out.println(a[i]);
}`,
      JAVA({ main: r`String[] colors = {"red", "green", "blue"};

// Print each color
«for (int i = 0; i < colors.length; i++) {
    System.out.println(colors[i]);
}»` }),
    ),
  },

  // ───────── World 11: Functions ─────────
  "11-1": {
    c: L(
      "A function is a reusable block of code with a name. Define it once above main (void means it gives nothing back), then run it any time by calling its name with ().",
      r`void sayHi(void) {
    printf("Hi!\n");
}
// later, inside main:
sayHi();`,
      C({ top: r`// Define a function called greet that prints "Hi!"
«void greet(void) {
    printf("Hi!\n");
}»`, main: r`// Then call greet()
«greet();»` }),
    ),
    cpp: L(
      "A function is a reusable block of code with a name. Define it once above main (void means it gives nothing back), then run it any time by calling its name with ().",
      r`void sayHi() {
    cout << "Hi!" << endl;
}
// later, inside main:
sayHi();`,
      CPP({ top: r`// Define a function called greet that prints "Hi!"
«void greet() {
    cout << "Hi!" << endl;
}»`, main: r`// Then call greet()
«greet();»` }),
    ),
    java: L(
      "A function (called a method in Java) is a reusable block of code with a name. Define it once inside the class (static void means it gives nothing back), then run it any time by calling its name with ().",
      r`static void sayHi() {
    System.out.println("Hi!");
}
// later, inside main:
sayHi();`,
      JAVA({ top: r`// Define a method called greet that prints "Hi!"
«static void greet() {
    System.out.println("Hi!");
}»`, main: r`// Then call greet()
«greet();»` }),
    ),
  },
  "11-2": {
    c: L(
      "Parameters let you pass information into a function so it can use it, like a blank the function fills in. Each parameter needs a type.",
      r`void greet(char *name) {
    printf("Hi %s\n", name);
}
greet("Sam");
// Hi Sam`,
      C({ inc: "#include <ctype.h>\n", top: r`// Define shout(word) that prints the word in uppercase
«void shout(char *word) {
    for (int i = 0; word[i] != '\0'; i++) {
        putchar(toupper(word[i]));
    }
    printf("\n");
}»`, main: r`// Call shout("go")
«shout("go");»` }),
      { i: 'Write a function shout that takes a word and prints it in uppercase (use toupper() in a loop), then call shout("go").' },
    ),
    cpp: L(
      "Parameters let you pass information into a function so it can use it, like a blank the function fills in. Each parameter needs a type.",
      r`void greet(string name) {
    cout << "Hi " << name << endl;
}
greet("Sam");
// Hi Sam`,
      CPP({ inc: "#include <string>\n#include <cctype>\n", top: r`// Define shout(word) that prints the word in uppercase
«void shout(string word) {
    for (char &ch : word) {
        ch = toupper(ch);
    }
    cout << word << endl;
}»`, main: r`// Call shout("go")
«shout("go");»` }),
      { i: 'Write a function shout that takes a word and prints it in uppercase (use toupper() in a loop), then call shout("go").' },
    ),
    java: L(
      "Parameters let you pass information into a function so it can use it, like a blank the function fills in. Each parameter needs a type.",
      r`static void greet(String name) {
    System.out.println("Hi " + name);
}
greet("Sam");
// Hi Sam`,
      JAVA({ top: r`// Define shout(word) that prints the word in uppercase
«static void shout(String word) {
    System.out.println(word.toUpperCase());
}»`, main: r`// Call shout("go")
«shout("go");»` }),
    ),
  },
  "11-3": {
    c: L(
      "return sends a value back out of a function so you can use it later. The type before the function's name says what kind of value comes back.",
      r`int add(int a, int b) {
    return a + b;
}
printf("%d\n", add(2, 3));
// 5`,
      C({ top: r`// Define add(a, b) that returns a + b
«int add(int a, int b) {
    return a + b;
}»`, main: r`// Print add(4, 5)
«printf("%d\n", add(4, 5));»` }),
    ),
    cpp: L(
      "return sends a value back out of a function so you can use it later. The type before the function's name says what kind of value comes back.",
      r`int add(int a, int b) {
    return a + b;
}
cout << add(2, 3) << endl;
// 5`,
      CPP({ top: r`// Define add(a, b) that returns a + b
«int add(int a, int b) {
    return a + b;
}»`, main: r`// Print add(4, 5)
«cout << add(4, 5) << endl;»` }),
    ),
    java: L(
      "return sends a value back out of a function so you can use it later. The type before the function's name says what kind of value comes back.",
      r`static int add(int a, int b) {
    return a + b;
}
System.out.println(add(2, 3));
// 5`,
      JAVA({ top: r`// Define add(a, b) that returns a + b
«static int add(int a, int b) {
    return a + b;
}»`, main: r`// Print add(4, 5)
«System.out.println(add(4, 5));»` }),
    ),
  },
  "11-4": {
    c: L(
      "Functions can take more than one parameter, separated by commas — each with its own type.",
      r`int multiply(int a, int b) {
    return a * b;
}`,
      C({ top: r`// Define multiply(a, b)
«int multiply(int a, int b) {
    return a * b;
}»`, main: r`// Print multiply(3, 4)
«printf("%d\n", multiply(3, 4));»` }),
    ),
    cpp: L(
      "Functions can take more than one parameter, separated by commas — each with its own type.",
      r`int multiply(int a, int b) {
    return a * b;
}`,
      CPP({ top: r`// Define multiply(a, b)
«int multiply(int a, int b) {
    return a * b;
}»`, main: r`// Print multiply(3, 4)
«cout << multiply(3, 4) << endl;»` }),
    ),
    java: L(
      "Functions can take more than one parameter, separated by commas — each with its own type.",
      r`static int multiply(int a, int b) {
    return a * b;
}`,
      JAVA({ top: r`// Define multiply(a, b)
«static int multiply(int a, int b) {
    return a * b;
}»`, main: r`// Print multiply(3, 4)
«System.out.println(multiply(3, 4));»` }),
    ),
  },
  "11-5": {
    c: L(
      "C has no arrow functions, but a macro is a similar shortcut: #define gives a short name to a small piece of code, and C fills it in wherever you use it. Wrap each part in parentheses so the math stays correct.",
      r`#define DOUBLE(n) ((n) * 2)
printf("%d\n", DOUBLE(4)); // 8`,
      C({ top: r`// Define SQUARE(n) as a macro
«#define SQUARE(n) ((n) * (n))»`, main: r`// Print SQUARE(5)
«printf("%d\n", SQUARE(5));»` }),
      { i: "Define a macro called SQUARE(n) that gives n * n, then print SQUARE(5)." },
    ),
    cpp: L(
      "A lambda is a short, nameless function you store in a variable: [](int n) { return n * n; }. auto lets C++ work out the variable's type for you.",
      r`auto add = [](int a, int b) { return a + b; };
cout << add(2, 3) << endl; // 5`,
      CPP({ main: r`// Define square as a lambda, then print square(5)
«auto square = [](int n) { return n * n; };
cout << square(5) << endl;»` }),
      { i: "Write a lambda called square that returns n * n, then print square(5)." },
    ),
    java: L(
      "A lambda is a short function written with ->. Store it in a functional-interface variable like IntUnaryOperator and call it with .applyAsInt().",
      r`IntBinaryOperator add = (a, b) -> a + b;
System.out.println(add.applyAsInt(2, 3)); // 5`,
      JAVA({ imp: "import java.util.function.*;\n", main: r`// Define square as a lambda, then print square(5)
«IntUnaryOperator square = n -> n * n;
System.out.println(square.applyAsInt(5));»` }),
      { i: "Write a lambda called square that returns n * n, then print square.applyAsInt(5)." },
    ),
  },

  // ───────── World 12: Objects ─────────
  "12-2": {
    c: L(
      "A struct groups related values, called members, under one name. Read a member back with a dot, like dog.name.",
      r`struct Cat { char name[20]; };
struct Cat cat = {"Whiskers"};
printf("%s\n", cat.name);
// Whiskers`,
      C({ top: r`struct Dog {
    char name[20];
    int age;
};`, main: r`struct Dog dog = {"Rex", 3};

// Print dog's name
«printf("%s\n", dog.name);»` }),
    ),
    cpp: L(
      "A struct groups related values, called members, under one name. Read a member back with a dot, like dog.name.",
      r`struct Cat { string name; };
Cat cat = {"Whiskers"};
cout << cat.name << endl;
// Whiskers`,
      CPP({ inc: "#include <string>\n", top: r`struct Dog {
    string name;
    int age;
};`, main: r`Dog dog = {"Rex", 3};

// Print dog's name
«cout << dog.name << endl;»` }),
    ),
    java: L(
      "A class groups related values, called fields, under one name. Make one with new, then read a field back with a dot, like dog.name.",
      r`class Cat { String name = "Whiskers"; }
Cat cat = new Cat();
System.out.println(cat.name);
// Whiskers`,
      JAVA({ pre: r`class Dog {
    String name = "Rex";
    int age = 3;
}`, main: r`Dog dog = new Dog();

// Print dog's name
«System.out.println(dog.name);»` }),
    ),
  },
  "12-3": {
    c: L(
      "You can change a member's value after creating the struct, just by assigning it a new value.",
      r`struct Car car = {"red"};
strcpy(car.color, "blue"); // text needs strcpy
car.wheels = 4;            // numbers just use =`,
      C({ top: r`struct User {
    int score;
};`, main: r`struct User user = {0};

// Set score to 100, then print it
«user.score = 100;
printf("%d\n", user.score);»` }),
    ),
    cpp: L(
      "You can change a member's value after creating the struct, just by assigning it a new value.",
      r`Car car = {"red"};
car.color = "blue";`,
      CPP({ top: r`struct User {
    int score;
};`, main: r`User user = {0};

// Set score to 100, then print it
«user.score = 100;
cout << user.score << endl;»` }),
    ),
    java: L(
      "You can change a field's value after creating the object, just by assigning it a new value.",
      r`Car car = new Car();
car.color = "blue";`,
      JAVA({ pre: r`class User {
    int score = 0;
}`, main: r`User user = new User();

// Set score to 100, then print it
«user.score = 100;
System.out.println(user.score);»` }),
    ),
  },
  "12-4": {
    c: L(
      "A struct's members are fixed when you define it, so give it every member up front. Text members can't be assigned with =; copy text in with strcpy() (from string.h).",
      r`struct Box { char label[20]; };
struct Box box = {""};
strcpy(box.label, "toys");`,
      C({ inc: "#include <string.h>\n", top: r`struct Pet {
    char name[20];
    char sound[20];
};`, main: r`struct Pet pet = {"Milo", ""};

// Set sound to "Woof", then print it
«strcpy(pet.sound, "Woof");
printf("%s\n", pet.sound);»` }),
      { i: 'Given pet below (its sound starts out empty), set sound to "Woof" using strcpy(), then print it.' },
    ),
    cpp: L(
      "A struct's members are fixed when you define it, so give it every member up front — then fill them in later by assigning.",
      r`struct Box { string label; };
Box box = {""};
box.label = "toys";`,
      CPP({ inc: "#include <string>\n", top: r`struct Pet {
    string name;
    string sound;
};`, main: r`Pet pet = {"Milo", ""};

// Set sound to "Woof", then print it
«pet.sound = "Woof";
cout << pet.sound << endl;»` }),
      { i: 'Given pet below (its sound starts out empty), set sound to "Woof", then print it.' },
    ),
    java: L(
      "A class's fields are fixed when you write the class, so give it every field up front — then fill them in later by assigning.",
      r`class Box { String label = ""; }
Box box = new Box();
box.label = "toys";`,
      JAVA({ pre: r`class Pet {
    String name = "Milo";
    String sound = "";
}`, main: r`Pet pet = new Pet();

// Set sound to "Woof", then print it
«pet.sound = "Woof";
System.out.println(pet.sound);»` }),
      { i: 'Given pet below (its sound starts out empty), set sound to "Woof", then print it.' },
    ),
  },
};

export const COMPILED_LANGUAGE_IDS = ["c", "cpp", "java"];

function dedent(text, baseIndent) {
  const lines = text.split("\n");
  return lines
    .map((line, i) => (i === 0 ? line : line.startsWith(baseIndent) ? line.slice(baseIndent.length) : line))
    .join("\n");
}

// Program with the learner's blanks left empty.
export function makeStarter(code) {
  return code.replace(/«[\s\S]*?»/g, "").replace(/[ \t]+$/gm, "");
}

// The complete, working program (markers removed).
export function makeSolution(code) {
  return code.replace(/[«»]/g, "");
}

function makeHint(code) {
  const segments = [];
  const re = /«([\s\S]*?)»/g;
  let match;
  while ((match = re.exec(code))) {
    const lineStart = code.lastIndexOf("\n", match.index) + 1;
    const baseIndent = code.slice(lineStart, match.index).match(/^ */)[0];
    segments.push(dedent(match[1], baseIndent));
  }
  return segments.join("\n\n");
}

// Content in the same shape CodeChallenge already understands.
export function getCompiledLesson(levelId, language) {
  const entry = COMPILED_LESSONS[levelId]?.[language];
  if (!entry) return null;
  const content = {
    tutorial: entry.t,
    example: entry.ex,
    starterCode: entry.starter ?? makeStarter(entry.code),
    hint: makeHint(entry.code),
  };
  if (entry.i) content.instructions = entry.i;
  if (entry.out !== undefined) content.expectedOutput = entry.out;
  return content;
}
