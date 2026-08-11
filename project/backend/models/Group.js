const mongoose = require('mongoose');

// ---- GROUP (Classroom) MODEL ----
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
  },
  description: { type: String, default: '' },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  students: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, default: 'student' },
  }],
  joinCode: {
    type: String,
    unique: true,
    uppercase: true,
  },
  isActive: { type: Boolean, default: true },
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  announcements: [{
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

// Auto-generate join code
groupSchema.pre('save', function (next) {
  if (!this.joinCode) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.joinCode = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  next();
});

const Group = mongoose.model('Group', groupSchema);

// ---- ASSIGNMENT MODEL ----
const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
  },
  description: { type: String, default: '' },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  }],
  dueDate: { type: Date },
  maxScore: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
    submittedAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    status: { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
  }],
}, {
  timestamps: true,
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = { Group, Assignment };
