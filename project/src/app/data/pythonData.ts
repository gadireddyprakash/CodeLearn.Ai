import type { MCQQuestion, CodingQuestion } from '../types';

// Python-specific Level 1 MCQ Questions
export const pythonLevel1MCQs: MCQQuestion[] = [
  {
    id: 'mcq-py-1-1',
    question: 'What is the correct way to print "Hello World" in Python?',
    options: [
      'echo("Hello World")',
      'print("Hello World")',
      'console.log("Hello World")',
      'printf("Hello World")'
    ],
    correctAnswer: 1,
    explanation: 'In Python, the print() function is used to output text to the console.'
  },
  {
    id: 'mcq-py-1-2',
    question: 'Which of the following is a valid variable name in Python?',
    options: [
      '2variable',
      'variable-name',
      'variable_name',
      'variable name'
    ],
    correctAnswer: 2,
    explanation: 'Python variable names can contain letters, numbers, and underscores but cannot start with a number or contain spaces or hyphens.'
  },
  {
    id: 'mcq-py-1-3',
    question: 'What is the output of: print(type(5))?',
    options: [
      "<class 'int'>",
      "<class 'float'>",
      "<class 'string'>",
      "<class 'number'>"
    ],
    correctAnswer: 0,
    explanation: 'The type() function returns the data type of a value. 5 is an integer, so it returns <class \'int\'>.'
  },
  {
    id: 'mcq-py-1-4',
    question: 'Which symbol is used for comments in Python?',
    options: [
      '//',
      '/* */',
      '#',
      '--'
    ],
    correctAnswer: 2,
    explanation: 'In Python, the # symbol is used for single-line comments.'
  },
  {
    id: 'mcq-py-1-5',
    question: 'What is the correct way to create a list in Python?',
    options: [
      'list = {1, 2, 3}',
      'list = (1, 2, 3)',
      'list = [1, 2, 3]',
      'list = <1, 2, 3>'
    ],
    correctAnswer: 2,
    explanation: 'Lists in Python are created using square brackets []. Curly braces {} are for dictionaries/sets, and parentheses () are for tuples.'
  },
  {
    id: 'mcq-py-1-6',
    question: 'What does the len() function do?',
    options: [
      'Returns the last element',
      'Returns the length of an object',
      'Returns the type of an object',
      'Converts to a list'
    ],
    correctAnswer: 1,
    explanation: 'The len() function returns the number of items in an object like a list, string, or dictionary.'
  },
  {
    id: 'mcq-py-1-7',
    question: 'Which operator is used for exponentiation in Python?',
    options: [
      '^',
      '**',
      'exp()',
      'pow'
    ],
    correctAnswer: 1,
    explanation: 'The ** operator is used for exponentiation in Python. For example, 2**3 returns 8.'
  },
  {
    id: 'mcq-py-1-8',
    question: 'What is the result of: print(10 // 3)?',
    options: [
      '3.33',
      '3',
      '4',
      '3.0'
    ],
    correctAnswer: 1,
    explanation: 'The // operator performs floor division, which returns the integer part of the division. 10 // 3 = 3.'
  },
  {
    id: 'mcq-py-1-9',
    question: 'Which function is used to get user input in Python?',
    options: [
      'scan()',
      'input()',
      'read()',
      'get()'
    ],
    correctAnswer: 1,
    explanation: 'The input() function is used to read input from the user in Python.'
  },
  {
    id: 'mcq-py-1-10',
    question: 'What is the correct syntax to define a function in Python?',
    options: [
      'function myFunc():',
      'def myFunc():',
      'func myFunc():',
      'define myFunc():'
    ],
    correctAnswer: 1,
    explanation: 'In Python, functions are defined using the def keyword followed by the function name and parentheses.'
  }
];

