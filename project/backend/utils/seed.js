require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Level = require('../models/Level');
const connectDB = require('../config/db');

// 10 MCQs per level template
const getMCQs = (lang, lvl) => [
  { question: `In ${lang}, which keyword declares a variable?`, options: ['var/let/const', 'def', 'int', 'dim'], correctOptionIndex: 0 },
  { question: `What does a loop do in programming?`, options: ['Repeats a block of code', 'Declares a variable', 'Ends the program', 'Imports a module'], correctOptionIndex: 0 },
  { question: `Which symbol is used for comments in ${lang}?`, options: ['# or //', '/* */', '<!-- -->', '% %'], correctOptionIndex: 0 },
  { question: `What is a function?`, options: ['A reusable block of code', 'A variable type', 'A loop construct', 'A data structure'], correctOptionIndex: 0 },
  { question: `What is the time complexity of accessing an array element by index?`, options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctOptionIndex: 0 },
  { question: `Level ${lvl}: Which data structure uses LIFO order?`, options: ['Stack', 'Queue', 'Array', 'Tree'], correctOptionIndex: 0 },
  { question: `Level ${lvl}: What does BFS stand for?`, options: ['Breadth First Search', 'Binary File System', 'Basic For Statement', 'Byte First Sort'], correctOptionIndex: 0 },
  { question: `Level ${lvl}: What is recursion?`, options: ['A function calling itself', 'A loop type', 'A data type', 'A sorting method'], correctOptionIndex: 0 },
  { question: `Level ${lvl}: Which sorting algorithm has O(n log n) average time?`, options: ['Merge Sort', 'Bubble Sort', 'Selection Sort', 'Insertion Sort'], correctOptionIndex: 0 },
  { question: `Level ${lvl}: What is a hash map used for?`, options: ['O(1) key-value lookup', 'Sorting data', 'Graph traversal', 'Memory allocation'], correctOptionIndex: 0 },
];

