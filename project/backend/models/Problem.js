const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  category: {
    type: String,
    enum: ['Arrays', 'Strings', 'LinkedList', 'Trees', 'Graphs', 'DP', 'Math', 'Sorting', 'Searching', 'Recursion', 'Other'],
    default: 'Other',
  },
  tags: [{ type: String }],
  constraints: { type: String, default: '' },
  examples: [{
    input: String,
    output: String,
    explanation: String,
  }],
  testCases: [testCaseSchema],
  starterCode: {
    python: { type: String, default: '# Write your solution here\n' },
    javascript: { type: String, default: '// Write your solution here\n' },
    cpp: { type: String, default: '// Write your solution here\n' },
    java: { type: String, default: '// Write your solution here\n' },
    c: { type: String, default: '// Write your solution here\n' },
  },
  hints: [{ type: String }],
  solution: {
    python: { type: String, default: '' },
    javascript: { type: String, default: '' },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  isDailyChallenge: { type: Boolean, default: false },
  dailyChallengeDate: { type: Date },
  acceptanceRate: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },
  points: { type: Number, default: 10 },
}, {
  timestamps: true,
});

// Auto-generate slug from title
problemSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Problem', problemSchema);
