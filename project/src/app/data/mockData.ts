import type { Level, MCQQuestion, CodingQuestion, UserStats } from '../types';

// Mock data for development - Replace with actual API calls
export const mockLevels: Level[] = [
  {
    id: 1,
    title: "Level 1: Java Basics",
    description: "Introduction to Java fundamentals",
    learningContent: `
# Java Basics - Introduction to Programming

## Page 1: What is Java?

Java is a **high-level, object-oriented programming language** designed to have as few implementation dependencies as possible. It was developed by James Gosling at Sun Microsystems (now owned by Oracle) and released in 1995.

### Why Learn Java?

- **Platform Independent**: Write once, run anywhere (WORA)
- **Object-Oriented**: Everything in Java is an object
- **Secure**: Built-in security features
- **Robust**: Strong memory management
- **Popular**: Used by millions of developers worldwide

---

## Page 2: Setting Up Java

### Installing JDK (Java Development Kit)

1. Download JDK from Oracle's website
2. Install the JDK on your system
3. Set up environment variables (JAVA_HOME, PATH)

### Your First Java Program

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

**Explanation:**
- \`public class HelloWorld\` - Declares a class named HelloWorld
- \`public static void main(String[] args)\` - Entry point of the program
- \`System.out.println()\` - Prints output to console

---

## Page 3: Variables and Data Types

### What are Variables?

Variables are **containers for storing data values**. In Java, each variable must be declared with a data type.

### Primitive Data Types:

\`\`\`java
// Integer types
byte age = 25;           // 8-bit, range: -128 to 127
short year = 2024;       // 16-bit, range: -32,768 to 32,767
int population = 100000; // 32-bit, most commonly used
long distance = 150000L; // 64-bit, for large numbers

// Floating-point types
float price = 19.99f;    // 32-bit, single precision
double salary = 55000.50; // 64-bit, double precision (more precise)

// Character and boolean
char grade = 'A';        // 16-bit Unicode character
boolean isStudent = true; // true or false
\`\`\`

### Reference Data Types:

\`\`\`java
String name = "John Doe";      // String of characters
int[] numbers = {1, 2, 3, 4};  // Array of integers
\`\`\`

---

## Page 4: Operators in Java

### Arithmetic Operators

\`\`\`java
int a = 10, b = 3;

int sum = a + b;        // Addition: 13
int diff = a - b;       // Subtraction: 7
int product = a * b;    // Multiplication: 30
int quotient = a / b;   // Division: 3
int remainder = a % b;  // Modulus: 1
\`\`\`

### Comparison Operators

\`\`\`java
int x = 5, y = 10;

boolean result1 = (x == y);  // Equal to: false
boolean result2 = (x != y);  // Not equal: true
boolean result3 = (x > y);   // Greater than: false
boolean result4 = (x < y);   // Less than: true
boolean result5 = (x >= 5);  // Greater than or equal: true
boolean result6 = (y <= 10); // Less than or equal: true
\`\`\`

### Logical Operators

\`\`\`java
boolean a = true, b = false;

boolean and = a && b;  // AND: false (both must be true)
boolean or = a || b;   // OR: true (at least one must be true)
boolean not = !a;      // NOT: false (inverts the value)
\`\`\`

---

## Page 5: Input and Output

### Reading User Input

\`\`\`java
import java.util.Scanner;

public class InputExample {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        
        System.out.print("Enter your age: ");
        int age = scanner.nextInt();
        
        System.out.println("Hello, " + name + "!");
        System.out.println("You are " + age + " years old.");
        
        scanner.close();
    }
}
\`\`\`

### Common Scanner Methods:

- \`nextLine()\` - Reads a string
- \`nextInt()\` - Reads an integer
- \`nextDouble()\` - Reads a double
- \`nextBoolean()\` - Reads a boolean
- \`next()\` - Reads a single word

**Practice Exercise:** Write a program that asks the user for two numbers and displays their sum.
    `,
    mcqQuestions: [
      {
        id: 'mcq-1-1',
        question: 'What does JDK stand for?',
        options: [
          'Java Development Kit',
          'Java Design Kit',
          'Java Deployment Kit',
          'Java Distribution Kit'
        ],
        correctAnswer: 0,
        explanation: 'JDK stands for Java Development Kit, which includes tools for developing Java applications.'
      },
      {
        id: 'mcq-1-2',
        question: 'Which method is the entry point of a Java program?',
        options: [
          'start()',
          'main()',
          'run()',
          'execute()'
        ],
        correctAnswer: 1,
        explanation: 'The main() method is the entry point where Java program execution begins.'
      },
      {
        id: 'mcq-1-3',
        question: 'What is the size of the int data type in Java?',
        options: [
          '8 bits',
          '16 bits',
          '32 bits',
          '64 bits'
        ],
        correctAnswer: 2,
        explanation: 'The int data type in Java is 32 bits (4 bytes) in size.'
      },
      {
        id: 'mcq-1-4',
        question: 'Which of the following is NOT a primitive data type in Java?',
        options: [
          'int',
          'boolean',
          'String',
          'char'
        ],
        correctAnswer: 2,
        explanation: 'String is a reference data type (class), not a primitive data type.'
      },
      {
        id: 'mcq-1-5',
        question: 'What does the println() method do?',
        options: [
          'Reads input from the user',
          'Prints output to console with a new line',
          'Prints output without a new line',
          'Closes the program'
        ],
        correctAnswer: 1,
        explanation: 'System.out.println() prints output to the console and moves to a new line.'
      },
      {
        id: 'mcq-1-6',
        question: 'Which operator is used to find the remainder of a division?',
        options: [
          '/',
          '%',
          '//',
          'rem'
        ],
        correctAnswer: 1,
        explanation: 'The modulus operator (%) returns the remainder of a division operation.'
      },
      {
        id: 'mcq-1-7',
        question: 'What is the correct way to declare a variable in Java?',
        options: [
          'variable int age;',
          'int age;',
          'var age: int;',
          'age = int;'
        ],
        correctAnswer: 1,
        explanation: 'In Java, variables are declared with the syntax: dataType variableName;'
      },
      {
        id: 'mcq-1-8',
        question: 'Which class is used to read user input in Java?',
        options: [
          'Reader',
          'Input',
          'Scanner',
          'Console'
        ],
        correctAnswer: 2,
        explanation: 'The Scanner class from java.util package is used to read user input.'
      },
      {
        id: 'mcq-1-9',
        question: 'What is the result of 10 % 3 in Java?',
        options: [
          '0',
          '1',
          '3',
          '10'
        ],
        correctAnswer: 1,
        explanation: '10 % 3 returns 1, which is the remainder when 10 is divided by 3.'
      },
      {
        id: 'mcq-1-10',
        question: 'Which of the following is true about Java?',
        options: [
          'Java is platform-dependent',
          'Java is not object-oriented',
          'Java is case-sensitive',
          'Java does not support arrays'
        ],
        correctAnswer: 2,
        explanation: 'Java is case-sensitive, meaning "Variable" and "variable" are different identifiers.'
      }
    ],
    codingQuestions: [
      {
        id: 'code-1-1',
        title: 'Print Hello World',
        description: `Write a Java program that prints "Hello, World!" to the console.

**Input:** None

**Output:** Hello, World!

**Example:**
Output: Hello, World!`,
        difficulty: 'Easy',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        // Write your code here
        
    }
}`,
        testCases: [
          { input: '', expectedOutput: 'Hello, World!' },
          { input: '', expectedOutput: 'Hello, World!' },
        ],
        points: 5
      },
      {
        id: 'code-1-2',
        title: 'Sum of Two Numbers',
        description: `Write a Java program that adds two numbers and prints the result.

**Input:** Two integers a = 5 and b = 3

**Output:** 8

**Example:**
Input: a = 5, b = 3
Output: 8`,
        difficulty: 'Easy',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int a = 5;
        int b = 3;
        // Write your code here
        
    }
}`,
        testCases: [
          { input: '5 3', expectedOutput: '8' },
          { input: '10 20', expectedOutput: '30' },
        ],
        points: 5
      },
      {
        id: 'code-1-3',
        title: 'Calculate Average',
        description: `Write a program that calculates the average of three numbers.

**Input:** Three integers

**Output:** Average of the three numbers

**Example:**
Input: 10, 20, 30
Output: 20.0`,
        difficulty: 'Easy',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int a = 10, b = 20, c = 30;
        // Calculate and print average
        
    }
}`,
        testCases: [
          { input: '10 20 30', expectedOutput: '20.0' },
          { input: '5 10 15', expectedOutput: '10.0' },
        ],
        points: 5
      },
      {
        id: 'code-1-4',
        title: 'Even or Odd',
        description: `Write a program that determines if a number is even or odd.

