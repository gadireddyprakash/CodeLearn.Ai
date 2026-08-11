const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
  },
  language: {
    type: String,
    required: true,
    enum: ['python', 'javascript', 'cpp', 'c', 'java', 'go', 'rust'],
  },
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending'],
    default: 'Pending',
  },
  testResults: [{
    testCase: Number,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    isHidden: Boolean,
    executionTime: Number,
    memoryUsed: Number,
  }],
  passedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  executionTime: { type: Number, default: 0 }, // ms
  memoryUsed: { type: Number, default: 0 }, // KB
  isPlayground: { type: Boolean, default: false },
  customInput: { type: String, default: '' },
  output: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  score: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Submission', submissionSchema);
