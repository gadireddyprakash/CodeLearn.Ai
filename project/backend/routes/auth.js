const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, sendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/send-otp', sendOTP);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// @desc   Seed / reset admin user (dev helper — works in any env so admin is always recoverable)
// @route  POST /api/auth/seed-admin
// @access Public (protected by secret key in body)
router.post('/seed-admin', async (req, res) => {
  try {
    const { secretKey } = req.body;
    // Simple protection so random users can't call this
    const EXPECTED = process.env.ADMIN_SEED_KEY || 'codelearn-setup-2024';
    if (secretKey !== EXPECTED) {
      return res.status(403).json({ success: false, message: 'Invalid secret key' });
    }

    const ADMIN_EMAIL = 'admin@codelearn.com';
    const ADMIN_PASSWORD = 'admin123';
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      // Reset role & password
      existing.role = 'admin';
      existing.password = hashed;
      existing.isBlocked = false;
      existing.isEmailVerified = true;
      await existing.save({ validateBeforeSave: false });
      return res.json({ success: true, message: 'Admin user reset successfully', email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    }

    await User.create({
      username: 'admin',
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'admin',
      isEmailVerified: true,
      isBlocked: false,
    });

    res.status(201).json({ success: true, message: 'Admin user created', email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
