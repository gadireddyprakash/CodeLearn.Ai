const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
  profile: {
    fullName: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    avatar: { type: String, default: '' },
    mobile: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' },
    education: [{
      institution: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number,
    }],
    skills: [{ type: String }],
    experience: [{
      company: String,
      role: String,
      startDate: String,
      endDate: String,
      description: String,
    }],
  },
  stats: {
    problemsSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    rank: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    levelsCompleted: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // in minutes
    languagesUsed: [{ type: String }],
    topicsCompleted: [{ type: String }],
  },
  progress: {
    unlockedLevels: {
      type: Map,
      of: Number,
      default: { python: 1, javascript: 1, cpp: 1, java: 1 }
    },
    levelScores: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  isBlocked: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  notifications: [{
    message: String,
    type: { type: String, enum: ['info', 'success', 'warning', 'error'] },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
  notes: [{
    title: String,
    content: String,
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }],
  resume: {
    generated: { type: Boolean, default: false },
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    lastGenerated: { type: Date },
    score: { type: Number, default: 0 },
    analysis: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  // Stores submitted exam data for each level
  examSubmissions: [{
    language: String,
    levelNumber: Number,
    submittedAt: { type: Date, default: Date.now },
    mcqAnswers: { type: mongoose.Schema.Types.Mixed },
    mcqScore: Number,
    mcqTotal: Number,
    codingAnswers: { type: mongoose.Schema.Types.Mixed }, // { problemId: code }
    codingScore: Number,
    codingTotal: Number,
    finalScore: Number,
    passed: Boolean,
    violations: { type: Number, default: 0 },
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (no sensitive data)
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    profile: this.profile,
    stats: this.stats,
    progress: this.progress,
    groups: this.groups,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
