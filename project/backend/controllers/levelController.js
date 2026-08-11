const Level = require('../models/Level');
const User = require('../models/User');
const Problem = require('../models/Problem');
const { runTestCases } = require('../utils/judge0');
const { callAI } = require('../utils/ai');

// Central AI helper wrapper
const callClaude = callAI;

// ─── STUDENT ROUTES ────────────────────────────────────────────────────────────

// @desc   Get all levels for a language
// @route  GET /api/levels/:language
// @access Private
exports.getLevels = async (req, res) => {
  try {
    const { language } = req.params;
    const levels = await Level.find({ language })
      .select('levelNumber title')
      .sort('levelNumber');

    const user = await User.findById(req.user._id);
    const unlockedLevel = user.progress?.unlockedLevels?.get(language) || 1;
    const scores = user.progress?.levelScores || new Map();

    const result = levels.map(l => ({
      id: l._id,
      levelNumber: l.levelNumber,
      title: l.title,
      isUnlocked: l.levelNumber <= unlockedLevel,
      score: scores.get ? (scores.get(`${language}_${l.levelNumber}`) || 0) : 0,
    }));

    res.json({ success: true, levels: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get full details of a specific level
// @route  GET /api/levels/:language/:levelNumber
// @access Private
exports.getLevelDetails = async (req, res) => {
  try {
    const { language, levelNumber } = req.params;
    const levelNum = parseInt(levelNumber);

    const user = await User.findById(req.user._id);
    const unlockedLevel = user.progress?.unlockedLevels?.get(language) || 1;

    if (levelNum > unlockedLevel) {
      return res.status(403).json({ success: false, message: 'This level is locked.' });
    }

    const level = await Level.findOne({ language, levelNumber: levelNum })
      .populate({
        path: 'codingQuestions',
        select: 'title description difficulty examples testCases constraints hints starterCode',
      });

    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    // Strip correct answers from MCQs before sending to client
    const safeMcqs = level.mcqs.map((mcq, idx) => ({
      id: mcq._id || idx,
      question: mcq.question,
      options: mcq.options,
    }));

    // Limit to 10 MCQs and 10 coding questions
    res.json({
      success: true,
      level: {
        id: level._id,
        levelNumber: level.levelNumber,
        title: level.title,
        conceptText: level.conceptText,
        youtubeUrl: level.youtubeUrl,
        mcqs: safeMcqs.slice(0, 10),
        codingQuestions: level.codingQuestions.slice(0, 10),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Evaluate MCQ submission
// @route  POST /api/levels/evaluate-mcq
// @access Private
exports.evaluateMCQ = async (req, res) => {
  try {
    const { language, levelNumber, mcqAnswers } = req.body;
    const levelNum = parseInt(levelNumber);

    const level = await Level.findOne({ language, levelNumber: levelNum });
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });

    const mcqs = level.mcqs.slice(0, 10);
    let mcqScore = 0;
    mcqs.forEach((mcq, idx) => {
      const key = String(mcq._id || idx);
      const answer = mcqAnswers[key];
      if (answer === mcq.correctOptionIndex || Number(answer) === mcq.correctOptionIndex) {
        mcqScore += 1;
      }
    });

    const mcqPercentage = mcqs.length > 0 ? (mcqScore / mcqs.length) * 100 : 100;

    res.json({
      success: true,
      passed: mcqPercentage >= 60,
      score: mcqScore,
      total: mcqs.length,
      percentage: Math.round(mcqPercentage),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Evaluate full level submission (coding) and save exam
// @route  POST /api/levels/evaluate
// @access Private
exports.evaluateLevel = async (req, res) => {
  try {
    const { language, levelNumber, mcqAnswers, codingAnswers, mcqScore, mcqTotal, violations } = req.body;
    const levelNum = parseInt(levelNumber);

    const level = await Level.findOne({ language, levelNumber: levelNum }).populate('codingQuestions');
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });

    const codingQs = level.codingQuestions.slice(0, 10);

    // Evaluate Code via Piston
    let codingScore = 0;
    const codingFeedback = [];
    let aiContext = '';

    for (const prob of codingQs) {
      const codeStr = codingAnswers[prob._id] || '';
      if (!codeStr.trim()) {
        codingFeedback.push({ problemId: prob._id, title: prob.title, passed: false, passedCount: 0, totalCount: prob.testCases?.length || 0, message: 'No code provided.' });
        aiContext += `\nProblem: ${prob.title}\nStatus: No code provided.\n`;
        continue;
      }

      const testResults = await runTestCases(codeStr, language, prob.testCases || []);
      const passedCount = testResults.filter(r => r.passed).length;
      const allPassed = passedCount === testResults.length;
      if (allPassed) codingScore += 1;

      codingFeedback.push({
        problemId: prob._id,
        title: prob.title,
        passed: allPassed,
        passedCount,
        totalCount: testResults.length,
      });
      aiContext += `\nProblem: ${prob.title}\nPassed: ${passedCount}/${testResults.length}\n`;
    }

    const codingPercentage = codingQs.length > 0 ? (codingScore / codingQs.length) * 100 : 100;
    const mcqPct = mcqTotal > 0 ? Math.round((mcqScore / mcqTotal) * 100) : 100;
    const finalScore = Math.round(codingPercentage);
    const passedLevel = finalScore >= 60;

    // AI Feedback
    let aiFeedback = '';
    if (aiContext.trim()) {
      const sysPrompt = `You are a programming instructor evaluating a student's Level ${levelNum} ${language} exam. Give encouraging, concise feedback (3-4 sentences) on their performance.`;
      const aiResult = await callClaude(sysPrompt, aiContext);
      aiFeedback = aiResult.mock
        ? `Good effort on Level ${levelNum}! ${passedLevel ? 'You passed the coding section — keep it up!' : 'Review the concepts and practice more to improve your score.'} Focus on writing clean, well-structured code.`
        : aiResult.text;
    }

    // Update user progress + save exam
    const user = await User.findById(req.user._id);
    if (passedLevel) {
      const currentUnlocked = user.progress?.unlockedLevels?.get(language) || 1;
      if (levelNum === currentUnlocked && levelNum < 10) {
        user.progress.unlockedLevels.set(language, levelNum + 1);
      }
      const existingScore = user.progress?.levelScores?.get ? (user.progress.levelScores.get(`${language}_${levelNum}`) || 0) : 0;
      if (finalScore > existingScore) {
        user.progress.levelScores.set(`${language}_${levelNum}`, finalScore);
        user.stats.score += (finalScore - existingScore);
        user.stats.levelsCompleted = Math.max(user.stats.levelsCompleted || 0, levelNum);
      }
    }

    // Save exam submission (always, even if failed)
    const existingIdx = user.examSubmissions?.findIndex(
      s => s.language === language && s.levelNumber === levelNum
    );
    const examEntry = {
      language,
      levelNumber: levelNum,
      submittedAt: new Date(),
      mcqAnswers,
      mcqScore: mcqScore || 0,
      mcqTotal: mcqTotal || 0,
      codingAnswers: codingAnswers || {},
      codingScore,
      codingTotal: codingQs.length,
      finalScore,
      passed: passedLevel,
      violations: violations || 0,
    };

    if (!user.examSubmissions) user.examSubmissions = [];
    if (existingIdx >= 0) {
      // Update if new score is better
      if (finalScore > (user.examSubmissions[existingIdx].finalScore || 0)) {
        user.examSubmissions[existingIdx] = examEntry;
      }
    } else {
      user.examSubmissions.push(examEntry);
    }

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      passed: passedLevel,
      score: finalScore,
      mcqPercentage: mcqPct,
      codingPercentage: Math.round(codingPercentage),
      codingFeedback,
      aiFeedback,
    });
  } catch (error) {
    console.error('evaluateLevel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN ROUTES ──────────────────────────────────────────────────────────────

// @desc   Get all levels for a language (admin - full content with MCQs)
// @route  GET /api/levels/admin/:language/all
// @access Admin
exports.adminGetLevels = async (req, res) => {
  try {
    const { language } = req.params;
    const levels = await Level.find({ language })
      .populate('codingQuestions', 'title difficulty slug')
      .sort('levelNumber');
    res.json({ success: true, levels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single level with full MCQs (admin)
// @route  GET /api/levels/admin/:language/:levelNumber
// @access Admin
exports.adminGetLevel = async (req, res) => {
  try {
    const { language, levelNumber } = req.params;
    const level = await Level.findOne({ language, levelNumber: parseInt(levelNumber) })
      .populate('codingQuestions', 'title difficulty slug description');
    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });
    res.json({ success: true, level });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update level (MCQs, title, conceptText, codingQuestions)
// @route  PUT /api/levels/admin/:id
// @access Admin
exports.adminUpdateLevel = async (req, res) => {
  try {
    const { title, conceptText, youtubeUrl, mcqs, codingQuestions } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (conceptText !== undefined) updateData.conceptText = conceptText;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
    if (mcqs !== undefined) updateData.mcqs = mcqs;
    if (codingQuestions !== undefined) updateData.codingQuestions = codingQuestions;

    const level = await Level.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate('codingQuestions', 'title difficulty slug');

    if (!level) return res.status(404).json({ success: false, message: 'Level not found' });

    res.json({ success: true, level });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
