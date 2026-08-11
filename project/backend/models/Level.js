const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true }
});

const levelSchema = new mongoose.Schema({
  language: { 
    type: String, 
    required: true,
    enum: ['python', 'javascript', 'cpp', 'java'],
    default: 'python'
  },
  levelNumber: { 
    type: Number, 
    required: true,
    min: 1,
    max: 10
  },
  title: { 
    type: String, 
    required: true 
  },
  conceptText: { 
    type: String, 
    required: true 
  },
  youtubeUrl: {
    type: String,
    default: ''
  },
  mcqs: [mcqSchema],
  codingQuestions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Problem' 
  }]
}, { timestamps: true });

// Ensure combination of language and levelNumber is unique
levelSchema.index({ language: 1, levelNumber: 1 }, { unique: true });

module.exports = mongoose.model('Level', levelSchema);