**Input:** An integer

**Output:** "Even" or "Odd"

**Example:**
Input: 4
Output: Even`,
        difficulty: 'Easy',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int number = 4;
        // Write your code here
        
    }
}`,
        testCases: [
          { input: '4', expectedOutput: 'Even' },
          { input: '7', expectedOutput: 'Odd' },
        ],
        points: 5
      },
      {
        id: 'code-1-5',
        title: 'Rectangle Area',
        description: `Calculate the area of a rectangle given length and width.

**Input:** Two integers (length and width)

**Output:** Area of rectangle

**Example:**
Input: length = 5, width = 3
Output: 15`,
        difficulty: 'Easy',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int length = 5;
        int width = 3;
        // Calculate area
        
    }
}`,
        testCases: [
          { input: '5 3', expectedOutput: '15' },
          { input: '10 4', expectedOutput: '40' },
        ],
        points: 5
      },
      {
        id: 'code-1-6',
        title: 'Temperature Converter',
        description: `Convert temperature from Celsius to Fahrenheit.
Formula: F = (C × 9/5) + 32

**Input:** Temperature in Celsius

**Output:** Temperature in Fahrenheit

**Example:**
Input: 0
Output: 32.0`,
        difficulty: 'Medium',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        double celsius = 0;
        // Convert to Fahrenheit
        
    }
}`,
        testCases: [
          { input: '0', expectedOutput: '32.0' },
          { input: '100', expectedOutput: '212.0' },
        ],
        points: 10
      },
      {
        id: 'code-1-7',
        title: 'Swap Two Numbers',
        description: `Write a program that swaps two numbers without using a third variable.

**Input:** Two integers

**Output:** Swapped values

**Example:**
Input: a = 5, b = 10
Output: a = 10, b = 5`,
        difficulty: 'Medium',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int a = 5;
        int b = 10;
        // Swap the numbers
        
    }
}`,
        testCases: [
          { input: '5 10', expectedOutput: '10 5' },
          { input: '3 7', expectedOutput: '7 3' },
        ],
        points: 10
      },
      {
        id: 'code-1-8',
        title: 'Simple Interest Calculator',
        description: `Calculate simple interest using the formula: SI = (P × R × T) / 100

**Input:** Principal (P), Rate (R), Time (T)

**Output:** Simple Interest

**Example:**
Input: P = 1000, R = 5, T = 2
Output: 100.0`,
        difficulty: 'Medium',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        double principal = 1000;
        double rate = 5;
        double time = 2;
        // Calculate simple interest
        
    }
}`,
        testCases: [
          { input: '1000 5 2', expectedOutput: '100.0' },
          { input: '5000 7 3', expectedOutput: '1050.0' },
        ],
        points: 10
      },
      {
        id: 'code-1-9',
        title: 'Largest of Three Numbers',
        description: `Find the largest among three numbers.

**Input:** Three integers

**Output:** The largest number

**Example:**
Input: 10, 25, 15
Output: 25`,
        difficulty: 'Medium',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int a = 10, b = 25, c = 15;
        // Find largest
        
    }
}`,
        testCases: [
          { input: '10 25 15', expectedOutput: '25' },
          { input: '100 50 75', expectedOutput: '100' },
        ],
        points: 10
      },
      {
        id: 'code-1-10',
        title: 'Grade Calculator',
        description: `Assign grades based on marks:
- 90-100: A
- 80-89: B
- 70-79: C
- 60-69: D
- Below 60: F

**Input:** Marks (0-100)

**Output:** Grade

**Example:**
Input: 85
Output: B`,
        difficulty: 'Medium',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int marks = 85;
        // Calculate grade
        
    }
}`,
        testCases: [
          { input: '85', expectedOutput: 'B' },
          { input: '95', expectedOutput: 'A' },
          { input: '55', expectedOutput: 'F' },
        ],
        points: 10
      },
      {
        id: 'code-1-11',
        title: 'Leap Year Checker',
        description: `Determine if a year is a leap year.
A year is a leap year if:
- It is divisible by 4 AND
- Either not divisible by 100 OR divisible by 400

**Input:** Year

**Output:** "Leap Year" or "Not a Leap Year"

**Example:**
Input: 2024
Output: Leap Year`,
        difficulty: 'Hard',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int year = 2024;
        // Check if leap year
        
    }
}`,
        testCases: [
          { input: '2024', expectedOutput: 'Leap Year' },
          { input: '1900', expectedOutput: 'Not a Leap Year' },
          { input: '2000', expectedOutput: 'Leap Year' },
        ],
        points: 15
      },
      {
        id: 'code-1-12',
        title: 'Power Calculator',
        description: `Calculate x raised to the power of y without using Math.pow().

