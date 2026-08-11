const express = require('express');
const router = express.Router();
const {
  getProblems, getAdminProblems, getProblem, getDailyChallenge, createProblem, updateProblem, deleteProblem
} = require('../controllers/problemController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin/all', protect, authorize('admin'), getAdminProblems);
router.get('/', getProblems);
router.get('/daily', getDailyChallenge);
router.get('/:slug', getProblem);
router.post('/', protect, authorize('teacher', 'admin'), createProblem);
router.put('/:id', protect, authorize('teacher', 'admin'), updateProblem);
router.delete('/:id', protect, authorize('admin'), deleteProblem);

module.exports = router;
