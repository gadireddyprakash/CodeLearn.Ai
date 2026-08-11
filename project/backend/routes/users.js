const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ isBlocked: false })
      .select('username profile.avatar stats createdAt')
      .sort({ 'stats.score': -1 })
      .limit(50);

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      id: u._id,
      username: u.username,
      avatar: u.profile?.avatar || '',
      score: u.stats.score,
      problemsSolved: u.stats.problemsSolved,
      streak: u.stats.streak,
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id/profile  — public profile
router.get('/:id/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -notes -resume.data');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const recentSubmissions = await Submission.find({ user: req.params.id, status: 'Accepted' })
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, user: user.toPublicJSON(), recentSubmissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/notes — save note
router.post('/notes', protect, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const user = await User.findById(req.user._id);
    user.notes.push({ title, content, tags: tags || [] });
    await user.save({ validateBeforeSave: false });
    res.status(201).json({ success: true, notes: user.notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/notes
router.get('/notes', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notes');
    res.json({ success: true, notes: user.notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/users/notes/:noteId
router.delete('/notes/:noteId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { notes: { _id: req.params.noteId } } });
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({ success: true, notifications: user.notifications.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/notifications/read — mark all read
router.put('/notifications/read', protect, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $set: { 'notifications.$[].read': true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- ADMIN ROUTES ----
// GET /api/users/admin/all
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/admin/:id/block
router.put('/admin/:id/block', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: req.body.isBlocked }, { new: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/admin/:id/role
router.put('/admin/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/admin/:id
router.put('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { username, email, password, role, fullName } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (fullName !== undefined) {
      if (!user.profile) user.profile = {};
      user.profile.fullName = fullName;
    }
    if (password) {
      user.password = password; // pre-save hook will hash it
    }

    await user.save();
    res.json({ success: true, user: user.toPublicJSON(), message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// DELETE /api/users/admin/:id
router.delete('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin accounts' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/admin/stats
router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalTeachers, totalProblems, totalSubmissions, activeToday] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Problem.countDocuments({ isActive: true }),
      Submission.countDocuments(),
      User.countDocuments({ 'stats.lastActive': { $gte: new Date(Date.now() - 86400000) } }),
    ]);
    res.json({ success: true, stats: { totalUsers, totalStudents, totalTeachers, totalProblems, totalSubmissions, activeToday } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