**Input:** Two integers x and y

**Output:** x^y

**Example:**
Input: x = 2, y = 3
Output: 8`,
        difficulty: 'Hard',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int x = 2;
        int y = 3;
        // Calculate power
        
    }
}`,
        testCases: [
          { input: '2 3', expectedOutput: '8' },
          { input: '5 2', expectedOutput: '25' },
          { input: '3 4', expectedOutput: '81' },
        ],
        points: 15
      },
      {
        id: 'code-1-13',
        title: 'Reverse a Number',
        description: `Reverse the digits of a given number.

**Input:** An integer

**Output:** Reversed number

**Example:**
Input: 12345
Output: 54321`,
        difficulty: 'Hard',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int number = 12345;
        // Reverse the number
        
    }
}`,
        testCases: [
          { input: '12345', expectedOutput: '54321' },
          { input: '9876', expectedOutput: '6789' },
        ],
        points: 15
      },
      {
        id: 'code-1-14',
        title: 'Sum of Digits',
        description: `Calculate the sum of all digits in a number.

**Input:** An integer

**Output:** Sum of its digits

**Example:**
Input: 1234
Output: 10`,
        difficulty: 'Hard',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int number = 1234;
        // Calculate sum of digits
        
    }
}`,
        testCases: [
          { input: '1234', expectedOutput: '10' },
          { input: '999', expectedOutput: '27' },
        ],
        points: 15
      },
      {
        id: 'code-1-15',
        title: 'Armstrong Number',
        description: `Check if a number is an Armstrong number.
An Armstrong number is equal to the sum of cubes of its digits.
Example: 153 = 1³ + 5³ + 3³ = 1 + 125 + 27 = 153

**Input:** An integer

**Output:** "Armstrong Number" or "Not an Armstrong Number"

**Example:**
Input: 153
Output: Armstrong Number`,
        difficulty: 'Hard',
        starterCode: `public class Solution {
    public static void main(String[] args) {
        int number = 153;
        // Check if Armstrong number
        
    }
}`,
        testCases: [
          { input: '153', expectedOutput: 'Armstrong Number' },
          { input: '370', expectedOutput: 'Armstrong Number' },
          { input: '123', expectedOutput: 'Not an Armstrong Number' },
        ],
        points: 15
      }
    ],
    isLocked: false,
  },
  {
    id: 2,
    title: "Level 2: Control Structures",
    description: "Learn about if-else, loops, and conditionals",
    learningContent: `
# Control Structures - Making Decisions

## Page 1: Introduction to Control Flow

Control structures allow your program to make decisions and execute code based on conditions. They are the building blocks of program logic.

### Types of Control Structures:

1. **Sequential** - Code executes line by line
2. **Selection** - If-else statements (conditional execution)
3. **Iteration** - Loops (repeated execution)

---

## Page 2: If-Else Statements

### Basic If Statement

\`\`\`java
int age = 18;

if (age >= 18) {
    System.out.println("You are an adult");
}
\`\`\`

### If-Else Statement

\`\`\`java
int temperature = 25;

if (temperature > 30) {
    System.out.println("It's hot outside");
} else {
    System.out.println("Weather is pleasant");
}
\`\`\`

### If-Else-If Ladder

\`\`\`java
int score = 85;

if (score >= 90) {
    System.out.println("Grade: A");
} else if (score >= 80) {
    System.out.println("Grade: B");
} else if (score >= 70) {
    System.out.println("Grade: C");
} else if (score >= 60) {
    System.out.println("Grade: D");
} else {
    System.out.println("Grade: F");
}
\`\`\`

### Nested If Statements

\`\`\`java
int age = 20;
boolean hasLicense = true;

if (age >= 18) {
    if (hasLicense) {
        System.out.println("You can drive");
    } else {
        System.out.println("You need a license");
    }
} else {
    System.out.println("You are too young to drive");
}
\`\`\`

---

## Page 3: Switch Statement

The switch statement is used when you have multiple conditions based on a single variable.

\`\`\`java
int day = 3;
String dayName;

switch (day) {
    case 1:
        dayName = "Monday";
        break;
    case 2:
        dayName = "Tuesday";
        break;
    case 3:
        dayName = "Wednesday";
        break;
    case 4:
        dayName = "Thursday";
        break;
    case 5:
        dayName = "Friday";
        break;
    case 6:
        dayName = "Saturday";
        break;
    case 7:
        dayName = "Sunday";
        break;
    default:
        dayName = "Invalid day";
}

System.out.println("Day: " + dayName);
\`\`\`

**Important:** Don't forget the \`break\` statement! Without it, execution will "fall through" to the next case.

---

## Page 4: For Loop

The for loop is used when you know exactly how many times you want to repeat code.

### Basic For Loop

\`\`\`java
for (int i = 1; i <= 5; i++) {
    System.out.println("Count: " + i);
}
// Output: Count: 1, Count: 2, Count: 3, Count: 4, Count: 5
\`\`\`

### Syntax Breakdown:
- **Initialization**: \`int i = 1\` - executed once at the start
- **Condition**: \`i <= 5\` - checked before each iteration
- **Update**: \`i++\` - executed after each iteration

### Examples:

\`\`\`java
// Print even numbers from 2 to 10
for (int i = 2; i <= 10; i += 2) {
    System.out.println(i);
}

// Countdown
for (int i = 10; i >= 1; i--) {
    System.out.println(i);
}
System.out.println("Blast off!");

// Multiplication table
int number = 5;
for (int i = 1; i <= 10; i++) {
    System.out.println(number + " x " + i + " = " + (number * i));
}
\`\`\`

---

## Page 5: While and Do-While Loops

### While Loop

Repeats code while a condition is true. The condition is checked **before** each iteration.

\`\`\`java
int count = 1;

while (count <= 5) {
    System.out.println("Count: " + count);
    count++;
}
\`\`\`

### Do-While Loop

Similar to while loop, but the condition is checked **after** each iteration. This guarantees the code runs at least once.

\`\`\`java
int count = 1;

do {
    System.out.println("Count: " + count);
    count++;
} while (count <= 5);
\`\`\`

### Example: Input Validation

\`\`\`java
Scanner scanner = new Scanner(System.in);
int number;

do {
    System.out.print("Enter a positive number: ");
    number = scanner.nextInt();
} while (number <= 0);

System.out.println("You entered: " + number);
\`\`\`

---

## Page 6: Break and Continue

### Break Statement

Exits the loop immediately.

\`\`\`java
for (int i = 1; i <= 10; i++) {
    if (i == 5) {
        break; // Exit loop when i is 5
    }
    System.out.println(i);
}
// Output: 1, 2, 3, 4
\`\`\`

### Continue Statement

Skips the current iteration and continues with the next one.

\`\`\`java
for (int i = 1; i <= 5; i++) {
    if (i == 3) {
        continue; // Skip when i is 3
    }
    System.out.println(i);
}
// Output: 1, 2, 4, 5 (3 is skipped)
\`\`\`

### Practical Example:

\`\`\`java
// Print only odd numbers
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        continue; // Skip even numbers
    }
    System.out.println(i);
}
\`\`\`

---

## Page 7: Nested Loops

Loops inside loops - useful for working with multi-dimensional data.

\`\`\`java
// Print a 5x5 star pattern
for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= 5; j++) {
        System.out.print("* ");
    }
    System.out.println(); // New line after each row
}

// Output:
// * * * * *
// * * * * *
// * * * * *
// * * * * *
// * * * * *
\`\`\`

### Triangle Pattern:

\`\`\`java
for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= i; j++) {
        System.out.print("* ");
    }
    System.out.println();
}

// Output:
// *
// * *
// * * *
// * * * *
// * * * * *
\`\`\`
    `,
    mcqQuestions: [
      {
        id: 'mcq-2-1',
        question: 'What is the output of the following code?\nint x = 5;\nif (x > 3) {\n  System.out.println("Hello");\n}',
        options: ['Hello', 'No output', 'Error', '5'],
        correctAnswer: 0,
        explanation: 'Since x (5) is greater than 3, the condition is true and "Hello" is printed.'
      },
      {
        id: 'mcq-2-2',
        question: 'Which loop guarantees at least one execution?',
        options: ['for loop', 'while loop', 'do-while loop', 'None of the above'],
        correctAnswer: 2,
        explanation: 'The do-while loop checks the condition after execution, so it always runs at least once.'
      },
      {
        id: 'mcq-2-3',
        question: 'What does the break statement do in a loop?',
        options: [
          'Skips the current iteration',
          'Exits the loop immediately',
          'Restarts the loop',
          'Pauses the loop'
        ],
        correctAnswer: 1,
        explanation: 'The break statement terminates the loop and transfers control to the statement after the loop.'
      },
      {
        id: 'mcq-2-4',
        question: 'In a switch statement, what happens if you forget the break statement?',
        options: [
          'Compilation error',
          'Runtime error',
          'Fall-through to next case',
          'Nothing happens'
        ],
        correctAnswer: 2,
        explanation: 'Without break, execution continues into the next case (fall-through behavior).'
      },
      {
        id: 'mcq-2-5',
        question: 'What is the initial value of i in: for(int i = 0; i < 5; i++)?',
        options: ['0', '1', '5', 'Undefined'],
        correctAnswer: 0,
        explanation: 'The initialization int i = 0 sets i to 0 at the start of the loop.'
      },
      {
        id: 'mcq-2-6',
        question: 'How many times will this loop execute?\nfor(int i = 1; i <= 10; i += 2)',
        options: ['5', '10', '11', 'Infinite'],
        correctAnswer: 0,
        explanation: 'The loop starts at 1 and increments by 2 each time: 1, 3, 5, 7, 9. Total: 5 times.'
      },
      {
        id: 'mcq-2-7',
        question: 'What does the continue statement do?',
        options: [
          'Exits the loop',
          'Skips to next iteration',
          'Restarts from beginning',
          'Stops the program'
        ],
        correctAnswer: 1,
        explanation: 'Continue skips the rest of the current iteration and moves to the next one.'
      },
      {
        id: 'mcq-2-8',
        question: 'Which statement is used for multiple conditions on a single variable?',
        options: ['if-else', 'switch', 'while', 'for'],
        correctAnswer: 1,
        explanation: 'The switch statement is ideal for checking multiple values of a single variable.'
      },
      {
        id: 'mcq-2-9',
        question: 'What is a nested loop?',
        options: [
          'A loop with no condition',
          'A loop inside another loop',
          'A loop that never ends',
          'A loop with multiple variables'
        ],
        correctAnswer: 1,
        explanation: 'A nested loop is a loop placed inside another loop.'
      },
      {
        id: 'mcq-2-10',
        question: 'Which keyword is NOT used in control structures?',
        options: ['if', 'else', 'loop', 'switch'],
        correctAnswer: 2,
        explanation: '"loop" is not a keyword in Java. We use for, while, or do-while for loops.'
      }
    ],
    codingQuestions: generateLevel2CodingQuestions(),
    isLocked: true,
  },
  // Continue with remaining levels...
  {
    id: 3,
    title: "Level 3: Arrays & Strings",
    description: "Working with collections of data",
    learningContent: generateLevel3Content(),
    mcqQuestions: generateLevel3MCQs(),
    codingQuestions: generateLevel3CodingQuestions(),
    isLocked: true,
  },
  {
    id: 4,
    title: "Level 4: Methods & Functions",
    description: "Create reusable code blocks",
    learningContent: generateLevel4Content(),
    mcqQuestions: generateLevel4MCQs(),
    codingQuestions: generateLevel4CodingQuestions(),
    isLocked: true,
  },
  {
    id: 5,
    title: "Level 5: Object-Oriented Programming Basics",
    description: "Classes, objects, and constructors",
    learningContent: generateLevel5Content(),
    mcqQuestions: generateLevel5MCQs(),
    codingQuestions: generateLevel5CodingQuestions(),
    isLocked: true,
  },
  {
    id: 6,
    title: "Level 6: OOP Advanced - Inheritance & Polymorphism",
    description: "Advanced OOP concepts",
    learningContent: generateLevel6Content(),
    mcqQuestions: generateLevel6MCQs(),
    codingQuestions: generateLevel6CodingQuestions(),
    isLocked: true,
  },
  {
    id: 7,
    title: "Level 7: Exception Handling",
    description: "Handle errors gracefully",
    learningContent: generateLevel7Content(),
    mcqQuestions: generateLevel7MCQs(),
    codingQuestions: generateLevel7CodingQuestions(),
    isLocked: true,
  },
  {
    id: 8,
    title: "Level 8: Collections Framework",
    description: "Lists, Sets, Maps, and algorithms",
    learningContent: generateLevel8Content(),
    mcqQuestions: generateLevel8MCQs(),
    codingQuestions: generateLevel8CodingQuestions(),
    isLocked: true,
  },
  {
    id: 9,
    title: "Level 9: File I/O & Serialization",
    description: "Reading, writing, and persisting data",
    learningContent: generateLevel9Content(),
    mcqQuestions: generateLevel9MCQs(),
    codingQuestions: generateLevel9CodingQuestions(),
    isLocked: true,
  },
  {
    id: 10,
    title: "Level 10: Advanced Java - Streams, Lambda & Threads",
    description: "Modern Java features and multithreading",
    learningContent: generateLevel10Content(),
    mcqQuestions: generateLevel10MCQs(),
    codingQuestions: generateLevel10CodingQuestions(),
    isLocked: true,
  },
];

