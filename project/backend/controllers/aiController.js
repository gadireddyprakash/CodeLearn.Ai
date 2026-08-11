const User = require('../models/User');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { callAI } = require('../utils/ai');

// Central AI helper wrapper
const callClaude = callAI;

// @desc   Generate AI Resume
// @route  POST /api/ai/resume/generate
// @access Private
const generateResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const submissions = await Submission.find({ user: req.user._id, status: 'Accepted' })
      .populate('problem', 'title category difficulty');

    // Auto-detect skills from activity
    const detectedSkills = new Set(user.profile?.skills || []);
    const solvedCategories = {};
    submissions.forEach(s => {
      if (s.problem) {
        detectedSkills.add(s.language);
        solvedCategories[s.problem.category] = (solvedCategories[s.problem.category] || 0) + 1;
      }
    });

    const userData = {
      name: user.profile?.fullName || user.username,
      email: user.email,
      location: user.profile?.location || '',
      github: user.profile?.github || '',
      linkedin: user.profile?.linkedin || '',
      website: user.profile?.website || '',
      education: user.profile?.education || [],
      skills: Array.from(detectedSkills),
      experience: user.profile?.experience || [],
      bio: user.profile?.bio || '',
      stats: {
        problemsSolved: user.stats.problemsSolved,
        streak: user.stats.streak,
        topCategories: Object.entries(solvedCategories).sort((a, b) => b[1] - a[1]).slice(0, 5),
      },
    };

    const systemPrompt = `You are an expert ATS resume writer. Generate a professional, ATS-optimized resume in JSON format.
Return ONLY valid JSON with these fields:
{
  "summary": "Professional summary 2-3 sentences",
  "skills": { "languages": [], "frameworks": [], "tools": [], "concepts": [] },
  "education": [{"institution":"","degree":"","field":"","year":""}],
  "experience": [{"company":"","role":"","duration":"","points":[]}],
  "projects": [{"name":"","description":"","technologies":[],"link":""}],
  "achievements": ["..."]
}`;

    const result = await callClaude(systemPrompt, JSON.stringify(userData));

    let resumeData;
    if (result.mock) {
      // Mock resume for development
      resumeData = {
        summary: `Passionate software developer with ${user.stats.problemsSolved}+ problems solved. Strong foundation in algorithms and data structures.`,
        skills: {
          languages: Array.from(detectedSkills).slice(0, 6),
          frameworks: ['React', 'Node.js', 'Express'],
          tools: ['Git', 'MongoDB', 'VS Code'],
          concepts: Object.keys(solvedCategories).slice(0, 4),
        },
        education: user.profile?.education?.length ? user.profile.education : [{ institution: 'Add Your University', degree: 'B.Tech', field: 'Computer Science', year: '2024' }],
        experience: user.profile?.experience || [],
        projects: [{ name: 'CodeLearn Platform', description: 'Solved ' + user.stats.problemsSolved + ' coding problems', technologies: Array.from(detectedSkills).slice(0, 3), link: '' }],
        achievements: [`Solved ${user.stats.problemsSolved} coding problems`, `${user.stats.streak} day streak`],
      };
    } else {
      try {
        const cleaned = result.text.replace(/```json\n?|\n?```/g, '').trim();
        resumeData = JSON.parse(cleaned);
      } catch {
        resumeData = { summary: result.text, skills: {}, education: [], experience: [], projects: [], achievements: [] };
      }
    }

    // Save resume to user
    user.resume = { generated: true, data: resumeData, lastGenerated: new Date() };
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, resume: resumeData, userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Analyze resume & give score
// @route  POST /api/ai/resume/analyze
// @access Private
const analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;

    const systemPrompt = `You are a professional resume reviewer and career coach. Analyze the resume and return ONLY valid JSON:
{
  "score": <0-100>,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingSkills": ["..."],
  "suggestions": ["..."],
  "atsCompatibility": <0-100>,
  "sectionScores": { "summary": 0, "skills": 0, "experience": 0, "education": 0, "projects": 0 }
}`;

    const result = await callClaude(systemPrompt, `Analyze this resume:\n${resumeText}`);

    let analysis;
    if (result.mock) {
      analysis = {
        score: 72,
        strengths: ['Strong technical skills', 'Good problem-solving track record', 'Active coding practice'],
        weaknesses: ['Limited work experience', 'Missing quantifiable achievements', 'No certifications listed'],
        missingSkills: ['System Design', 'Cloud (AWS/GCP)', 'Docker/Kubernetes'],
        suggestions: [
          'Add metrics to achievements (e.g., "improved performance by 30%")',
          'Include open source contributions',
          'Add a portfolio/GitHub link',
          'List relevant certifications',
        ],
        atsCompatibility: 68,
        sectionScores: { summary: 70, skills: 80, experience: 60, education: 75, projects: 70 },
      };
    } else {
      try {
        const cleaned = result.text.replace(/```json\n?|\n?```/g, '').trim();
        analysis = JSON.parse(cleaned);
      } catch {
        analysis = { score: 60, strengths: [], weaknesses: [], missingSkills: [], suggestions: [result.text], atsCompatibility: 60, sectionScores: {} };
      }
    }

    // Save analysis to user
    await User.findByIdAndUpdate(req.user._id, {
      'resume.analysis': analysis,
      'resume.score': analysis.score,
    });

    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get learning recommendations