// Python-specific Level 1 Coding Questions
export const pythonLevel1CodingQuestions: CodingQuestion[] = [
  {
    id: 'code-py-1-1',
    title: 'Print Hello World',
    description: `Write a Python program that prints "Hello, World!" to the console.

**Input:** None

**Output:** Hello, World!

**Example:**
Output: Hello, World!`,
    difficulty: 'Easy',
    starterCode: `# Write your code here
`,
    testCases: [
      { input: '', expectedOutput: 'Hello, World!' },
      { input: '', expectedOutput: 'Hello, World!' },
    ],
    points: 5
  },
  {
    id: 'code-py-1-2',
    title: 'Sum of Two Numbers',
    description: `Write a Python program that adds two numbers and prints the result.

**Input:** Two integers a = 5 and b = 3

**Output:** 8

**Example:**
Input: a = 5, b = 3
Output: 8`,
    difficulty: 'Easy',
    starterCode: `a = 5
b = 3
# Write your code here
`,
    testCases: [
      { input: '5 3', expectedOutput: '8' },
      { input: '10 20', expectedOutput: '30' },
    ],
    points: 5
  },
  {
    id: 'code-py-1-3',
    title: 'Calculate Average',
    description: `Write a program that calculates the average of three numbers.

**Input:** Three integers

**Output:** Average of the three numbers

**Example:**
Input: 10, 20, 30
Output: 20.0`,
    difficulty: 'Easy',
    starterCode: `a, b, c = 10, 20, 30
# Calculate and print average
`,
    testCases: [
      { input: '10 20 30', expectedOutput: '20.0' },
      { input: '5 10 15', expectedOutput: '10.0' },
    ],
    points: 5
  },
  {
    id: 'code-py-1-4',
    title: 'Check Even or Odd',
    description: `Write a program that checks if a number is even or odd.

**Input:** An integer n

**Output:** "Even" or "Odd"

**Example:**
Input: 4
Output: Even`,
    difficulty: 'Easy',
    starterCode: `n = 4
# Check if even or odd
`,
    testCases: [
      { input: '4', expectedOutput: 'Even' },
      { input: '7', expectedOutput: 'Odd' },
    ],
    points: 5
  },
  {
    id: 'code-py-1-5',
    title: 'Find Maximum of Two Numbers',
    description: `Write a program to find the maximum of two numbers.

**Input:** Two integers

**Output:** The larger number

**Example:**
Input: 10, 25
Output: 25`,
    difficulty: 'Easy',
    starterCode: `a = 10
b = 25
# Find and print the maximum
`,
    testCases: [
      { input: '10 25', expectedOutput: '25' },
      { input: '50 30', expectedOutput: '50' },
    ],
    points: 5
  },
  {
    id: 'code-py-1-6',
    title: 'String Length',
    description: `Write a program that finds the length of a string.

**Input:** A string

**Output:** Length of the string

**Example:**
Input: "Python"
Output: 6`,
    difficulty: 'Medium',
    starterCode: `text = "Python"
# Find and print the length
`,
    testCases: [
      { input: 'Python', expectedOutput: '6' },
      { input: 'Hello', expectedOutput: '5' },
    ],
    points: 10
  },
  {
    id: 'code-py-1-7',
    title: 'List Sum',
    description: `Write a program to calculate the sum of all numbers in a list.

**Input:** A list of integers

**Output:** Sum of all numbers

**Example:**
Input: [1, 2, 3, 4, 5]
Output: 15`,
    difficulty: 'Medium',
    starterCode: `numbers = [1, 2, 3, 4, 5]
# Calculate and print sum
`,
    testCases: [
      { input: '1 2 3 4 5', expectedOutput: '15' },
      { input: '10 20 30', expectedOutput: '60' },
    ],
    points: 10
  },
  {
    id: 'code-py-1-8',
    title: 'Count Vowels',
    description: `Write a program to count the number of vowels in a string.

**Input:** A string

**Output:** Number of vowels

**Example:**
Input: "Hello World"
Output: 3`,
    difficulty: 'Medium',
    starterCode: `text = "Hello World"
# Count and print vowels
`,
    testCases: [
      { input: 'Hello World', expectedOutput: '3' },
      { input: 'Python', expectedOutput: '1' },
    ],
    points: 10
  },
  {
    id: 'code-py-1-9',
    title: 'Reverse a String',
    description: `Write a program to reverse a string.

**Input:** A string

**Output:** Reversed string

**Example:**
Input: "Python"
Output: "nohtyP"`,
    difficulty: 'Medium',
    starterCode: `text = "Python"
# Reverse and print
`,
    testCases: [
      { input: 'Python', expectedOutput: 'nohtyP' },
      { input: 'Hello', expectedOutput: 'olleH' },
    ],
    points: 10
  },
  {
    id: 'code-py-1-10',
    title: 'Find Factorial',
    description: `Write a program to find the factorial of a number.

**Input:** An integer n

**Output:** Factorial of n

**Example:**
Input: 5
Output: 120`,
    difficulty: 'Medium',
    starterCode: `n = 5
# Calculate and print factorial
`,
    testCases: [
      { input: '5', expectedOutput: '120' },
      { input: '4', expectedOutput: '24' },
    ],
    points: 10
  },
  {
    id: 'code-py-1-11',
    title: 'Check Prime Number',
    description: `Write a program to check if a number is prime.

**Input:** An integer n

**Output:** "Prime" or "Not Prime"

**Example:**
Input: 7
Output: Prime`,
    difficulty: 'Hard',
    starterCode: `n = 7
# Check and print if prime
`,
    testCases: [
      { input: '7', expectedOutput: 'Prime' },
      { input: '10', expectedOutput: 'Not Prime' },
    ],
    points: 15
  },
  {
    id: 'code-py-1-12',
    title: 'Fibonacci Sequence',
    description: `Write a program to generate the first n Fibonacci numbers.

**Input:** An integer n

**Output:** First n Fibonacci numbers

**Example:**
Input: 5
Output: 0 1 1 2 3`,
    difficulty: 'Hard',
    starterCode: `n = 5
# Generate Fibonacci sequence
`,
    testCases: [
      { input: '5', expectedOutput: '0 1 1 2 3' },
      { input: '7', expectedOutput: '0 1 1 2 3 5 8' },
    ],
    points: 15
  },
  {
    id: 'code-py-1-13',
    title: 'Palindrome Check',
    description: `Write a program to check if a string is a palindrome.

**Input:** A string

**Output:** "Yes" or "No"

**Example:**
Input: "radar"
Output: Yes`,
    difficulty: 'Hard',
    starterCode: `text = "radar"
# Check if palindrome
`,
    testCases: [
      { input: 'radar', expectedOutput: 'Yes' },
      { input: 'hello', expectedOutput: 'No' },
    ],
    points: 15
  },
  {
    id: 'code-py-1-14',
    title: 'Sort a List',
    description: `Write a program to sort a list of numbers in ascending order.

**Input:** A list of integers

**Output:** Sorted list

**Example:**
Input: [5, 2, 8, 1, 9]
Output: [1, 2, 5, 8, 9]`,
    difficulty: 'Hard',
    starterCode: `numbers = [5, 2, 8, 1, 9]
# Sort and print
`,
    testCases: [
      { input: '5 2 8 1 9', expectedOutput: '1 2 5 8 9' },
      { input: '3 1 4 1 5', expectedOutput: '1 1 3 4 5' },
    ],
    points: 15
  },
  {
    id: 'code-py-1-15',
    title: 'Remove Duplicates',
    description: `Write a program to remove duplicates from a list.

**Input:** A list of integers

**Output:** List with unique elements

**Example:**
Input: [1, 2, 2, 3, 4, 4, 5]
Output: [1, 2, 3, 4, 5]`,
    difficulty: 'Hard',
    starterCode: `numbers = [1, 2, 2, 3, 4, 4, 5]
# Remove duplicates and print
`,
    testCases: [
      { input: '1 2 2 3 4 4 5', expectedOutput: '1 2 3 4 5' },
      { input: '5 5 5 6 7', expectedOutput: '5 6 7' },
    ],
    points: 15
  }
];

// Export function to get Python questions by level
export function getPythonMCQs(levelId: number): MCQQuestion[] {
  switch (levelId) {
    case 1:
      return pythonLevel1MCQs;
    default:
      return pythonLevel1MCQs; // For now, use level 1 questions for all levels
  }
}

export function getPythonCodingQuestions(levelId: number): CodingQuestion[] {
  switch (levelId) {
    case 1:
      return pythonLevel1CodingQuestions;
    default:
      return pythonLevel1CodingQuestions; // For now, use level 1 questions for all levels
  }
}