// Helper functions for Level 2 coding questions
function generateLevel2CodingQuestions(): CodingQuestion[] {
  return [
    {
      id: 'code-2-1',
      title: 'Print Numbers 1 to 10',
      description: 'Write a program using a for loop to print numbers from 1 to 10.',
      difficulty: 'Easy',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
      testCases: [
        { input: '', expectedOutput: '1 2 3 4 5 6 7 8 9 10' }
      ],
      points: 5
    },
    {
      id: 'code-2-2',
      title: 'Sum of First N Numbers',
      description: 'Calculate the sum of first N natural numbers using a loop.',
      difficulty: 'Easy',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int n = 10;\n        // Calculate sum\n    }\n}',
      testCases: [
        { input: '10', expectedOutput: '55' },
        { input: '5', expectedOutput: '15' }
      ],
      points: 5
    },
    {
      id: 'code-2-3',
      title: 'Factorial Calculator',
      description: 'Calculate factorial of a number using a loop.',
      difficulty: 'Easy',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int n = 5;\n        // Calculate factorial\n    }\n}',
      testCases: [
        { input: '5', expectedOutput: '120' },
        { input: '4', expectedOutput: '24' }
      ],
      points: 5
    },
    {
      id: 'code-2-4',
      title: 'Multiplication Table',
      description: 'Print multiplication table of a given number.',
      difficulty: 'Easy',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int n = 5;\n        // Print table\n    }\n}',
      testCases: [
        { input: '5', expectedOutput: '5 10 15 20 25 30 35 40 45 50' }
      ],
      points: 5
    },
    {
      id: 'code-2-5',
      title: 'Count Digits',
      description: 'Count the number of digits in an integer.',
      difficulty: 'Easy',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int number = 12345;\n        // Count digits\n    }\n}',
      testCases: [
        { input: '12345', expectedOutput: '5' },
        { input: '999', expectedOutput: '3' }
      ],
      points: 5
    },
    {
      id: 'code-2-6',
      title: 'Prime Number Checker',
      description: 'Check if a number is prime.',
      difficulty: 'Medium',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int n = 17;\n        // Check if prime\n    }\n}',
      testCases: [
        { input: '17', expectedOutput: 'Prime' },
        { input: '10', expectedOutput: 'Not Prime' }
      ],
      points: 10
    },
    {
      id: 'code-2-7',
      title: 'Fibonacci Series',
      description: 'Print first N Fibonacci numbers.',
      difficulty: 'Medium',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int n = 10;\n        // Print Fibonacci\n    }\n}',
      testCases: [
        { input: '10', expectedOutput: '0 1 1 2 3 5 8 13 21 34' }
      ],
      points: 10
    },
    {
      id: 'code-2-8',
      title: 'Pattern Printing - Triangle',
      description: 'Print a right-angled triangle pattern with stars.',
      difficulty: 'Medium',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int n = 5;\n        // Print pattern\n    }\n}',
      testCases: [
        { input: '5', expectedOutput: '*\\n**\\n***\\n****\\n*****' }
      ],
      points: 10
    },
    {
      id: 'code-2-9',
      title: 'Palindrome Number',
      description: 'Check if a number is a palindrome.',
      difficulty: 'Medium',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int n = 121;\n        // Check palindrome\n    }\n}',
      testCases: [
        { input: '121', expectedOutput: 'Palindrome' },
        { input: '123', expectedOutput: 'Not Palindrome' }
      ],
      points: 10
    },
    {
      id: 'code-2-10',
      title: 'GCD Calculator',
      description: 'Find the Greatest Common Divisor of two numbers using Euclidean algorithm.',
      difficulty: 'Medium',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int a = 48, b = 18;\n        // Find GCD\n    }\n}',
      testCases: [
        { input: '48 18', expectedOutput: '6' },
        { input: '100 50', expectedOutput: '50' }
      ],
      points: 10
    },
    {
      id: 'code-2-11',
      title: 'Binary to Decimal',
      description: 'Convert a binary number to decimal.',
      difficulty: 'Hard',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int binary = 1010;\n        // Convert to decimal\n    }\n}',
      testCases: [
        { input: '1010', expectedOutput: '10' },
        { input: '1111', expectedOutput: '15' }
      ],
      points: 15
    },
    {
      id: 'code-2-12',
      title: 'Perfect Number',
      description: 'Check if a number is perfect (sum of divisors equals the number).',
      difficulty: 'Hard',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int n = 28;\n        // Check perfect number\n    }\n}',
      testCases: [
        { input: '28', expectedOutput: 'Perfect' },
        { input: '12', expectedOutput: 'Not Perfect' }
      ],
      points: 15
    },
    {
      id: 'code-2-13',
      title: 'Diamond Pattern',
      description: 'Print a diamond pattern using stars.',
      difficulty: 'Hard',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int n = 5;\n        // Print diamond\n    }\n}',
      testCases: [
        { input: '5', expectedOutput: 'diamond pattern' }
      ],
      points: 15
    },
    {
      id: 'code-2-14',
      title: 'LCM Calculator',
      description: 'Find the Least Common Multiple of two numbers.',
      difficulty: 'Hard',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int a = 12, b = 18;\n        // Find LCM\n    }\n}',
      testCases: [
        { input: '12 18', expectedOutput: '36' },
        { input: '5 7', expectedOutput: '35' }
      ],
      points: 15
    },
    {
      id: 'code-2-15',
      title: 'Sum of Prime Numbers',
      description: 'Find the sum of all prime numbers up to N.',
      difficulty: 'Hard',
      starterCode: 'public class Solution {\n    public static void main(String[] args) {\n        int n = 10;\n        // Sum primes\n    }\n}',
      testCases: [
        { input: '10', expectedOutput: '17' }, // 2+3+5+7
        { input: '20', expectedOutput: '77' }
      ],
      points: 15
    }
  ];
}

