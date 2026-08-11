require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const connectDB = require('../config/db');

const DEFAULT_CODE = {
  python: '# Write your solution here\n',
  javascript: '// Write your solution here\n',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  // Write your solution here\n  return 0;\n}\n',
  java: 'import java.util.*;\npublic class Solution {\n  public static void main(String[] args) {\n    // Write your solution here\n  }\n}\n',
  c: '#include <stdio.h>\nint main() {\n  // Write your solution here\n  return 0;\n}\n',
};

const fixProblems = async () => {
  await connectDB();
  console.log('🔄 Fixing Problem starter code...');

  try {
    const problems = await Problem.find({});
    let updatedCount = 0;

    for (let prob of problems) {
      let needsUpdate = false;
      
      const newStarterCode = { ...prob.starterCode };
      const newSolution = { ...prob.solution };

      for (const lang of ['python', 'javascript', 'cpp', 'java', 'c']) {
        if (prob.starterCode && prob.starterCode[lang] && prob.starterCode[lang] !== DEFAULT_CODE[lang]) {
          // Move code to solution if solution is empty
          if (!newSolution[lang] || newSolution[lang] === '') {
             newSolution[lang] = prob.starterCode[lang];
          }
          // Reset starter code to default template
          newStarterCode[lang] = DEFAULT_CODE[lang];
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        prob.starterCode = newStarterCode;
        prob.solution = newSolution;
        // Don't validate because some seed data might not perfectly match schemas
        await Problem.updateOne({ _id: prob._id }, { $set: { starterCode: newStarterCode, solution: newSolution } });
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} problems.`);
  } catch (error) {
    console.error('❌ Error fixing problems:', error);
  } finally {
    process.exit(0);
  }
};

fixProblems();
