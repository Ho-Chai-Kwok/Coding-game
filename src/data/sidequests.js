// Side quests: short, optional lessons on real-world tools and libraries
// (Python data/ML stack, cloud, web, DevOps). They don't run real Python —
// exercises are conceptual (quiz-based) with a read-only code example,
// and unlike main-path worlds, every side quest is open from the start.

const RAW_QUESTS = [
  {
    name: "Git & GitHub",
    icon: "🔀",
    from: "#f97316",
    to: "#c2410c",
    tutorial:
      "Git tracks changes to your code over time, so you can undo mistakes and see history. GitHub is a website that hosts Git repositories online for sharing and collaborating.",
    example: 'git add .\ngit commit -m "Add login feature"\ngit push',
    question: "Which command saves a snapshot of your staged changes with a message?",
    options: ["git push", 'git commit -m "message"', "git clone", "git branch"],
    correctIndex: 1,
    explanation:
      "git commit saves a snapshot (with a message describing what changed); git push then uploads it to GitHub.",
  },
  {
    name: "Docker",
    icon: "🐳",
    from: "#38bdf8",
    to: "#0369a1",
    tutorial:
      "Docker packages an app and everything it needs (code, libraries, settings) into a 'container' that runs the same way on any computer.",
    example: "docker build -t myapp .\ndocker run myapp",
    question: "What is a Docker container best described as?",
    options: [
      "A virtual machine that boots a full OS",
      "A lightweight, isolated package that runs an app the same way anywhere",
      "A type of database",
      "A programming language",
    ],
    correctIndex: 1,
    explanation:
      "Containers share the host OS kernel but isolate the app and its dependencies, making them lighter than full virtual machines.",
  },
  {
    name: "NumPy",
    icon: "🔢",
    from: "#60a5fa",
    to: "#1d4ed8",
    tutorial:
      "NumPy is a Python library for fast math on arrays of numbers. It's the foundation for most scientific computing in Python.",
    example: "import numpy as np\na = np.array([1, 2, 3])\nprint(a * 2)\n# [2 4 6]",
    question: "What makes NumPy arrays faster than plain Python lists for math?",
    options: [
      "They run on the GPU automatically",
      "They store data compactly and do math in optimized C code",
      "They can only hold whole numbers",
      "They are actually just Python lists",
    ],
    correctIndex: 1,
    explanation:
      "NumPy stores numbers in tightly packed memory and does the math using fast, compiled C code instead of slow Python loops.",
  },
  {
    name: "Pandas",
    icon: "🐼",
    from: "#94a3b8",
    to: "#334155",
    tutorial:
      "Pandas is a Python library for working with tabular data (like a spreadsheet) using a structure called a DataFrame.",
    example: 'import pandas as pd\ndf = pd.read_csv("data.csv")\nprint(df.head())',
    question: "What is a Pandas DataFrame most like?",
    options: [
      "A single number",
      "A table with rows and columns, like a spreadsheet",
      "A type of loop",
      "A web page",
    ],
    correctIndex: 1,
    explanation:
      "A DataFrame is a 2D table with labeled rows and columns — perfect for cleaning and analyzing real-world data.",
  },
  {
    name: "PyTorch",
    icon: "🔥",
    from: "#fb923c",
    to: "#c2410c",
    tutorial:
      "PyTorch is a Python library for building and training machine learning models, especially neural networks. Its core data type is the tensor — similar to a NumPy array, but it can run on a GPU.",
    example: "import torch\nx = torch.tensor([1.0, 2.0, 3.0])\nprint(x * 2)\n# tensor([2., 4., 6.])",
    question: "What is a 'tensor' in PyTorch?",
    options: [
      "A type of loop",
      "A multi-dimensional array of numbers that can run on a GPU",
      "A database table",
      "A single Python function",
    ],
    correctIndex: 1,
    explanation:
      "Tensors are PyTorch's core data structure — like NumPy arrays, but they can be moved to a GPU for much faster computation.",
  },
  {
    name: "TensorFlow",
    icon: "🧠",
    from: "#fbbf24",
    to: "#b45309",
    tutorial:
      "TensorFlow is another major library (built by Google) for building and training machine learning models, often used with its high-level API, Keras.",
    example: "import tensorflow as tf\nmodel = tf.keras.Sequential([\n  tf.keras.layers.Dense(10)\n])",
    question: "What is Keras, in the context of TensorFlow?",
    options: [
      "A separate programming language",
      "A high-level API for building neural networks easily",
      "A database",
      "A type of GPU",
    ],
    correctIndex: 1,
    explanation:
      "Keras provides simple, readable building blocks (like layers) for assembling neural networks on top of TensorFlow.",
  },
  {
    name: "AWS Cloud Basics",
    icon: "☁️",
    from: "#7dd3fc",
    to: "#0284c7",
    tutorial:
      "AWS (Amazon Web Services) rents out computing resources over the internet — like storage, servers, and databases — so you don't have to own physical hardware.",
    example: "S3     → file storage\nEC2    → virtual servers\nLambda → run code without managing a server",
    question: "Which AWS service is best for storing files, like images or backups?",
    options: ["EC2", "S3", "Lambda", "IAM"],
    correctIndex: 1,
    explanation:
      "S3 (Simple Storage Service) is AWS's object storage service, built for storing and retrieving files at scale.",
  },
  {
    name: "SQL Basics",
    icon: "🗄️",
    from: "#a78bfa",
    to: "#6d28d9",
    tutorial:
      "SQL is a language for asking questions of a database. SELECT retrieves rows, and WHERE filters which ones you get back.",
    example: "SELECT name, age FROM users\nWHERE age >= 18;",
    question: "Which keyword filters rows to match a condition?",
    options: ["SELECT", "FROM", "WHERE", "TABLE"],
    correctIndex: 2,
    explanation: "WHERE filters which rows are included, based on a condition — like age >= 18.",
  },
  {
    name: "React",
    icon: "⚛️",
    from: "#67e8f9",
    to: "#0e7490",
    tutorial:
      "React is a JavaScript library for building user interfaces out of reusable pieces called components.",
    example: "function Welcome() {\n  return <h1>Hello!</h1>;\n}",
    question: "What is a React 'component'?",
    options: [
      "A CSS file",
      "A reusable piece of UI, usually written as a function",
      "A database table",
      "A type of loop",
    ],
    correctIndex: 1,
    explanation:
      "Components are the building blocks of a React app — small, reusable functions that return what should appear on screen.",
  },
  {
    name: "Node.js",
    icon: "🟢",
    from: "#4ade80",
    to: "#15803d",
    tutorial: "Node.js lets you run JavaScript outside a browser — for example, to build a web server.",
    example:
      'const http = require("http");\nhttp.createServer((req, res) => {\n  res.end("Hello!");\n}).listen(3000);',
    question: "What does Node.js let JavaScript do that it couldn't do in a browser alone?",
    options: [
      "Use variables",
      "Run on a server and access the file system",
      "Use if statements",
      "Print to the console",
    ],
    correctIndex: 1,
    explanation:
      "Node.js gives JavaScript access to servers, files, and networking — things a browser normally keeps off-limits for security.",
  },
  {
    name: "REST APIs",
    icon: "🌐",
    from: "#f472b6",
    to: "#be185d",
    tutorial:
      "A REST API lets apps talk to each other over the web using standard HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove).",
    example: "GET  /users/42   → fetch user 42\nPOST /users      → create a new user",
    question: "Which HTTP method is used to fetch (read) data without changing anything?",
    options: ["GET", "POST", "DELETE", "PUT"],
    correctIndex: 0,
    explanation: "GET requests read data and shouldn't change anything on the server.",
  },
  {
    name: "Linux & Bash",
    icon: "🐧",
    from: "#fdba74",
    to: "#c2410c",
    tutorial:
      "Bash is a command-line shell used to control Linux (and Mac) computers by typing commands instead of clicking.",
    example: "ls          # list files\ncd folder   # change directory\nmkdir new   # make a new folder",
    question: "Which command lists the files in the current folder?",
    options: ["cd", "ls", "mkdir", "rm"],
    correctIndex: 1,
    explanation: "ls (list) shows the files and folders in your current location.",
  },
  {
    name: "Kubernetes",
    icon: "⎈",
    from: "#93c5fd",
    to: "#1e40af",
    tutorial:
      "Kubernetes (K8s) manages lots of Docker containers for you automatically — starting, stopping, and restarting them across many machines.",
    example: "kubectl get pods\nkubectl scale deployment myapp --replicas=3",
    question: "What problem does Kubernetes mainly solve?",
    options: [
      "Writing code faster",
      "Automatically managing and scaling many containers",
      "Storing files",
      "Designing web pages",
    ],
    correctIndex: 1,
    explanation:
      "Kubernetes orchestrates containers — deciding where they run, restarting failed ones, and scaling up or down automatically.",
  },
  {
    name: "CI/CD",
    icon: "🔄",
    from: "#d8b4fe",
    to: "#7e22ce",
    tutorial:
      "CI/CD automatically tests and deploys your code every time you push a change, instead of doing it by hand. CI = Continuous Integration, CD = Continuous Deployment.",
    example: "on: push\njobs:\n  test:\n    run: npm test",
    question: "What does Continuous Integration (CI) mainly do?",
    options: [
      "Automatically builds and tests code on every change",
      "Designs the app's UI",
      "Stores files in the cloud",
      "Writes the code for you",
    ],
    correctIndex: 0,
    explanation: "CI automatically builds and runs tests whenever code changes, catching problems early.",
  },
  {
    name: "MongoDB",
    icon: "🍃",
    from: "#6ee7b7",
    to: "#047857",
    tutorial:
      "MongoDB is a NoSQL database that stores data as flexible JSON-like documents instead of rigid tables and rows.",
    example: '{ "name": "Rex", "age": 3, "tags": ["dog", "good boy"] }',
    question: "How does MongoDB mainly store data?",
    options: [
      "In tables with fixed rows and columns, like SQL",
      "As flexible JSON-like documents",
      "As plain text files only",
      "As images",
    ],
    correctIndex: 1,
    explanation:
      "MongoDB stores data as documents (similar to JSON objects), which don't need a fixed structure like SQL tables do.",
  },
  {
    name: "GraphQL",
    icon: "🔷",
    from: "#f9a8d4",
    to: "#9d174d",
    tutorial:
      "GraphQL is a query language for APIs that lets the app ask for exactly the fields it needs — nothing more, nothing less.",
    example: "query {\n  user(id: 42) {\n    name\n  }\n}",
    question: "What's a key advantage of GraphQL over a typical REST API?",
    options: [
      "It's faster to type",
      "Clients can request exactly the fields they need, avoiding extra data",
      "It doesn't need a server",
      "It only works with images",
    ],
    correctIndex: 1,
    explanation:
      "With REST you often get a fixed response shape; GraphQL lets the client specify exactly which fields it wants.",
  },
  {
    name: "Flask",
    icon: "🌶️",
    from: "#86efac",
    to: "#166534",
    tutorial: "Flask is a lightweight Python framework for building web applications and APIs.",
    example: 'from flask import Flask\napp = Flask(__name__)\n\n@app.route("/")\ndef home():\n    return "Hello!"',
    question: 'What does the @app.route("/") decorator do in Flask?',
    options: [
      "Deletes the home page",
      "Connects a URL path to a function that handles it",
      "Installs Flask",
      "Creates a database",
    ],
    correctIndex: 1,
    explanation:
      '@app.route maps a URL (like "/") to the function that should run when someone visits it.',
  },
  {
    name: "Matplotlib",
    icon: "📈",
    from: "#fca5a5",
    to: "#b91c1c",
    tutorial:
      "Matplotlib is a Python library for drawing charts and graphs, like line plots and bar charts, from your data.",
    example: "import matplotlib.pyplot as plt\nplt.plot([1, 2, 3], [4, 5, 6])\nplt.show()",
    question: "What does plt.show() do in Matplotlib?",
    options: [
      "Saves the data to a file",
      "Displays the chart you've built",
      "Deletes the chart",
      "Installs Matplotlib",
    ],
    correctIndex: 1,
    explanation: "plt.show() opens a window (or renders inline) displaying the chart you've constructed.",
  },
  {
    name: "Jupyter Notebooks",
    icon: "📓",
    from: "#fdba74",
    to: "#9a3412",
    tutorial:
      "Jupyter Notebooks let you mix code, text, and charts in one interactive document, running code one small piece (cell) at a time.",
    example: "# Cell 1\nx = 5\n\n# Cell 2\nprint(x * 2)  # 10",
    question: "What's the main benefit of running code in cells, like Jupyter does?",
    options: [
      "Code runs faster",
      "You can run and re-run small pieces of code independently and see results immediately",
      "It automatically fixes bugs",
      "It only works with JavaScript",
    ],
    correctIndex: 1,
    explanation:
      "Cells let you experiment step by step, rerunning just the part you're working on instead of the whole program.",
  },
  {
    name: "Machine Learning Basics",
    icon: "🤖",
    from: "#c4b5fd",
    to: "#5b21b6",
    tutorial:
      "Machine learning is teaching a computer to find patterns in data and make predictions, instead of programming every rule by hand.",
    example:
      "from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X, y)\nmodel.predict(new_X)",
    question: "What does 'training' a machine learning model mean?",
    options: [
      "Writing the model's code by hand",
      "Showing it example data so it can learn patterns",
      "Deleting old data",
      "Designing its user interface",
    ],
    correctIndex: 1,
    explanation:
      "Training feeds the model example data (inputs and correct answers) so it can adjust itself to recognize patterns.",
  },
];

export const sidequests = RAW_QUESTS.map((q, i) => ({
  id: `sq-${i + 1}`,
  name: q.name,
  icon: q.icon,
  from: q.from,
  to: q.to,
  completed: false,
  level: {
    id: `sq-${i + 1}`,
    title: q.name,
    character: q.icon,
    stageNumber: i + 1,
    content: {
      type: "quiz",
      tutorial: q.tutorial,
      example: q.example,
      instructions: `A quick look at ${q.name}.`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    },
  },
}));