// Content generation functions for other levels
function generateLevel3Content(): string {
  return `
# Arrays & Strings - Working with Collections

## Page 1: Introduction to Arrays

An **array** is a container that holds a fixed number of values of a single type.

### Declaring Arrays

\`\`\`java
// Declaration
int[] numbers;              // Preferred
int numbers[];              // Also valid

// Declaration with initialization
int[] numbers = new int[5];  // Array of 5 integers

// Declaration with values
int[] numbers = {1, 2, 3, 4, 5};
\`\`\`

### Accessing Array Elements

\`\`\`java
int[] numbers = {10, 20, 30, 40, 50};

System.out.println(numbers[0]);  // Output: 10 (first element)
System.out.println(numbers[2]);  // Output: 30 (third element)

// Modifying elements
numbers[1] = 25;
System.out.println(numbers[1]);  // Output: 25
\`\`\`

**Important:** Array indices start at 0!

---

## Page 2: Array Operations

### Getting Array Length

\`\`\`java
int[] numbers = {1, 2, 3, 4, 5};
System.out.println("Length: " + numbers.length);  // Output: 5
\`\`\`

### Iterating Through Arrays

\`\`\`java
int[] numbers = {10, 20, 30, 40, 50};

// Using for loop
for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}

// Using enhanced for loop (for-each)
for (int num : numbers) {
    System.out.println(num);
}
\`\`\`

### Common Array Operations

\`\`\`java
// Find sum
int[] numbers = {1, 2, 3, 4, 5};
int sum = 0;
for (int num : numbers) {
    sum += num;
}
System.out.println("Sum: " + sum);  // Output: 15

// Find maximum
int max = numbers[0];
for (int num : numbers) {
    if (num > max) {
        max = num;
    }
}
System.out.println("Max: " + max);
\`\`\`

---

## Page 3: Multi-dimensional Arrays

Arrays can have multiple dimensions (arrays of arrays).

### 2D Arrays

\`\`\`java
// Declaration
int[][] matrix = new int[3][3];  // 3x3 matrix

// Initialization
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Accessing elements
System.out.println(matrix[0][0]);  // Output: 1
System.out.println(matrix[1][2]);  // Output: 6

// Iterating through 2D array
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}
\`\`\`

---

## Page 4: Introduction to Strings

A **String** is a sequence of characters.

### Creating Strings

\`\`\`java
// Using string literal
String name = "John Doe";

// Using new keyword
String name2 = new String("John Doe");

// Empty string
String empty = "";
\`\`\`

### String Length

\`\`\`java
String text = "Hello, World!";
System.out.println(text.length());  // Output: 13
\`\`\`

### Accessing Characters

\`\`\`java
String text = "Java";
System.out.println(text.charAt(0));  // Output: J
System.out.println(text.charAt(3));  // Output: a
\`\`\`

---

## Page 5: String Methods

### Common String Operations

\`\`\`java
String text = "Hello, World!";

// Convert to uppercase/lowercase
System.out.println(text.toUpperCase());  // HELLO, WORLD!
System.out.println(text.toLowerCase());  // hello, world!

// Check if contains substring
System.out.println(text.contains("World"));  // true

// Replace characters
System.out.println(text.replace("World", "Java"));  // Hello, Java!

// Substring
System.out.println(text.substring(0, 5));  // Hello

// Split string
String[] words = text.split(", ");
for (String word : words) {
    System.out.println(word);
}
// Output: Hello
//         World!

// Trim whitespace
String padded = "  Hello  ";
System.out.println(padded.trim());  // Hello
\`\`\`

---

## Page 6: String Comparison

### Comparing Strings

\`\`\`java
String str1 = "Hello";
String str2 = "Hello";
String str3 = "hello";

// Using equals() - correct way
System.out.println(str1.equals(str2));     // true
System.out.println(str1.equals(str3));     // false

// Case-insensitive comparison
System.out.println(str1.equalsIgnoreCase(str3));  // true

// Using == (compares references, not content)
System.out.println(str1 == str2);  // May be true or false

// Compare lexicographically
System.out.println(str1.compareTo(str2));  // 0 (equal)
System.out.println(str1.compareTo(str3));  // negative (str1 < str3)
\`\`\`

**Important:** Always use \`.equals()\` to compare string contents, not \`==\`!

---

## Page 7: StringBuilder

For efficient string manipulation, use StringBuilder.

\`\`\`java
StringBuilder sb = new StringBuilder("Hello");

// Append
sb.append(" World");
System.out.println(sb);  // Hello World

// Insert
sb.insert(5, ",");
System.out.println(sb);  // Hello, World

// Delete
sb.delete(5, 6);
System.out.println(sb);  // Hello World

// Reverse
sb.reverse();
System.out.println(sb);  // dlroW olleH

// Convert to String
String result = sb.toString();
\`\`\`

**Why StringBuilder?** Strings are immutable. Every modification creates a new string object. StringBuilder modifies the same object, making it much more efficient for multiple modifications.
  `;
}

