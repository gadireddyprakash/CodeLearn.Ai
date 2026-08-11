const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { executeCode, runTestCases } = require('../utils/judge0');

// @desc   Run code (playground / custom input)
// @route  POST /api/code/run
// @access Private
const runCode = async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ success: false, message: 'Code and language are required' });
    }

    const result = await executeCode(code, language, input);

    // Save playground submission
    await Submission.create({
      user: req.user._id,
      language,
      code,
      customInput: input,
      output: result.stdout,
      errorMessage: result.stderr,
      status: result.statusId === 3 ? 'Accepted' : 'Runtime Error',
      isPlayground: true,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
    });

    res.json({
      success: true,
      output: result.stdout,
      error: result.stderr || result.compileOutput,
      status: result.status,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Submit code for a problem
// @route  POST /api/code/submit/:problemId
// @access Private
const submitCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    const { problemId } = req.params;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Run against all test cases
    const testResults = await runTestCases(code, language, problem.testCases);
    const passedCount = testResults.filter(r => r.passed).length;
    const totalCount = testResults.length;
    const allPassed = passedCount === totalCount;

    const statusStr = allPassed ? 'Accepted'
      : testResults.some(r => r.error?.includes('Compilation'))
        ? 'Compilation Error'
        : testResults.some(r => r.error?.includes('Time'))
          ? 'Time Limit Exceeded'
          : 'Wrong Answer';

    // Save submission
    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      language,
      code,
      status: statusStr,
      testResults,
      passedCount,
      totalCount,
      score: Math.round((passedCount / totalCount) * problem.points),
    });

    // Update problem stats
    problem.totalSubmissions += 1;
    if (allPassed) problem.acceptedSubmissions += 1;
    problem.acceptanceRate = Math.round((problem.acceptedSubmissions / problem.totalSubmissions) * 100);
    await problem.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    user.stats.totalSubmissions += 1;
    if (allPassed) {
      // Check if this problem was previously solved
      const prevAccepted = await Submission.findOne({
        user: req.user._id,
        problem: problemId,
        status: 'Accepted',
        _id: { $ne: submission._id },
      });
      if (!prevAccepted) {
        user.stats.problemsSolved += 1;
        user.stats.score += problem.points;
        // Daily task bonus +10 points
        if (problem.isDailyChallenge) {
          user.stats.score += 10;
        }
      }
      user.stats.acceptedSubmissions += 1;
    }
    if (!user.stats.languagesUsed.includes(language)) {
      user.stats.languagesUsed.push(language);
    }
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      submission: {
        id: submission._id,
        status: statusStr,
        passedCount,
        totalCount,
        score: submission.score,
        testResults: testResults.map(r => ({
          ...r,
          // Hide hidden test case inputs/outputs
          input: r.isHidden ? '(hidden)' : r.input,
          expectedOutput: r.isHidden ? '(hidden)' : r.expectedOutput,
          actualOutput: r.isHidden && !r.passed ? '(hidden)' : r.actualOutput,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get user's submissions
// @route  GET /api/code/submissions
// @access Private
const getSubmissions = async (req, res) => {
  try {
    const { problemId, limit = 20, page = 1 } = req.query;
    const filter = { user: req.user._id };
    if (problemId) filter.problem = problemId;

    const submissions = await Submission.find(filter)
      .populate('problem', 'title difficulty slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Run code for exam (no DB save, just execute)
// @route  POST /api/code/run-level
// @access Private
const runLevelCode = async (req, res) => {
  try {
    const { code, language, input = '', testCases } = req.body;

    if (!code || !language) {
      return res.status(400).json({ success: false, message: 'Code and language are required' });
    }

    const { executeCode, runTestCases } = require('../utils/judge0');

    if (testCases && Array.isArray(testCases) && testCases.length > 0) {
      // Run against provided test cases
      const results = await runTestCases(code, language, testCases);
      const passedCount = results.filter(r => r.passed).length;
      return res.json({ success: true, results, passedCount, totalCount: results.length });
    }

    // Single custom input run
    const result = await executeCode(code, language, input);
    res.json({
      success: true,
      output: result.stdout,
      error: result.stderr || result.compileOutput,
      status: result.status,
      executionTime: result.executionTime,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { runCode, submitCode, getSubmissions, runLevelCode };