// 10 coding problems per level
const getCodingProblems = (lang, lvl, adminId) => {
  const problems = [
    {
      title: `L${lvl}: Hello World`,
      difficulty: 'Easy', category: 'Other',
      description: 'Print "Hello, World!" to the output.',
      testCases: [{ input: ' ', expectedOutput: 'Hello, World!', isHidden: false }],
      solution: { python: 'print("Hello, World!")', javascript: 'console.log("Hello, World!")', cpp: '#include<iostream>\nusing namespace std;\nint main(){cout<<"Hello, World!"<<endl;return 0;}', java: 'public class Main{public static void main(String[] a){System.out.println("Hello, World!");}}' },
      hints: ['Just use the print/output statement'],
    },
    {
      title: `L${lvl}: Sum of Two Numbers`,
      difficulty: 'Easy', category: 'Math',
      description: 'Read two integers and print their sum.',
      testCases: [
        { input: '5 7', expectedOutput: '12', isHidden: false },
        { input: '10 20', expectedOutput: '30', isHidden: false },
        { input: '-5 5', expectedOutput: '0', isHidden: true },
      ],
      solution: { python: 'a, b = map(int, input().split())\nprint(a + b)', javascript: 'const [a,b]=require("fs").readFileSync("/dev/stdin","utf8").trim().split(" ").map(Number);\nconsole.log(a+b);', cpp: '#include<iostream>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b;return 0;}', java: 'import java.util.Scanner;\npublic class Main{public static void main(String[] a){Scanner sc=new Scanner(System.in);System.out.println(sc.nextInt()+sc.nextInt());}}' },
      hints: ['Read two numbers and add them'],
    },
    {
      title: `L${lvl}: Reverse a String`,
      difficulty: 'Easy', category: 'Strings',
      description: 'Read a string and print it reversed.',
      testCases: [
        { input: 'hello', expectedOutput: 'olleh', isHidden: false },
        { input: 'world', expectedOutput: 'dlrow', isHidden: false },
        { input: 'abcdef', expectedOutput: 'fedcba', isHidden: true },
      ],
      solution: { python: 's = input()\nprint(s[::-1])', javascript: 'const s=require("fs").readFileSync("/dev/stdin","utf8").trim();\nconsole.log(s.split("").reverse().join(""));', cpp: '#include<iostream>\n#include<algorithm>\nusing namespace std;\nint main(){string s;cin>>s;reverse(s.begin(),s.end());cout<<s;return 0;}', java: 'import java.util.Scanner;\npublic class Main{public static void main(String[] a){Scanner sc=new Scanner(System.in);String s=sc.next();System.out.println(new StringBuilder(s).reverse());}}' },
      hints: ['Python: use s[::-1]'],
    },
    {
      title: `L${lvl}: Check Even or Odd`,
      difficulty: 'Easy', category: 'Math',
      description: 'Read an integer. Print "Even" if even, "Odd" if odd.',
      testCases: [
        { input: '4', expectedOutput: 'Even', isHidden: false },
        { input: '7', expectedOutput: 'Odd', isHidden: false },
        { input: '0', expectedOutput: 'Even', isHidden: true },
      ],
      solution: { python: 'n = int(input())\nprint("Even" if n % 2 == 0 else "Odd")', javascript: 'const n=parseInt(require("fs").readFileSync("/dev/stdin","utf8").trim());\nconsole.log(n%2===0?"Even":"Odd");', cpp: '#include<iostream>\nusing namespace std;\nint main(){int n;cin>>n;cout<<(n%2==0?"Even":"Odd");return 0;}', java: 'import java.util.Scanner;\npublic class Main{public static void main(String[] a){int n=new Scanner(System.in).nextInt();System.out.println(n%2==0?"Even":"Odd");}}' },
      hints: ['Use the modulo % operator'],
    },
    {
      title: `L${lvl}: Factorial`,
      difficulty: 'Easy', category: 'Math',
      description: 'Read integer n. Print n! (factorial). n <= 12.',
      testCases: [
        { input: '5', expectedOutput: '120', isHidden: false },
        { input: '0', expectedOutput: '1', isHidden: false },
        { input: '10', expectedOutput: '3628800', isHidden: true },
      ],
      solution: { python: 'n = int(input())\nresult = 1\nfor i in range(1, n+1):\n    result *= i\nprint(result)', javascript: 'const n=parseInt(require("fs").readFileSync("/dev/stdin","utf8").trim());\nlet r=1;for(let i=1;i<=n;i++)r*=i;\nconsole.log(r);', cpp: '#include<iostream>\nusing namespace std;\nint main(){int n;cin>>n;long long r=1;for(int i=1;i<=n;i++)r*=i;cout<<r;return 0;}', java: 'import java.util.Scanner;\npublic class Main{public static void main(String[] a){int n=new Scanner(System.in).nextInt();long r=1;for(int i=1;i<=n;i++)r*=i;System.out.println(r);}}' },
      hints: ['Multiply numbers from 1 to n'],
    },
    {
      title: `L${lvl}: Find Maximum`,
      difficulty: 'Easy', category: 'Arrays',
      description: 'Read N integers on one line. Print the maximum.',
      testCases: [
        { input: '3 1 4 1 5 9 2 6', expectedOutput: '9', isHidden: false },
        { input: '-1 -5 -2', expectedOutput: '-1', isHidden: false },
        { input: '100', expectedOutput: '100', isHidden: true },
      ],
      solution: { python: 'nums = list(map(int, input().split()))\nprint(max(nums))', javascript: 'const nums=require("fs").readFileSync("/dev/stdin","utf8").trim().split(" ").map(Number);\nconsole.log(Math.max(...nums));', cpp: '#include<iostream>\n#include<algorithm>\n#include<vector>\nusing namespace std;\nint main(){int x;vector<int>v;while(cin>>x)v.push_back(x);cout<<*max_element(v.begin(),v.end());return 0;}', java: 'import java.util.*;\npublic class Main{public static void main(String[] a){Scanner sc=new Scanner(System.in);String[]s=sc.nextLine().split(" ");int m=Integer.MIN_VALUE;for(String x:s)m=Math.max(m,Integer.parseInt(x));System.out.println(m);}}' },
      hints: ['Use built-in max() function'],
    },
    {
      title: `L${lvl}: Count Vowels`,
      difficulty: 'Easy', category: 'Strings',
      description: 'Read a string. Count and print the number of vowels (a,e,i,o,u case-insensitive).',
      testCases: [
        { input: 'hello', expectedOutput: '2', isHidden: false },
        { input: 'programming', expectedOutput: '3', isHidden: false },
        { input: 'AEIOU', expectedOutput: '5', isHidden: true },
      ],
      solution: { python: 's = input().lower()\nprint(sum(1 for c in s if c in "aeiou"))', javascript: 'const s=require("fs").readFileSync("/dev/stdin","utf8").trim().toLowerCase();\nconsole.log([...s].filter(c=>"aeiou".includes(c)).length);', cpp: '#include<iostream>\nusing namespace std;\nint main(){string s;cin>>s;int c=0;for(char x:s)if(string("aeiouAEIOU").find(x)!=string::npos)c++;cout<<c;return 0;}', java: 'import java.util.Scanner;\npublic class Main{public static void main(String[] a){String s=new Scanner(System.in).next().toLowerCase();int c=0;for(char x:s.toCharArray())if("aeiou".indexOf(x)>=0)c++;System.out.println(c);}}' },
      hints: ['Check each character against a,e,i,o,u'],
    },
    {
      title: `L${lvl}: Fibonacci Series`,
      difficulty: lvl <= 3 ? 'Easy' : 'Medium', category: 'Math',
      description: 'Read n. Print first n Fibonacci numbers separated by spaces.',
      testCases: [
        { input: '5', expectedOutput: '0 1 1 2 3', isHidden: false },
        { input: '1', expectedOutput: '0', isHidden: false },
        { input: '8', expectedOutput: '0 1 1 2 3 5 8 13', isHidden: true },
      ],
      solution: { python: 'n = int(input())\na, b = 0, 1\nresult = []\nfor _ in range(n):\n    result.append(a)\n    a, b = b, a+b\nprint(*result)', javascript: 'const n=parseInt(require("fs").readFileSync("/dev/stdin","utf8").trim());\nlet a=0,b=1,r=[];\nfor(let i=0;i<n;i++){r.push(a);[a,b]=[b,a+b];}\nconsole.log(r.join(" "));', cpp: '#include<iostream>\nusing namespace std;\nint main(){int n;cin>>n;long long a=0,b=1;for(int i=0;i<n;i++){if(i)cout<<" ";cout<<a;long long t=a+b;a=b;b=t;}return 0;}', java: 'import java.util.Scanner;\npublic class Main{public static void main(String[] a){int n=new Scanner(System.in).nextInt();long x=0,y=1;for(int i=0;i<n;i++){if(i>0)System.out.print(" ");System.out.print(x);long t=x+y;x=y;y=t;}}}' },
      hints: ['Each number is sum of previous two'],
    },
    {
      title: `L${lvl}: Check Palindrome`,
      difficulty: lvl <= 5 ? 'Easy' : 'Medium', category: 'Strings',
      description: 'Read a string. Print "Yes" if it is a palindrome, "No" otherwise.',
      testCases: [
        { input: 'racecar', expectedOutput: 'Yes', isHidden: false },
        { input: 'hello', expectedOutput: 'No', isHidden: false },
        { input: 'madam', expectedOutput: 'Yes', isHidden: true },
      ],
      solution: { python: 's = input()\nprint("Yes" if s == s[::-1] else "No")', javascript: 'const s=require("fs").readFileSync("/dev/stdin","utf8").trim();\nconsole.log(s===s.split("").reverse().join("")?"Yes":"No");', cpp: '#include<iostream>\n#include<algorithm>\nusing namespace std;\nint main(){string s;cin>>s;string r=s;reverse(r.begin(),r.end());cout<<(s==r?"Yes":"No");return 0;}', java: 'import java.util.Scanner;\npublic class Main{public static void main(String[] a){String s=new Scanner(System.in).next();System.out.println(s.equals(new StringBuilder(s).reverse().toString())?"Yes":"No");}}' },
      hints: ['Compare string with its reverse'],
    },
    {
      title: `L${lvl}: Linear Search`,
      difficulty: lvl <= 7 ? 'Easy' : 'Medium', category: 'Searching',
      description: 'First line: N numbers. Second line: target. Print the index (0-based) of target, or -1 if not found.',
      testCases: [
        { input: '1 3 5 7 9\n5', expectedOutput: '2', isHidden: false },
        { input: '1 2 3\n4', expectedOutput: '-1', isHidden: false },
        { input: '10 20 30 40\n30', expectedOutput: '2', isHidden: true },
      ],
      solution: { python: 'nums = list(map(int, input().split()))\ntarget = int(input())\ntry:\n    print(nums.index(target))\nexcept:\n    print(-1)', javascript: 'const lines=require("fs").readFileSync("/dev/stdin","utf8").trim().split("\\n");\nconst nums=lines[0].split(" ").map(Number);\nconst t=parseInt(lines[1]);\nconsole.log(nums.indexOf(t));', cpp: '#include<iostream>\n#include<vector>\nusing namespace std;\nint main(){int x;vector<int>v;string line;getline(cin,line);istringstream ss(line);while(ss>>x)v.push_back(x);int t;cin>>t;for(int i=0;i<v.size();i++)if(v[i]==t){cout<<i;return 0;}cout<<-1;return 0;}', java: 'import java.util.*;\npublic class Main{public static void main(String[] a){Scanner sc=new Scanner(System.in);String[]s=sc.nextLine().split(" ");int t=sc.nextInt();for(int i=0;i<s.length;i++)if(Integer.parseInt(s[i])==t){System.out.println(i);return;}System.out.println(-1);}}' },
      hints: ['Loop through the array checking each element'],
    },
  ];
  return problems.map(p => ({
    ...p,
    title: `[${lang.toUpperCase()}] ${p.title}`,
    slug: `${lang}-l${lvl}-${p.title.toLowerCase().replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-')}`,
    createdBy: adminId,
    points: 10 * lvl,
  }));
};