function generateLevel3MCQs(): MCQQuestion[] {
  return [
    {
      id: 'mcq-3-1',
      question: 'What is the index of the first element in an array?',
      options: ['0', '1', '-1', 'Depends on declaration'],
      correctAnswer: 0,
      explanation: 'Array indices in Java start at 0.'
    },
    {
      id: 'mcq-3-2',
      question: 'How do you find the length of an array?',
      options: ['array.length', 'array.length()', 'array.size()', 'array.count'],
      correctAnswer: 0,
      explanation: 'Use the length property (not a method) to get array length.'
    },
    {
      id: 'mcq-3-3',
      question: 'Which method is used to compare string contents?',
      options: ['==', 'equals()', 'compare()', 'isEqual()'],
      correctAnswer: 1,
      explanation: 'equals() method compares the actual content of strings.'
    },
    {
      id: 'mcq-3-4',
      question: 'What will "Hello".charAt(0) return?',
      options: ['H', 'h', '0', 'e'],
      correctAnswer: 0,
      explanation: 'charAt(0) returns the first character, which is "H".'
    },
    {
      id: 'mcq-3-5',
      question: 'Are strings mutable in Java?',
      options: ['Yes', 'No', 'Depends on declaration', 'Only with StringBuilder'],
      correctAnswer: 1,
      explanation: 'Strings are immutable in Java. Once created, they cannot be changed.'
    },
    {
      id: 'mcq-3-6',
      question: 'What is the correct syntax to create a 2D array?',
      options: [
        'int[][] arr = new int[3][3];',
        'int arr[][] = new [3][3];',
        'array int[3][3];',
        'int[3][3] arr;'
      ],
      correctAnswer: 0,
      explanation: 'int[][] arr = new int[rows][cols]; is the correct syntax.'
    },
    {
      id: 'mcq-3-7',
      question: 'Which class is used for efficient string manipulation?',
      options: ['String', 'StringBuffer', 'StringBuilder', 'Both B and C'],
      correctAnswer: 3,
      explanation: 'Both StringBuffer and StringBuilder are used for mutable strings. StringBuilder is faster.'
    },
    {
      id: 'mcq-3-8',
      question: 'What does "Hello".substring(1, 4) return?',
      options: ['ell', 'ello', 'Hell', 'Hel'],
      correctAnswer: 0,
      explanation: 'substring(1, 4) returns characters from index 1 to 3 (4 is exclusive): "ell"'
    },
    {
      id: 'mcq-3-9',
      question: 'How do you declare an array with initial values?',
      options: [
        'int[] arr = {1, 2, 3};',
        'int arr[] = new [1, 2, 3];',
        'array arr = {1, 2, 3};',
        'int[3] arr = {1, 2, 3};'
      ],
      correctAnswer: 0,
      explanation: 'Use curly braces {} to initialize an array with values.'
    },
    {
      id: 'mcq-3-10',
      question: 'What happens if you access an invalid array index?',
      options: [
        'Returns null',
        'Returns 0',
        'ArrayIndexOutOfBoundsException',
        'Compilation error'
      ],
      correctAnswer: 2,
      explanation: 'Accessing an invalid index throws ArrayIndexOutOfBoundsException at runtime.'
    }
  ];
}

