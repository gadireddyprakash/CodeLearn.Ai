const express = require('express');
const router = express.Router();
const { generateResume, analyzeResume, getRecommendations, chat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/resume/generate', protect, generateResume);
router.post('/resume/analyze', protect, analyzeResume);
router.get('/recommendations', protect, getRecommendations);
router.post('/chat', protect, chat);

module.exports = router;