// @route  GET /api/ai/recommendations
// @access Private
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'category difficulty tags')
      .sort({ createdAt: -1 })
      .limit(50);

    // Analyze weak areas
    const categoryStats = {};
    submissions.forEach(s => {
      if (s.problem) {
        const cat = s.problem.category;
        if (!categoryStats[cat]) categoryStats[cat] = { total: 0, passed: 0 };
        categoryStats[cat].total++;
        if (s.status === 'Accepted') categoryStats[cat].passed++;
      }
    });

    const weakAreas = Object.entries(categoryStats)
      .filter(([, v]) => v.total > 0 && (v.passed / v.total) < 0.5)
      .map(([cat]) => cat);

    const solvedProblems = submissions
      .filter(s => s.status === 'Accepted')
      .map(s => s.problem?._id?.toString())
      .filter(Boolean);

    // Get recommended problems (not yet solved, matching weak areas or beginner)
    const problemFilter = { isActive: true, _id: { $nin: solvedProblems } };
    if (weakAreas.length > 0) problemFilter.category = { $in: weakAreas };

    const recommendedProblems = await Problem.find(problemFilter)
      .select('title slug difficulty category tags points')
      .sort({ acceptanceRate: -1 })
      .limit(6);

    // Learning roadmap based on stats
    const roadmap = generateRoadmap(user.stats, weakAreas);

    res.json({
      success: true,
      recommendations: {
        weakAreas,
        recommendedProblems,
        roadmap,
        topicsToStudy: weakAreas.length > 0 ? weakAreas : ['Arrays', 'Strings', 'Dynamic Programming'],
        stats: categoryStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Local knowledge base for coding topics (used when no AI API key is configured)
const localKnowledgeBase = (message) => {
  const msg = message.toLowerCase();

  if (msg.includes('array') || msg.includes('list')) {
    return `**Arrays / Lists**\n\nAn array stores elements at contiguous memory locations.\n\n**Time Complexity:**\n- Access: O(1)\n- Search (unsorted): O(n)\n- Insert/Delete at end: O(1)\n- Insert/Delete at middle: O(n)\n\n**Common patterns:** Two Pointers, Sliding Window, Prefix Sum\n\n\`\`\`python\nnums = [1, 2, 3, 4, 5]\nprint(nums[0])    # O(1) access\nnums.append(6)    # O(1) insert\nnums.pop(2)       # O(n) delete at middle\n\`\`\`\n\n💡 Use a **hash map** alongside arrays to reduce search from O(n) to O(1).`;
  }

  if (msg.includes('linked list') || msg.includes('linkedlist')) {
    return `**Linked List**\n\nEach node holds data + a pointer to the next node.\n\n**Time Complexity:**\n- Access/Search: O(n)\n- Insert/Delete at head: O(1)\n- Insert/Delete at tail: O(n) singly / O(1) doubly\n\n**Key techniques:** Slow & fast pointers (cycle detection, find middle), dummy head node\n\n\`\`\`python\nclass Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\ndef reverse_list(head):\n    prev, curr = None, head\n    while curr:\n        curr.next, prev, curr = prev, curr, curr.next\n    return prev\n\`\`\``;
  }

  if (msg.includes('stack') || msg.includes('queue')) {
    return `**Stack & Queue**\n\n**Stack** – LIFO (Last In, First Out):\n- Push/Pop: O(1)\n- Use cases: undo, bracket matching, DFS, monotonic stack\n\n**Queue** – FIFO (First In, First Out):\n- Enqueue/Dequeue: O(1)\n- Use cases: BFS, task scheduling\n\n\`\`\`python\n# Stack\nstack = []\nstack.append(1)  # push\nstack.pop()      # pop\n\n# Queue\nfrom collections import deque\nq = deque()\nq.append(1)     # enqueue\nq.popleft()     # dequeue\n\`\`\`\n\n💡 Use **Monotonic Stack** for "next greater element" problems.`;
  }

  if (msg.includes('tree') || msg.includes('bst') || msg.includes('binary tree')) {
    return `**Trees & BST**\n\n**Traversals:**\n- Inorder (L→Root→R): sorted order in BST\n- Preorder (Root→L→R): copy tree\n- Postorder (L→R→Root): delete tree\n- Level Order: use a queue (BFS)\n\n**BST:** Left < Root < Right. Search/Insert/Delete: O(log n) avg, O(n) worst.\n\n\`\`\`python\ndef inorder(root):\n    if not root: return []\n    return inorder(root.left) + [root.val] + inorder(root.right)\n\ndef max_depth(root):\n    if not root: return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))\n\`\`\`\n\n💡 Most tree problems are solved with **recursion** (DFS) or **queue** (BFS).`;
  }

  if (msg.includes('dynamic programming') || msg.includes(' dp ') || msg.includes('memoization') || msg.includes('tabulation') || msg.includes('knapsack') || msg.includes('fibonacci')) {
    return `**Dynamic Programming (DP)**\n\nDP solves problems by breaking them into overlapping subproblems and caching results.\n\n**Two approaches:**\n1. **Top-down (Memoization):** recursion + cache → natural, easy to write\n2. **Bottom-up (Tabulation):** iterative dp table → faster, less stack\n\n**Classic DP problems:** Fibonacci, 0/1 Knapsack, LCS, LIS, Coin Change, Climbing Stairs\n\n\`\`\`python\n# Fibonacci with memoization\nfrom functools import lru_cache\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\n\n# Coin Change (bottom-up)\ndef coin_change(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for coin in coins:\n        for x in range(coin, amount + 1):\n            dp[x] = min(dp[x], dp[x - coin] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1\n\`\`\`\n\n💡 Key: define **state** → what changes between subproblems.`;
  }

  if (msg.includes('sort') || msg.includes('sorting')) {
    return `**Sorting Algorithms**\n\n| Algorithm | Avg | Worst | Space | Stable |\n|-----------|-----|-------|-------|--------|\n| Bubble | O(n²) | O(n²) | O(1) | ✅ |\n| Selection | O(n²) | O(n²) | O(1) | ❌ |\n| Insertion | O(n²) | O(n²) | O(1) | ✅ |\n| Merge Sort | O(n log n) | O(n log n) | O(n) | ✅ |\n| Quick Sort | O(n log n) | O(n²) | O(log n) | ❌ |\n| Heap Sort | O(n log n) | O(n log n) | O(1) | ❌ |\n\n\`\`\`python\n# Python uses Timsort: O(n log n), stable\nnums = [3, 1, 4, 1, 5]\nnums.sort()                    # in-place\nsorted_nums = sorted(nums)    # new list\nnums.sort(key=lambda x: -x)   # descending\n\`\`\`\n\n💡 For interviews: know **Merge Sort** (stable, guaranteed O(n log n)) and **Quick Sort** (fastest in practice).`;
  }

  if (msg.includes('graph') || msg.includes('bfs') || msg.includes('dfs') || msg.includes('breadth first') || msg.includes('depth first')) {
    return `**Graphs, BFS & DFS**\n\n**Representations:**\n- Adjacency List – sparse graphs: O(V+E) space ✅\n- Adjacency Matrix – dense graphs: O(V²) space\n\n**BFS** – Queue, shortest path in unweighted graphs\n**DFS** – Stack/Recursion, cycle detection, topological sort\n\n\`\`\`python\nfrom collections import deque\n\ndef bfs(graph, start):\n    visited, queue = {start}, deque([start])\n    while queue:\n        node = queue.popleft()\n        for nbr in graph[node]:\n            if nbr not in visited:\n                visited.add(nbr); queue.append(nbr)\n    return visited\n\ndef dfs(graph, node, visited=None):\n    if visited is None: visited = set()\n    visited.add(node)\n    for nbr in graph[node]:\n        if nbr not in visited: dfs(graph, nbr, visited)\n    return visited\n\`\`\`\n\n💡 BFS = shortest path | DFS = connectivity, cycles, paths.`;
  }

  if (msg.includes('binary search')) {
    return `**Binary Search**\n\nFind target in a **sorted array** in O(log n) by halving the search space each step.\n\n\`\`\`python\ndef binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1\n\`\`\`\n\n**Common variants:**\n- First/last occurrence → don't stop at match\n- Search in rotated sorted array\n- Binary search on answer (minimize/maximize)\n\n💡 Binary search works on any **monotonic** condition, not just sorted arrays.`;
  }

  if (msg.includes('two pointer') || msg.includes('two-pointer')) {
    return `**Two Pointers**\n\nUse two pointers to solve array/string problems in O(n) instead of O(n²).\n\n**Opposite ends (sorted array):**\n\`\`\`python\ndef two_sum_sorted(nums, target):\n    l, r = 0, len(nums) - 1\n    while l < r:\n        s = nums[l] + nums[r]\n        if s == target: return [l, r]\n        elif s < target: l += 1\n        else: r -= 1\n\`\`\`\n\n**Same direction (fast/slow):**\n\`\`\`python\n# Remove duplicates in-place\ndef remove_dupes(nums):\n    slow = 0\n    for fast in range(1, len(nums)):\n        if nums[fast] != nums[slow]:\n            slow += 1; nums[slow] = nums[fast]\n    return slow + 1\n\`\`\`\n\nUse cases: pair sum, palindrome, remove element, container with most water.`;
  }

  if (msg.includes('sliding window')) {
    return `**Sliding Window**\n\nMaintain a window (subarray/substring) that slides, avoiding recomputation.\n\n**Fixed window:**\n\`\`\`python\ndef max_sum_k(nums, k):\n    win = sum(nums[:k])\n    res = win\n    for i in range(k, len(nums)):\n        win += nums[i] - nums[i-k]\n        res = max(res, win)\n    return res\n\`\`\`\n\n**Variable window:**\n\`\`\`python\n# Longest substring without repeating chars\ndef longest_unique(s):\n    seen, l, res = set(), 0, 0\n    for r in range(len(s)):\n        while s[r] in seen:\n            seen.remove(s[l]); l += 1\n        seen.add(s[r])\n        res = max(res, r - l + 1)\n    return res\n\`\`\`\n\n💡 Time: O(n). Use when you need min/max subarray/substring with a condition.`;
  }

  if (msg.includes('hash') || msg.includes('hashmap') || msg.includes('dictionary') || msg.includes('dict')) {
    return `**Hash Map (Dictionary)**\n\nStores key-value pairs with **O(1)** average lookup, insert, delete.\n\n**When to use:**\n- Frequency counting\n- Two Sum (find complement)\n- Anagram grouping\n- Caching / memoization\n\n\`\`\`python\nfrom collections import Counter, defaultdict\n\n# Frequency counter\nfreq = Counter([\"a\", \"b\", \"a\"])  # {'a':2, 'b':1}\n\n# Two Sum – O(n)\ndef two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i\n\n# Group anagrams\ndef group_anagrams(words):\n    d = defaultdict(list)\n    for w in words: d[tuple(sorted(w))].append(w)\n    return list(d.values())\n\`\`\`\n\n💡 **Hash map is the #1 tool** for reducing O(n²) → O(n).`;
  }

  if (msg.includes('recursion') || msg.includes('recursive')) {
    return `**Recursion**\n\nA function that calls itself with a smaller input.\n\n**3 essentials:**\n1. **Base case** – when to stop\n2. **Recursive case** – smaller subproblem\n3. **Progress** – each call moves toward base case\n\n\`\`\`python\n# Factorial\ndef factorial(n):\n    if n == 0: return 1         # base case\n    return n * factorial(n-1)   # recursive\n\n# Power of 2 (fast)\ndef power(x, n):\n    if n == 0: return 1\n    if n % 2 == 0:\n        half = power(x, n//2)\n        return half * half\n    return x * power(x, n-1)\n\`\`\`\n\n⚠️ Deep recursion → Stack Overflow. Use **memoization** or convert to **iterative** when possible.`;
  }

  if (msg.includes('time complexity') || msg.includes('space complexity') || msg.includes('big o') || msg.includes('big-o') || msg.includes('complexity')) {
    return `**Big O Notation – Time & Space Complexity**\n\n| Complexity | Name | Example |\n|---|---|---|\n| O(1) | Constant | Array access, hash lookup |\n| O(log n) | Logarithmic | Binary search |\n| O(n) | Linear | Single loop |\n| O(n log n) | Log-linear | Merge sort |\n| O(n²) | Quadratic | Nested loops |\n| O(2ⁿ) | Exponential | Brute-force recursion |\n| O(n!) | Factorial | Permutations |\n\n\`\`\`python\n# O(1)\nx = arr[5]\n\n# O(n)\nfor i in range(n): pass\n\n# O(n²) – nested loops\nfor i in range(n):\n    for j in range(n): pass\n\n# O(log n) – binary search\nwhile left <= right:\n    mid = (left + right) // 2\n    ...\n\`\`\`\n\n💡 Each nested loop **multiplies** complexity. Hash maps turn O(n) search into O(1).`;
  }

  if (msg.includes('python')) {
    return `**Python Basics**\n\n\`\`\`python\n# Variables & Types\nx = 10; name = \"Alice\"; active = True\n\n# Input / Output\nname = input(\"Enter: \")\nprint(f\"Hello, {name}!\")\n\n# If/Else\nif x > 0: print(\"Positive\")\nelif x == 0: print(\"Zero\")\nelse: print(\"Negative\")\n\n# Loops\nfor i in range(5): print(i)       # 0..4\nfor item in [1,2,3]: print(item)\n\nwhile x > 0: x -= 1\n\n# Functions\ndef add(a, b):\n    return a + b\n\n# List operations\nnums = [3, 1, 4]\nnums.append(5)       # [3,1,4,5]\nnums.sort()          # [1,3,4,5]\nnums[:2]             # [1,3] slice\n[x**2 for x in nums] # list comprehension\n\`\`\``;
  }

  if (msg.includes('javascript') || msg.includes(' js ')) {
    return `**JavaScript Basics**\n\n\`\`\`javascript\n// Variables\nconst name = \"Alice\";   // immutable ref\nlet count = 0;          // mutable\n\n// Functions\nfunction greet(name) { return \`Hello \${name}\`; }\nconst double = x => x * 2;  // arrow function\n\n// Arrays\nconst nums = [1, 2, 3];\nnums.push(4);           // add end\nnums.pop();             // remove end\nnums.map(x => x*2);    // [2,4,6]\nnums.filter(x => x>1); // [2,3]\nnums.reduce((a,x)=>a+x, 0); // sum\n\n// Objects\nconst obj = { name: \"Alice\", age: 25 };\nconsole.log(obj.name);\nconst { name: n, age } = obj; // destructuring\n\n// Async\nfetch('/api/data')\n  .then(r => r.json())\n  .then(data => console.log(data));\n\`\`\`\n\n💡 Use **const** by default, **let** when reassigning, avoid **var**.`;
  }

  // Generic fallback
  const topics = [
    'Arrays & Lists', 'Linked Lists', 'Stacks & Queues', 'Trees & BST',
    'Graphs, BFS & DFS', 'Dynamic Programming', 'Sorting Algorithms',
    'Binary Search', 'Two Pointers', 'Sliding Window', 'Hash Maps',
    'Recursion', 'Big O / Complexity', 'Python basics', 'JavaScript basics'
  ];
  return `Hi! I'm your **CodeLearn AI Assistant** 🤖\n\nYou asked: *"${message}"*\n\nI can answer questions about these topics:\n\n${topics.map(t => `• ${t}`).join('\n')}\n\n**Try asking:**\n- "Explain dynamic programming with examples"\n- "How does binary search work?"\n- "What is a linked list?"\n- "Explain Big O notation"\n- "What is the sliding window technique?"\n\nAsk me anything about coding concepts! 💡`;
};

// @desc   Chat with AI (ChatGPT style)
// @route  POST /api/ai/chat
// @access Private
const chat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const systemPrompt = `You are a helpful coding assistant for the CodeLearn platform.
Help students understand programming concepts, data structures, algorithms, and coding problems.
Always provide clear explanations with code examples.
Keep responses educational and beginner-friendly.
Context: ${context || 'General coding help'}`;

    const result = await callClaude(systemPrompt, message);

    // If no API key, use our local knowledge base
    if (result.mock) {
      const reply = localKnowledgeBase(message);
      return res.json({ success: true, reply });
    }

    res.json({ success: true, reply: result.text });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateRoadmap = (stats, weakAreas) => {
  const roadmap = [];

  if (stats.problemsSolved < 10) {
    roadmap.push({ phase: 'Foundation', topics: ['Arrays', 'Strings', 'Basic Math'], duration: '2 weeks', priority: 'high' });
  } else if (stats.problemsSolved < 50) {
    roadmap.push({ phase: 'Intermediate', topics: ['LinkedList', 'Stacks', 'Queues', 'Recursion'], duration: '3 weeks', priority: 'high' });
  } else {
    roadmap.push({ phase: 'Advanced', topics: ['Dynamic Programming', 'Graphs', 'Trees'], duration: '4 weeks', priority: 'high' });
  }

  if (weakAreas.length > 0) {
    roadmap.push({ phase: 'Focus Areas', topics: weakAreas, duration: '2 weeks', priority: 'medium' });
  }

  roadmap.push({ phase: 'System Design', topics: ['HLD', 'LLD', 'Scalability'], duration: '3 weeks', priority: 'low' });

  return roadmap;
};

module.exports = { generateResume, analyzeResume, getRecommendations, chat };