function generateLevel3CodingQuestions(): CodingQuestion[] {
  const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = [
    'Easy', 'Easy', 'Easy', 'Easy', 'Easy',
    'Medium', 'Medium', 'Medium', 'Medium', 'Medium',
    'Hard', 'Hard', 'Hard', 'Hard', 'Hard'
  ];

  const questions = [
    'Find Maximum in Array',
    'Array Sum',
    'Reverse an Array',
    'Count Vowels in String',
    'Find Array Average',
    'Remove Duplicates from Array',
    'Check if String is Palindrome',
    'Merge Two Arrays',
    'Find Second Largest Element',
    'Count Words in String',
    'Sort Array (Bubble Sort)',
    'Anagram Checker',
    'Array Rotation',
    'Longest Substring Without Repeating Characters',
    'Matrix Transpose'
  ];

  return difficulties.map((difficulty, i) => ({
    id: `code-3-${i + 1}`,
    title: questions[i],
    description: `Solve this ${difficulty} problem related to arrays and strings.`,
    difficulty,
    starterCode: `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    testCases: [
      { input: 'test1', expectedOutput: 'output1' },
      { input: 'test2', expectedOutput: 'output2' }
    ],
    points: difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15
  }));
}

// Similar functions for levels 4-10 (abbreviated for space)
function generateLevel4Content(): string {
  return `# Methods & Functions - Code Reusability\n\n## Page 1: Introduction to Methods\n\nMethods are blocks of code that perform specific tasks and can be reused...\n\n[Content continues with 6-7 pages covering methods, parameters, return types, method overloading, recursion, etc.]`;
}

function generateLevel4MCQs(): MCQQuestion[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `mcq-4-${i + 1}`,
    question: `Methods question ${i + 1} about parameters, return types, or method overloading`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4),
    explanation: 'Relevant explanation about methods and functions.'
  }));
}

function generateLevel4CodingQuestions(): CodingQuestion[] {
  const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = [
    'Easy', 'Easy', 'Easy', 'Easy', 'Easy',
    'Medium', 'Medium', 'Medium', 'Medium', 'Medium',
    'Hard', 'Hard', 'Hard', 'Hard', 'Hard'
  ];
  return difficulties.map((difficulty, i) => ({
    id: `code-4-${i + 1}`,
    title: `Methods Problem ${i + 1}`,
    description: `Create a method to solve this ${difficulty} problem.`,
    difficulty,
    starterCode: `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    testCases: [{ input: 'test', expectedOutput: 'output' }],
    points: difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15
  }));
}

function generateLevel5Content(): string {
  return `# Object-Oriented Programming Basics\n\n## Page 1: Classes and Objects\n\nA class is a blueprint for creating objects...\n\n[Content continues with 7-8 pages]`;
}

function generateLevel5MCQs(): MCQQuestion[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `mcq-5-${i + 1}`,
    question: `OOP basics question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4),
    explanation: 'OOP explanation'
  }));
}

function generateLevel5CodingQuestions(): CodingQuestion[] {
  const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = [
    'Easy', 'Easy', 'Easy', 'Easy', 'Easy',
    'Medium', 'Medium', 'Medium', 'Medium', 'Medium',
    'Hard', 'Hard', 'Hard', 'Hard', 'Hard'
  ];
  return difficulties.map((difficulty, i) => ({
    id: `code-5-${i + 1}`,
    title: `OOP Problem ${i + 1}`,
    description: `${difficulty} OOP problem`,
    difficulty,
    starterCode: `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    testCases: [{ input: 'test', expectedOutput: 'output' }],
    points: difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15
  }));
}

function generateLevel6Content(): string {
  return `# Advanced OOP - Inheritance & Polymorphism\n\n## Page 1: Understanding Inheritance\n\nInheritance allows a class to inherit properties and methods from another class...\n\n[Medium difficulty content - 6 pages]`;
}

function generateLevel6MCQs(): MCQQuestion[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `mcq-6-${i + 1}`,
    question: `Inheritance & Polymorphism question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4),
    explanation: 'Inheritance explanation'
  }));
}

function generateLevel6CodingQuestions(): CodingQuestion[] {
  const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = [
    'Easy', 'Easy', 'Easy', 'Easy', 'Easy',
    'Medium', 'Medium', 'Medium', 'Medium', 'Medium',
    'Hard', 'Hard', 'Hard', 'Hard', 'Hard'
  ];
  return difficulties.map((difficulty, i) => ({
    id: `code-6-${i + 1}`,
    title: `Inheritance Problem ${i + 1}`,
    description: `${difficulty} inheritance problem`,
    difficulty,
    starterCode: `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    testCases: [{ input: 'test', expectedOutput: 'output' }],
    points: difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15
  }));
}

