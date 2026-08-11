const express = require('express');
const router = express.Router();
const {
  getLevels, getLevelDetails, evaluateLevel, evaluateMCQ,
  adminGetLevels, adminGetLevel, adminUpdateLevel
} = require('../controllers/levelController');
const { protect, authorize } = require('../middleware/auth');

// All level routes require auth
router.use(protect);

// Student routes
router.get('/:language', getLevels);
router.post('/evaluate', evaluateLevel);
router.post('/evaluate-mcq', evaluateMCQ);
router.get('/:language/:levelNumber', getLevelDetails);

// Admin routes
router.get('/admin/:language/all', authorize('admin'), adminGetLevels);
router.get('/admin/:language/:levelNumber', authorize('admin'), adminGetLevel);
router.put('/admin/:id', authorize('admin'), adminUpdateLevel);

module.exports = router;