const youtubeMap = {
  python: {
    1: 'https://www.youtube.com/watch?v=kqtD5dpnC8U',
    2: 'https://www.youtube.com/watch?v=5aG_9y_tSbg',
    3: 'https://www.youtube.com/watch?v=DZwmZhTxQs8',
    4: 'https://www.youtube.com/watch?v=6iF8Xb7Z3dw',
    5: 'https://www.youtube.com/watch?v=u-OmVr_fT4s',
    6: 'https://www.youtube.com/watch?v=9OeznAkyQz4',
    7: 'https://www.youtube.com/watch?v=k9TUPpGqYTo',
    8: 'https://www.youtube.com/watch?v=JeznW_7DlB0',
    9: 'https://www.youtube.com/watch?v=wzXph5Iq2ts',
    10: 'https://www.youtube.com/watch?v=pkYVOmU3BIU'
  },
  javascript: {
    1: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    2: 'https://www.youtube.com/watch?v=vEROU2XtPR8',
    3: 'https://www.youtube.com/watch?v=IsG4Xd6LkyM',
    4: 'https://www.youtube.com/watch?v=s9wW2PpJsmQ',
    5: 'https://www.youtube.com/watch?v=gigtS_Poli0',
    6: 'https://www.youtube.com/watch?v=oigfaZ5ApsM',
    7: 'https://www.youtube.com/watch?v=lhNdUVh3qCc',
    8: 'https://www.youtube.com/watch?v=vDJpGenyHaA',
    9: 'https://www.youtube.com/watch?v=LteNqj4DFD8',
    10: 'https://www.youtube.com/watch?v=t2CEgPCOSSo'
  },
  java: {
    1: 'https://www.youtube.com/watch?v=GoXwIVyNvX0',
    2: 'https://www.youtube.com/watch?v=xVE7Fh5aO2A',
    3: 'https://www.youtube.com/watch?v=mAtkpqVlFUI',
    4: 'https://www.youtube.com/watch?v=O-Lw2CeeMpg',
    5: 'https://www.youtube.com/watch?v=v7vVtbWyV3I',
    6: 'https://www.youtube.com/watch?v=eZ-5Fp56EHE',
    7: 'https://www.youtube.com/watch?v=XqSMRwbUpI4',
    8: 'https://www.youtube.com/watch?v=IUqKuGNasdM',
    9: 'https://www.youtube.com/watch?v=Mv9NEXX1QAo',
    10: 'https://www.youtube.com/watch?v=RBSGKlAboiM'
  },
  cpp: {
    1: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y',
    2: 'https://www.youtube.com/watch?v=3Iq_o7COt1Y',
    3: 'https://www.youtube.com/watch?v=i0wR-l1p8ts',
    4: 'https://www.youtube.com/watch?v=1v_4Z1N6P2o',
    5: 'https://www.youtube.com/watch?v=7S-T5G8Ssh0',
    6: 'https://www.youtube.com/watch?v=16w5gla3mGk',
    7: 'https://www.youtube.com/watch?v=7V329m1KskE',
    8: 'https://www.youtube.com/watch?v=wN0x9eLVM9M',
    9: 'https://www.youtube.com/watch?v=B31LgI4Y4Is',
    10: 'https://www.youtube.com/watch?v=0IAPZzGSbME'
  }
};
const getLevelConcept = (lang, lvl) => {
  const LangName = lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1);
  switch (lvl) {
    case 1:
      return `# ${LangName} Fundamentals\n\nWelcome to ${LangName}! In this level, we will explore the core structure of ${LangName} programs, basic syntax for printing outputs, and writing comments.\n\n---PAGE_BREAK---\n\n# Basic Syntax\nEvery programming language has a unique code structure:\n\n${lang === 'python' ? `In Python, we use the simple \`print()\` function to output text to the screen. Python code executes line-by-line and does not require semicolons.\n\n\`\`\`python\nprint("Hello, World!")\n\`\`\`` : ''}${lang === 'javascript' ? `In JavaScript, we write code statements executed by the browser or Node.js. We use \`console.log()\` to print outputs.\n\n\`\`\`javascript\nconsole.log("Hello, World!");\n\`\`\`` : ''}${lang === 'java' ? `In Java, every program resides inside a class, and execution starts in the \`main\` method.\n\n\`\`\`java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n\`\`\`` : ''}${lang === 'cpp' ? `In C++, we include the iostream library and execute code statements inside the \`main\` function.\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n\`\`\`` : ''}\n\n---PAGE_BREAK---\n\n# Comments\nComments describe code and improve readability. They are ignored during compilation/execution.\n\n${lang === 'python' ? `Python comments start with a hash symbol \`#\`:\n\n\`\`\`python\n# This is a comment\nprint("Hello, Learner!")\n\`\`\`` : `Single-line comments start with two forward slashes \`//\`. Multi-line comments start with \`/*\` and end with \`*/\`:\n\n\`\`\`${lang}\n// This is a single-line comment\n/* This is a\n   multi-line comment */\n\`\`\``}`;
    case 2:
      return `# Variables & Data Types\n\nVariables are named containers used to store data values in memory. In this level, we will learn variable declaration and basic types.\n\n---PAGE_BREAK---\n\n# Declaring Variables\n\n${lang === 'python' ? `In Python, variables are created automatically upon value assignment. Python is dynamically typed.\n\n\`\`\`python\nx = 5\nname = "Alice"\nprint(x)\nprint(name)\n\`\`\`` : ''}${lang === 'javascript' ? `In JavaScript, we declare variables using \`let\`, \`const\`, or \`var\`. Use \`const\` for read-only constants.\n\n\`\`\`javascript\nconst pi = 3.14;\nlet score = 100;\nscore = 105; // OK\n\`\`\`` : ''}${lang === 'java' ? `Java is strongly typed. You must specify the data type of the variable:\n\n\`\`\`java\nint age = 25;\ndouble salary = 1250.50;\nString name = "Alice";\nboolean isStudent = true;\n\`\`\`` : ''}${lang === 'cpp' ? `C++ is statically typed. You must specify the variable's type before use:\n\n\`\`\`cpp\nint age = 25;\ndouble salary = 1250.50;\nstring name = "Alice";\nbool isStudent = true;\n\`\`\`` : ''}\n\n---PAGE_BREAK---\n\n# Data Types and Operators\nCommon data types include:\n- **Integers**: Whole numbers.\n- **Floats/Doubles**: Decimal values.\n- **Strings**: Textual sequences.\n- **Booleans**: \`true\` or \`false\` states.\n\nUse arithmetic operators like \`+\`, \`-\`, \`*\`, \`/\`, and \`%\` (modulus) to manipulate these values.`;
    case 3:
      return `# Conditional Logic\n\nConditional statements allow your programs to execute different code paths depending on boolean conditions.\n\n---PAGE_BREAK---\n\n# If-Else Statements\n\nWe evaluate boolean expressions to decide which code block runs.\n\n${lang === 'python' ? `\`\`\`python\nscore = 85\nif score >= 90:\n    print("Grade A")\nelif score >= 80:\n    print("Grade B")\nelse:\n    print("Grade C")\n\`\`\`` : `\`\`\`${lang}\nint score = 85;\nif (score >= 90) {\n    ${lang === 'javascript' ? 'console.log("Grade A");' : lang === 'java' ? 'System.out.println("Grade A");' : 'cout << "Grade A" << endl;'}\n} else if (score >= 80) {\n    ${lang === 'javascript' ? 'console.log("Grade B");' : lang === 'java' ? 'System.out.println("Grade B");' : 'cout << "Grade B" << endl;'}\n} else {\n    ${lang === 'javascript' ? 'console.log("Grade C");' : lang === 'java' ? 'System.out.println("Grade C");' : 'cout << "Grade C" << endl;'}\n}\n\`\`\``}\n\n---PAGE_BREAK---\n\n# Logical Operators\nCombine multiple conditions using logical operators:\n- **AND** (\`${lang === 'python' ? 'and' : '&&'}\`): True only if both conditions are true.\n- **OR** (\`${lang === 'python' ? 'or' : '||'}\`): True if at least one condition is true.\n- **NOT** (\`${lang === 'python' ? 'not' : '!'}\`): Reverses the boolean state.`;
    case 4:
      return `# Loops & Iteration\n\nLoops repeat a block of code dynamically until a stopping condition is reached. This is key for working with collections.\n\n---PAGE_BREAK---\n\n# While Loops\n\nThe \`while\` loop repeatedly runs as long as the test condition remains true.\n\n\`\`\`${lang}\n${lang === 'python' ? `count = 1\nwhile count <= 3:\n    print(count)\n    count += 1` : `int count = 1;\nwhile (count <= 3) {\n    ${lang === 'javascript' ? 'console.log(count);' : lang === 'java' ? 'System.out.println(count);' : 'cout << count << endl;'}\n    count++;\n}`}\n\`\`\`\n\n---PAGE_BREAK---\n\n# For Loops\n\n\`for\` loops are commonly used to run a code block a fixed number of times.\n\n\`\`\`${lang}\n${lang === 'python' ? `for i in range(3):\n    print(i)` : ''}${lang === 'javascript' ? `for (let i = 0; i < 3; i++) {\n    console.log(i);\n}` : ''}${lang === 'java' ? `for (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}` : ''}${lang === 'cpp' ? `for (int i = 0; i < 3; i++) {\n    cout << i << endl;\n}` : ''}\n\`\`\``;
    case 5:
      return `# Functions & Reusability\n\nFunctions (or methods) package a group of statements into a single unit that can be executed repeatedly by calling its name.\n\n---PAGE_BREAK---\n\n# Declaring Functions\nFunctions can accept parameters (arguments) and return a computed output value.\n\n\`\`\`${lang}\n${lang === 'python' ? `def add_numbers(a, b):\n    return a + b\n\nresult = add_numbers(5, 7)\nprint(result) # 12` : ''}${lang === 'javascript' ? `function addNumbers(a, b) {\n    return a + b;\n}\n\nconst result = addNumbers(5, 7);\nconsole.log(result); // 12` : ''}${lang === 'java' ? `public class Main {\n    public static int addNumbers(int a, int b) {\n        return a + b;\n    }\n    public static void main(String[] args) {\n        System.out.println(addNumbers(5, 7)); // 12\n    }\n}` : ''}${lang === 'cpp' ? `#include <iostream>\nusing namespace std;\n\nint addNumbers(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    cout << addNumbers(5, 7) << endl; // 12\n    return 0;\n}` : ''}\n\`\`\`\n\n---PAGE_BREAK---\n\n# Local vs Global Scope\n- **Local scope**: Variables declared inside a function exist only within that function.\n- **Global scope**: Variables declared outside functions are accessible anywhere in the file.`;
    case 6:
      return `# Arrays and Lists\n\nArrays/Lists let you group multiple elements of similar or varying types in a single linear sequential data structure.\n\n---PAGE_BREAK---\n\n# Working with Arrays/Lists\n\n\`\`\`${lang}\n${lang === 'python' ? `items = [10, 20, 30]\nprint(items[0]) # 10 (0-based indexing)\nitems.append(40) # Add element` : ''}${lang === 'javascript' ? `const items = [10, 20, 30];\nconsole.log(items[0]); // 10\nitems.push(40); // Add element` : ''}${lang === 'java' ? `int[] items = {10, 20, 30};\nSystem.out.println(items[0]); // 10\n// Fixed size in Java: cannot easily append without creating new array` : ''}${lang === 'cpp' ? `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> items = {10, 20, 30};\n    cout << items[0] << endl; // 10\n    items.push_back(40); // Append element\n}` : ''}\n\`\`\``;
    case 7:
      return `# String Manipulation\n\nStrings are sequences of character objects. Learn common ways to splice, search, and combine text.\n\n---PAGE_BREAK---\n\n# String Operations\n\n\`\`\`${lang}\n${lang === 'python' ? `s1 = "Hello"\ns2 = "World"\nfull = s1 + " " + s2 # Concatenation\nprint(len(full)) # Length: 11\nprint(full[0:5]) # Substring slicing: Hello` : ''}${lang === 'javascript' ? `const s1 = "Hello";\nconst s2 = "World";\nconst full = s1 + " " + s2;\nconsole.log(full.length); // 11\nconsole.log(full.substring(0, 5)); // Hello` : ''}${lang === 'java' ? `String s1 = "Hello";\nString s2 = "World";\nString full = s1 + " " + s2;\nSystem.out.println(full.length()); // 11\nSystem.out.println(full.substring(0, 5)); // Hello` : ''}${lang === 'cpp' ? `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s1 = "Hello";\n    string s2 = "World";\n    string full = s1 + " " + s2;\n    cout << full.length() << endl; // 11\n    cout << full.substr(0, 5) << endl; // Hello\n}` : ''}\n\`\`\``;
    case 8:
      return `# Object-Oriented Programming\n\nOOP is a conceptual programming framework that relies on Classes (blueprints) and Objects (instances) to model real-world concepts.\n\n---PAGE_BREAK---\n\n# Creating Classes and Objects\n\n\`\`\`${lang}\n${lang === 'python' ? `class Student:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def introduce(self):\n        print(f"My name is {self.name}, I am {self.age} years old.")\n\ns = Student("Bob", 20)\ns.introduce()` : ''}${lang === 'javascript' ? `class Student {\n    constructor(name, age) {\n        this.name = name;\n        this.age = age;\n    }\n    introduce() {\n        console.log(\`My name is \${this.name}, I am \${this.age} years old.\`);\n    }\n}\n\nconst s = new Student("Bob", 20);\ns.introduce();` : ''}${lang === 'java' ? `class Student {\n    String name;\n    int age;\n    Student(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n    void introduce() {\n        System.out.println("My name is " + name + ", I am " + age + ".");\n    }\n}\npublic class Main {\n    public static void main(String[] args) {\n        Student s = new Student("Bob", 20);\n        s.introduce();\n    }\n}` : ''}${lang === 'cpp' ? `#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Student {\npublic:\n    string name;\n    int age;\n    Student(string n, int a) : name(n), age(a) {}\n    void introduce() {\n        cout << "My name is " << name << ", I am " << age << "." << endl;\n    }\n};\n\nint main() {\n    Student s("Bob", 20);\n    s.introduce();\n}` : ''}\n\`\`\``;
    case 9:
      return `# Recursion\n\nRecursion is where a function solves a task by calling smaller subsets of itself. Recursion always requires base cases.\n\n---PAGE_BREAK---\n\n# Recursion Mechanics\nEvery recursive solution needs:\n1. **Base Case**: A stopping condition that returns a value directly, preventing infinite loop stacks.\n2. **Recursive Step**: The action of calling the function itself with modified arguments.\n\n\`\`\`${lang}\n# Factorial calculation (n!)\n${lang === 'python' ? `def factorial(n):\n    if n <= 1:\n        return 1 # Base Case\n    return n * factorial(n - 1) # Recursive Step` : ''}${lang === 'javascript' ? `function factorial(n) {\n    if (n <= 1) return 1; // Base Case\n    return n * factorial(n - 1); // Recursive Step\n}` : ''}${lang === 'java' ? `public static int factorial(int n) {\n    if (n <= 1) return 1; // Base Case\n    return n * factorial(n - 1); // Recursive Step\n}` : ''}${lang === 'cpp' ? `int factorial(int n) {\n    if (n <= 1) return 1; // Base Case\n    return n * factorial(n - 1); // Recursive Step\n}` : ''}\n\`\`\``;
    case 10:
      return `# Algorithms & Data Structures\n\nThis final level reviews foundational algorithms for searching and sorting, as well as fundamental structures (Stacks, Queues, Hash Maps).\n\n---PAGE_BREAK---\n\n# Search and Sort Basics\n- **Linear Search**: Scans elements one by one. Time: O(N).\n- **Binary Search**: Fast search on sorted arrays. Time: O(log N).\n- **Hash Maps**: Key-Value dictionary maps that offer fast O(1) average lookup times.\n\n\`\`\`${lang}\n${lang === 'python' ? `# Dictionary Lookup\nstudent = {"id": 101, "name": "Bob"}\nprint(student["name"])` : ''}${lang === 'javascript' ? `// Map object\nconst student = new Map();\nstudent.set("name", "Bob");\nconsole.log(student.get("name"));` : ''}${lang === 'java' ? `import java.util.HashMap;\n\nHashMap<String, String> student = new HashMap<>();\nstudent.put("name", "Bob");\nSystem.out.println(student.get("name"));` : ''}${lang === 'cpp' ? `#include <iostream>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    unordered_map<string, string> student;\n    student["name"] = "Bob";\n    cout << student["name"] << endl;\n}` : ''}\n\`\`\``;
    default:
      return `# Advanced Concepts\n\nContinue practicing code challenges.`;
  }
};

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');
  await Promise.all([User.deleteMany({}), Problem.deleteMany({}), Level.deleteMany({})]);

  // Users — pass plain passwords, pre-save hook will hash them
  const admin = await User.create({ username: 'admin', email: 'admin@codelearn.com', password: 'admin' + '123', role: 'admin', profile: { fullName: 'Platform Admin' } });
  await User.create({ username: 'teacher_john', email: 'teacher@codelearn.com', password: 'teacher123', role: 'teacher', profile: { fullName: 'John Teacher' } });
  await User.create({ username: 'student_alice', email: 'student@codelearn.com', password: 'student123', role: 'student', profile: { fullName: 'Alice Student' }, stats: { problemsSolved: 5, score: 60, streak: 3 } });
  console.log('✅ Users created');

  const languages = ['python', 'javascript', 'java', 'cpp'];
  let totalProblems = 0;
  let totalLevels = 0;

  for (const lang of languages) {
    for (let lvl = 1; lvl <= 10; lvl++) {
      // Insert 10 coding problems for this level
      const problemDefs = getCodingProblems(lang, lvl, admin._id);
      const problems = await Problem.insertMany(problemDefs);
      totalProblems += problems.length;

      const title = lvl === 1 
        ? `${lang.charAt(0).toUpperCase() + lang.slice(1)} Fundamentals` 
        : `${lang.charAt(0).toUpperCase() + lang.slice(1)} Level ${lvl} — ${['','','Conditionals','Loops','Functions','Arrays','Strings','OOP','Recursion','Algorithms','Data Structures'][lvl] || 'Advanced'}`;

      const conceptText = getLevelConcept(lang, lvl);
      const youtubeUrl = youtubeMap[lang]?.[lvl] || '';

      // Create level with 10 MCQs + 10 coding questions
      await Level.create({
        language: lang,
        levelNumber: lvl,
        title,
        conceptText,
        youtubeUrl,
        mcqs: getMCQs(lang, lvl),
        codingQuestions: problems.map(p => p._id),
      });
      totalLevels++;
    }
    console.log(`✅ ${lang}: 10 levels created (10 MCQs + 10 problems each)`);
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   📚 ${totalLevels} levels | 📝 ${totalProblems} problems`);
  console.log(`\n📋 Credentials:`);
  console.log(`   Admin:   admin@codelearn.com   / admin` + `123`);
  console.log(`   Teacher: teacher@codelearn.com / teacher123`);
  console.log(`   Student: student@codelearn.com / student123`);
  process.exit(0);
};

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