function generateLevel7Content(): string {
  return `# Exception Handling - Managing Errors\n\n## Page 1: Introduction to Exceptions\n\nExceptions are events that disrupt normal program flow...\n\n[Medium difficulty content - 6 pages]`;
}

function generateLevel7MCQs(): MCQQuestion[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `mcq-7-${i + 1}`,
    question: `Exception handling question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4),
    explanation: 'Exception handling explanation'
  }));
}

function generateLevel7CodingQuestions(): CodingQuestion[] {
  const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = [
    'Easy', 'Easy', 'Easy', 'Easy', 'Easy',
    'Medium', 'Medium', 'Medium', 'Medium', 'Medium',
    'Hard', 'Hard', 'Hard', 'Hard', 'Hard'
  ];
  return difficulties.map((difficulty, i) => ({
    id: `code-7-${i + 1}`,
    title: `Exception Handling Problem ${i + 1}`,
    description: `${difficulty} exception problem`,
    difficulty,
    starterCode: `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    testCases: [{ input: 'test', expectedOutput: 'output' }],
    points: difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15
  }));
}

function generateLevel8Content(): string {
  return `# Collections Framework - Data Structures\n\n## Page 1: Introduction to Collections\n\nThe Java Collections Framework provides data structures and algorithms...\n\n[Medium-Hard difficulty content - 7 pages]`;
}

function generateLevel8MCQs(): MCQQuestion[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `mcq-8-${i + 1}`,
    question: `Collections Framework question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4),
    explanation: 'Collections explanation'
  }));
}

function generateLevel8CodingQuestions(): CodingQuestion[] {
  const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = [
    'Easy', 'Easy', 'Easy', 'Easy', 'Easy',
    'Medium', 'Medium', 'Medium', 'Medium', 'Medium',
    'Hard', 'Hard', 'Hard', 'Hard', 'Hard'
  ];
  return difficulties.map((difficulty, i) => ({
    id: `code-8-${i + 1}`,
    title: `Collections Problem ${i + 1}`,
    description: `${difficulty} collections problem`,
    difficulty,
    starterCode: `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    testCases: [{ input: 'test', expectedOutput: 'output' }],
    points: difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15
  }));
}

function generateLevel9Content(): string {
  return `# File I/O & Serialization - Data Persistence\n\n## Page 1: Reading and Writing Files\n\nFile I/O allows programs to read from and write to files...\n\n[Hard difficulty content - 7 pages]`;
}

function generateLevel9MCQs(): MCQQuestion[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `mcq-9-${i + 1}`,
    question: `File I/O question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4),
    explanation: 'File I/O explanation'
  }));
}

function generateLevel9CodingQuestions(): CodingQuestion[] {
  const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = [
    'Easy', 'Easy', 'Easy', 'Easy', 'Easy',
    'Medium', 'Medium', 'Medium', 'Medium', 'Medium',
    'Hard', 'Hard', 'Hard', 'Hard', 'Hard'
  ];
  return difficulties.map((difficulty, i) => ({
    id: `code-9-${i + 1}`,
    title: `File I/O Problem ${i + 1}`,
    description: `${difficulty} file handling problem`,
    difficulty,
    starterCode: `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    testCases: [{ input: 'test', expectedOutput: 'output' }],
    points: difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15
  }));
}

function generateLevel10Content(): string {
  return `# Advanced Java - Streams, Lambda & Threads\n\n## Page 1: Lambda Expressions\n\nLambda expressions enable functional programming in Java...\n\n[Hard difficulty content - 8 pages]`;
}

function generateLevel10MCQs(): MCQQuestion[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `mcq-10-${i + 1}`,
    question: `Advanced Java question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4),
    explanation: 'Advanced Java explanation'
  }));
}

function generateLevel10CodingQuestions(): CodingQuestion[] {
  const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = [
    'Easy', 'Easy', 'Easy', 'Easy', 'Easy',
    'Medium', 'Medium', 'Medium', 'Medium', 'Medium',
    'Hard', 'Hard', 'Hard', 'Hard', 'Hard'
  ];
  return difficulties.map((difficulty, i) => ({
    id: `code-10-${i + 1}`,
    title: `Advanced Problem ${i + 1}`,
    description: `${difficulty} advanced Java problem`,
    difficulty,
    starterCode: `public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    testCases: [{ input: 'test', expectedOutput: 'output' }],
    points: difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15
  }));
}

export const languages = [
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'python', name: 'Python', icon: '🐍' },
];

// Generate leaderboard from real registered users
export function generateRealLeaderboard(): UserStats[] {
  const registeredUsers = localStorage.getItem('registeredUsers');
  const users = registeredUsers ? JSON.parse(registeredUsers) : [];
  
  const leaderboardData: UserStats[] = users.map((user: any) => {
    // Get all localStorage keys for this user's progress
    let bestProgress = null;
    let bestScore = 0;
    let totalTimeSpent = 0;
    let maxLevelsCompleted = 0;
    
    // Check all possible progress keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('progress_')) {
        try {
          const progress = JSON.parse(localStorage.getItem(key) || '{}');
          if (progress.userId === user.id) {
            const totalScore = progress.scores?.reduce((sum: number, score: any) => sum + score.totalScore, 0) || 0;
            const avgScore = progress.scores?.length > 0 ? Math.round(totalScore / progress.scores.length) : 0;
            
            // Track time from all languages
            totalTimeSpent += progress.timeSpent || 0;
            
            // Track max levels completed
            const levelsCount = progress.levelsCompleted?.length || 0;
            if (levelsCount > maxLevelsCompleted) {
              maxLevelsCompleted = levelsCount;
            }
            
            // Use best score
            if (avgScore > bestScore) {
              bestScore = avgScore;
              bestProgress = progress;
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
    
    return {
      userId: user.id,
      username: user.username,
      totalScore: bestScore,
      timeSpent: totalTimeSpent,
      levelsCompleted: maxLevelsCompleted,
      rank: 0, // Will be calculated after sorting
      progressPercentage: bestProgress?.progressPercentage || 0
    };
  });
  
  // Sort by total score descending, then by time spent ascending as tiebreaker
  leaderboardData.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.timeSpent - b.timeSpent;
  });
  
  // Assign ranks
  leaderboardData.forEach((stats, index) => {
    stats.rank = index + 1;
  });
  
  return leaderboardData;
}

// Keep for backwards compatibility
export function generateMockLeaderboard() {
  return generateRealLeaderboard();
}
