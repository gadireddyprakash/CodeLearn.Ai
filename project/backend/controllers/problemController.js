const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

// @desc   Get all problems
// @route  GET /api/problems
// @access Public
const getProblems = async (req, res) => {
  try {
    const { difficulty, category, tag, search, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const problems = await Problem.find(filter)
      .select('-testCases -solution -starterCode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Problem.countDocuments(filter);

    // If user is authenticated, mark solved problems
    res.json({
      success: true,
      problems,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all problems for admin (includes testCases, starterCode, solution)
// @route  GET /api/problems/admin/all
// @access Private (admin)
const getAdminProblems = async (req, res) => {
  try {
    const problems = await Problem.find({}).sort({ createdAt: -1 });
    res.json({ success: true, problems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single problem
// @route  GET /api/problems/:slug
// @access Public
const getProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug, isActive: true })
      .select('-solution');

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Only return visible test cases
    const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);
    const result = problem.toObject();
    result.testCases = visibleTestCases;

    res.json({ success: true, problem: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get daily challenge
// @route  GET /api/problems/daily
// @access Public
const getDailyChallenge = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let daily = await Problem.findOne({
      isDailyChallenge: true,
      dailyChallengeDate: { $gte: today, $lt: tomorrow },
      isActive: true,
    }).select('-solution -testCases');

    let yesterdayDaily = await Problem.findOne({
      isDailyChallenge: true,
      dailyChallengeDate: { $gte: yesterday, $lt: today },
      isActive: true,
    }).select('-solution -testCases');

    // Fallback: pick random medium problems
    if (!daily || !yesterdayDaily) {
      const count = await Problem.countDocuments({ difficulty: 'Medium', isActive: true });
      if (!daily && count > 0) {
        const random = Math.floor(Math.random() * count);
        daily = await Problem.findOne({ difficulty: 'Medium', isActive: true })
          .skip(random)
          .select('-solution -testCases');
      }
      if (!yesterdayDaily && count > 1) {
        const random = Math.floor(Math.random() * (count - 1));
        yesterdayDaily = await Problem.findOne({ difficulty: 'Medium', isActive: true })
          .skip(random)
          .select('-solution -testCases');
      }
    }

    res.json({ success: true, problem: daily, yesterdayProblem: yesterdayDaily });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create problem (admin/teacher)
// @route  POST /api/problems
// @access Private (admin/teacher)
const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update problem
// @route  PUT /api/problems/:id
// @access Private (admin/teacher)
const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete problem
// @route  DELETE /api/problems/:id
// @access Private (admin)
const deleteProblem = async (req, res) => {
  try {
    await Problem.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Problem removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProblems, getAdminProblems, getProblem, getDailyChallenge, createProblem, updateProblem, deleteProblem };
